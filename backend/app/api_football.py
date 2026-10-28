import asyncio
import json
import os
import time
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

import httpx

API_BASE = "https://v3.football.api-sports.io"
CACHE_TTL = int(os.environ.get("CACHE_TTL", 300))  # seconds; the free plan allows 100 requests per day
SAMPLE_FILE = Path(__file__).parent / "sample_matches.json"
COLOMBIA = timezone(timedelta(hours=-5))  # Colombia has no DST, so a fixed offset is exact
DAYS_AVAILABLE = 1  # the free plan only serves yesterday, today and tomorrow; other dates answer a "plan" error

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

# day -> {"at": monotonic fetch time, "on": Colombia date of the fetch, "matches": [...]}
# shortcut: one entry per day ever requested, never evicted; fine for browsing a few weeks, prune if memory matters
_cache: dict[date, dict] = {}
_lock = asyncio.Lock()


class UpstreamError(Exception):
    """API-Football answered with an error such as a bad key or an exhausted daily quota."""


async def api_get(path: str, params: dict) -> list[dict]:
    """GET an API-Football endpoint and return its "response" list."""
    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.get(
            f"{API_BASE}{path}", headers={"x-apisports-key": os.environ["API_FOOTBALL_KEY"]}, params=params
        )
        response.raise_for_status()
    body = response.json()
    # API-Football reports a bad key, an exhausted quota or a plan limit with HTTP 200 and an "errors" field.
    if body["errors"]:
        raise UpstreamError(body["errors"])
    return body["response"]


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
        "score": {
            "fullTime": {"home": goals["home"], "away": goals["away"]},
            "halfTime": item["score"]["halftime"],
        },
        "minute": fixture["status"]["elapsed"],
        "round": league["round"],
        "venue": fixture["venue"],
        "referee": fixture["referee"],
    }


def colombia_today() -> date:
    return datetime.now(COLOMBIA).date()


def _fresh(day: date, entry: dict) -> bool:
    # A day fetched after it ended with no match still live is final, so it never needs another request.
    final = day < entry["on"] and not any(m["status"] in ("IN_PLAY", "PAUSED") for m in entry["matches"])
    return final or time.monotonic() - entry["at"] < CACHE_TTL


async def fetch_matches(day: date | None = None) -> tuple[list[dict], bool]:
    """Return the day's matches (default: today in Colombia) and whether they are sample data."""
    if not os.environ.get("API_FOOTBALL_KEY"):
        return json.loads(SAMPLE_FILE.read_text(encoding="utf-8"))["matches"], True

    today = colombia_today()
    day = day or today
    # The lock makes concurrent cache misses share one upstream request.
    async with _lock:
        entry = _cache.get(day)
        if entry and _fresh(day, entry):
            return entry["matches"], False
        try:
            items = await api_get("/fixtures", {"date": day.isoformat(), "timezone": "America/Bogota"})
        except (httpx.HTTPError, UpstreamError):
            if entry:
                entry["at"] = time.monotonic()  # wait a full TTL before spending another request
                return entry["matches"], False
            raise
        _cache[day] = {"at": time.monotonic(), "on": today, "matches": [to_match(item) for item in items]}
        return _cache[day]["matches"], False


def group_by_competition(matches: list[dict]) -> list[dict]:
    groups: dict[int, dict] = {}
    for match in sorted(matches, key=lambda m: m["utcDate"]):
        competition = match["competition"]
        group = groups.setdefault(competition["id"], {**competition, "area": match["area"], "matches": []})
        group["matches"].append(match)
    return list(groups.values())
