import asyncio
import json
import os
import time
from datetime import datetime, timedelta, timezone
from pathlib import Path

import httpx

API_URL = "https://v3.football.api-sports.io/fixtures"
CACHE_TTL = int(os.environ.get("CACHE_TTL", 300))  # seconds; the free plan allows 100 requests per day
SAMPLE_FILE = Path(__file__).parent / "sample_matches.json"
COLOMBIA = timezone(timedelta(hours=-5))  # Colombia has no DST, so a fixed offset is exact

# API-Football short status -> status names the frontend understands
STATUS = {
    "TBD": "TIMED", "NS": "TIMED",
    "1H": "IN_PLAY", "2H": "IN_PLAY", "ET": "IN_PLAY", "P": "IN_PLAY", "LIVE": "IN_PLAY",
    "HT": "PAUSED", "BT": "PAUSED",
    "FT": "FINISHED", "AET": "FINISHED", "PEN": "FINISHED",
    "SUSP": "SUSPENDED", "INT": "SUSPENDED",
    "PST": "POSTPONED",
    "CANC": "CANCELLED", "ABD": "CANCELLED",
    "AWD": "AWARDED", "WO": "AWARDED",
}

_cache: dict = {"at": 0.0, "matches": None}
_lock = asyncio.Lock()


class UpstreamError(Exception):
    """API-Football answered with an error such as a bad key or an exhausted daily quota."""


def _team(team: dict) -> dict:
    return {"id": team["id"], "shortName": team["name"], "crest": team["logo"]}


def to_match(item: dict) -> dict:
    """Map an API-Football fixture to the match shape the frontend reads."""
    fixture, league, teams, goals = item["fixture"], item["league"], item["teams"], item["goals"]
    return {
        "id": fixture["id"],
        "utcDate": fixture["date"],  # ISO 8601 with the Bogota offset; the frontend parses it with Date
        "status": STATUS.get(fixture["status"]["short"], "TIMED"),
        "competition": {"id": league["id"], "name": league["name"], "emblem": league["logo"]},
        "area": {"name": league["country"]},
        "homeTeam": _team(teams["home"]),
        "awayTeam": _team(teams["away"]),
        "score": {"fullTime": {"home": goals["home"], "away": goals["away"]}},
    }


async def fetch_matches() -> tuple[list[dict], bool]:
    """Return today's matches (Colombia date) and whether they are sample data."""
    key = os.environ.get("API_FOOTBALL_KEY")
    if not key:
        return json.loads(SAMPLE_FILE.read_text(encoding="utf-8"))["matches"], True

    # The lock makes concurrent cache misses share one upstream request.
    async with _lock:
        if _cache["matches"] is not None and time.monotonic() - _cache["at"] < CACHE_TTL:
            return _cache["matches"], False
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                response = await client.get(
                    API_URL,
                    headers={"x-apisports-key": key},
                    params={"date": datetime.now(COLOMBIA).date().isoformat(), "timezone": "America/Bogota"},
                )
                response.raise_for_status()
            body = response.json()
            # API-Football reports a bad key or an exhausted quota with HTTP 200 and an "errors" field.
            if body["errors"]:
                raise UpstreamError(body["errors"])
        except (httpx.HTTPError, UpstreamError):
            if _cache["matches"] is not None:
                _cache["at"] = time.monotonic()  # wait a full TTL before spending another request
                return _cache["matches"], False
            raise
        _cache.update(at=time.monotonic(), matches=[to_match(item) for item in body["response"]])
        return _cache["matches"], False


def group_by_competition(matches: list[dict]) -> list[dict]:
    groups: dict[int, dict] = {}
    for match in sorted(matches, key=lambda m: m["utcDate"]):
        competition = match["competition"]
        group = groups.setdefault(competition["id"], {**competition, "area": match["area"], "matches": []})
        group["matches"].append(match)
    return list(groups.values())
