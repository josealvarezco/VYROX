import asyncio
from datetime import datetime, timedelta, timezone

import httpx
import pytest
from fastapi.testclient import TestClient

from app import api_football
from app.main import app

PRIMERA_A = {"id": 239, "name": "Primera A", "country": "Colombia", "logo": "https://media.api-sports.io/football/leagues/239.png"}
PREMIER = {"id": 39, "name": "Premier League", "country": "England", "logo": "https://media.api-sports.io/football/leagues/39.png"}


def team(team_id, name):
    return {"id": team_id, "name": name, "logo": f"https://media.api-sports.io/football/teams/{team_id}.png", "winner": None}


# Trimmed GET /fixtures response from API-Football v3
UPSTREAM = {
    "get": "fixtures",
    "errors": [],
    "results": 2,
    "response": [
        {
            "fixture": {"id": 2002, "date": "2026-10-27T20:00:00-05:00", "status": {"long": "Second Half", "short": "2H", "elapsed": 67}},
            "league": PRIMERA_A,
            "teams": {"home": team(1137, "Millonarios"), "away": team(1135, "Atletico Nacional")},
            "goals": {"home": 1, "away": 0},
        },
        {
            "fixture": {"id": 2001, "date": "2026-10-27T09:30:00-05:00", "status": {"long": "Not Started", "short": "NS", "elapsed": None}},
            "league": PREMIER,
            "teams": {"home": team(42, "Arsenal"), "away": team(49, "Chelsea")},
            "goals": {"home": None, "away": None},
        },
    ],
}
QUOTA_ERROR = {"errors": {"requests": "You have reached the request limit for the day"}, "response": []}


@pytest.fixture(autouse=True)
def fresh_cache():
    api_football._cache.update(at=0.0, matches=None)


@pytest.fixture
def upstream(monkeypatch):
    """Fake API-Football: counts calls and can be switched to fail ("http" or "quota")."""
    state = {"calls": 0, "fail": None}

    async def fake_get(self, url, headers, params):
        state["calls"] += 1
        assert url == "https://v3.football.api-sports.io/fixtures"
        assert headers == {"x-apisports-key": "test-key"}
        colombia_today = datetime.now(timezone(timedelta(hours=-5))).date().isoformat()
        assert params == {"date": colombia_today, "timezone": "America/Bogota"}
        request = httpx.Request("GET", url)
        if state["fail"] == "http":
            return httpx.Response(500, request=request)
        return httpx.Response(200, json=QUOTA_ERROR if state["fail"] == "quota" else UPSTREAM, request=request)

    monkeypatch.setenv("API_FOOTBALL_KEY", "test-key")
    monkeypatch.setattr(httpx.AsyncClient, "get", fake_get)
    return state


def test_without_key_serves_sample_grouped_by_competition(monkeypatch):
    monkeypatch.delenv("API_FOOTBALL_KEY", raising=False)

    body = TestClient(app).get("/api/matches").json()

    assert body["sample"] is True
    assert [c["name"] for c in body["competitions"]] == ["Premier League", "Primera Division"]
    premier = body["competitions"][0]
    assert premier["area"]["name"] == "England"
    times = [m["utcDate"] for m in premier["matches"]]
    assert times == sorted(times) and len(times) == 3


def test_maps_api_football_fixtures_to_frontend_format(upstream):
    body = TestClient(app).get("/api/matches").json()

    assert body["sample"] is False
    premier, primera_a = body["competitions"]  # ordered by first kickoff
    assert premier["name"] == "Premier League"
    assert premier["matches"][0]["status"] == "TIMED"
    assert premier["matches"][0]["score"] == {"fullTime": {"home": None, "away": None}}
    assert primera_a == {
        "id": 239,
        "name": "Primera A",
        "emblem": "https://media.api-sports.io/football/leagues/239.png",
        "area": {"name": "Colombia"},
        "matches": [
            {
                "id": 2002,
                "utcDate": "2026-10-27T20:00:00-05:00",
                "status": "IN_PLAY",
                "competition": {"id": 239, "name": "Primera A", "emblem": "https://media.api-sports.io/football/leagues/239.png"},
                "area": {"name": "Colombia"},
                "homeTeam": {"id": 1137, "shortName": "Millonarios", "crest": "https://media.api-sports.io/football/teams/1137.png"},
                "awayTeam": {"id": 1135, "shortName": "Atletico Nacional", "crest": "https://media.api-sports.io/football/teams/1135.png"},
                "score": {"fullTime": {"home": 1, "away": 0}},
            }
        ],
    }


def test_repeated_requests_within_ttl_hit_upstream_once(upstream):
    for _ in range(3):
        matches, sample = asyncio.run(api_football.fetch_matches())

    assert upstream["calls"] == 1
    assert len(matches) == 2 and sample is False


def test_quota_error_serves_stale_cache_and_waits_a_ttl_to_retry(upstream):
    asyncio.run(api_football.fetch_matches())
    api_football._cache["at"] -= api_football.CACHE_TTL + 1
    upstream["fail"] = "quota"

    for _ in range(2):
        matches, _ = asyncio.run(api_football.fetch_matches())

    assert upstream["calls"] == 2
    assert len(matches) == 2


@pytest.mark.parametrize("failure", ["http", "quota"])
def test_upstream_error_without_cache_returns_502(upstream, failure):
    upstream["fail"] = failure

    response = TestClient(app).get("/api/matches")

    assert response.status_code == 502
