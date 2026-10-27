import asyncio

import httpx
import pytest
from fastapi.testclient import TestClient

from app import football_data
from app.main import app

UPSTREAM = {"matches": [{"id": 1, "utcDate": "2026-10-27T19:00:00Z"}]}


@pytest.fixture(autouse=True)
def fresh_cache():
    football_data._cache.update(at=0.0, matches=None)


@pytest.fixture
def upstream(monkeypatch):
    """Fake football-data.org: counts calls and can be switched to fail."""
    state = {"calls": 0, "fail": False}

    async def fake_get(self, url, headers):
        state["calls"] += 1
        assert headers == {"X-Auth-Token": "test-token"}
        request = httpx.Request("GET", url)
        if state["fail"]:
            return httpx.Response(429, request=request)
        return httpx.Response(200, json=UPSTREAM, request=request)

    monkeypatch.setenv("FOOTBALL_DATA_TOKEN", "test-token")
    monkeypatch.setattr(httpx.AsyncClient, "get", fake_get)
    return state


def test_without_token_serves_sample_grouped_by_competition(monkeypatch):
    monkeypatch.delenv("FOOTBALL_DATA_TOKEN", raising=False)

    body = TestClient(app).get("/api/matches").json()

    assert body["sample"] is True
    assert [c["name"] for c in body["competitions"]] == ["Premier League", "Primera Division"]
    premier = body["competitions"][0]
    assert premier["area"]["name"] == "England"
    times = [m["utcDate"] for m in premier["matches"]]
    assert times == sorted(times) and len(times) == 3


def test_repeated_requests_within_ttl_hit_upstream_once(upstream):
    for _ in range(3):
        matches, sample = asyncio.run(football_data.fetch_matches())

    assert upstream["calls"] == 1
    assert matches == UPSTREAM["matches"] and sample is False


def test_upstream_error_serves_stale_cache(upstream):
    asyncio.run(football_data.fetch_matches())
    football_data._cache["at"] -= football_data.CACHE_TTL + 1
    upstream["fail"] = True

    matches, _ = asyncio.run(football_data.fetch_matches())

    assert upstream["calls"] == 2
    assert matches == UPSTREAM["matches"]


def test_upstream_error_without_cache_returns_502(upstream):
    upstream["fail"] = True

    response = TestClient(app).get("/api/matches")

    assert response.status_code == 502
