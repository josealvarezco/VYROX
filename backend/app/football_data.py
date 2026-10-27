import asyncio
import json
import os
import time
from pathlib import Path

import httpx

API_URL = "https://api.football-data.org/v4/matches"
CACHE_TTL = 60  # seconds; the free plan allows 10 requests per minute
SAMPLE_FILE = Path(__file__).parent / "sample_matches.json"

_cache: dict = {"at": 0.0, "matches": None}
_lock = asyncio.Lock()


async def fetch_matches() -> tuple[list[dict], bool]:
    """Return today's matches and whether they are sample data."""
    token = os.environ.get("FOOTBALL_DATA_TOKEN")
    if not token:
        return json.loads(SAMPLE_FILE.read_text(encoding="utf-8"))["matches"], True

    # The lock makes concurrent cache misses share one upstream request.
    async with _lock:
        if _cache["matches"] is not None and time.monotonic() - _cache["at"] < CACHE_TTL:
            return _cache["matches"], False
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                response = await client.get(API_URL, headers={"X-Auth-Token": token})
                response.raise_for_status()
        except httpx.HTTPError:
            if _cache["matches"] is not None:
                return _cache["matches"], False  # stale data beats an error when rate-limited
            raise
        _cache.update(at=time.monotonic(), matches=response.json()["matches"])
        return _cache["matches"], False


def group_by_competition(matches: list[dict]) -> list[dict]:
    groups: dict[int, dict] = {}
    for match in sorted(matches, key=lambda m: m["utcDate"]):
        competition = match["competition"]
        group = groups.setdefault(competition["id"], {**competition, "area": match["area"], "matches": []})
        group["matches"].append(match)
    return list(groups.values())
