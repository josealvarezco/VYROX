import httpx
import pytest
from fastapi.testclient import TestClient

from app import bookmakers
from app.api_football import UpstreamError
from app.main import app


def bet(name, *values):
    return {"name": name, "values": [{"value": value, "odd": odd} for value, odd in values]}


def response(home="2.88", away="2.45"):
    """The shape of API-Football's /odds, trimmed from a real Primera A answer."""
    return [
        {
            "update": "2026-10-29T00:00:31+00:00",
            "bookmakers": [
                {
                    "name": "Betano",
                    "bets": [
                        bet("Match Winner", ("Home", home), ("Draw", "3.25"), ("Away", away)),
                        bet("Goals Over/Under", ("Over 1.5", "1.25"), ("Under 1.5", "3.75"), ("Over 2.5", "1.85"), ("Under 2.5", "1.95")),
                        bet("Both Teams Score", ("Yes", "1.67"), ("No", "2.10")),
                        bet("Asian Handicap", ("Home -1", "3.10"), ("Away -1", "1.36")),
                    ],
                },
                # No 1.5 line and no both-score market: only the markets it fully quotes.
                {"name": "Pinnacle", "bets": [bet("Match Winner", ("Home", "2.93"), ("Draw", "3.19"), ("Away", "2.50")), bet("Goals Over/Under", ("Over 2.5", "1.90"), ("Under 2.5", "1.93"))]},
                {"name": "Dafabet", "bets": [bet("Asian Handicap", ("Home -1", "3.00"), ("Away -1", "1.40"))]},  # nothing the comparator shows
            ],
        }
    ]


@pytest.fixture
def api(monkeypatch):
    state = {"calls": 0, "reply": response()}

    async def fake_get(path, params):
        assert (path, params) == ("/odds", {"fixture": 77})
        state["calls"] += 1
        if isinstance(state["reply"], Exception):
            raise state["reply"]
        return state["reply"]

    monkeypatch.setattr(bookmakers, "api_get", fake_get)
    monkeypatch.setenv("API_FOOTBALL_KEYS", "test-key")
    bookmakers._odds.clear()
    return state


def get():
    return TestClient(app).get("/api/matches/77/odds")


def expire():
    for entry in bookmakers._odds.values():
        entry["until"] = 0


def test_each_bookmaker_with_the_markets_it_fully_quotes(api):
    body = get().json()

    assert body["updated"] == "2026-10-29T00:00:31+00:00"
    assert [(row["name"], sorted(row["markets"])) for row in body["bookmakers"]] == [
        ("Betano", ["1x2", "btts", "goals_1_5", "goals_2_5"]),
        ("Pinnacle", ["1x2", "goals_2_5"]),
    ]
    betano = body["bookmakers"][0]["markets"]
    assert betano["1x2"] == {side: {"odd": odd, "trend": "stable"} for side, odd in (("home", 2.88), ("draw", 3.25), ("away", 2.45))}
    assert (betano["goals_1_5"]["under"]["odd"], betano["btts"]["no"]["odd"]) == (3.75, 2.1)


def test_odds_are_cached_for_three_hours_and_arrows_show_real_moves(api):
    get()
    get()
    assert api["calls"] == 1

    api["reply"] = response(home="3.00", away="2.30")  # the home side drifts out, the away side shortens
    expire()
    moved = get().json()["bookmakers"][0]["markets"]["1x2"]

    assert api["calls"] == 2
    assert [(moved[side]["odd"], moved[side]["trend"]) for side in ("home", "draw", "away")] == [(3.0, "up"), (3.25, "stable"), (2.3, "down")]


def test_upstream_failure_serves_the_last_odds_or_returns_502(api):
    api["reply"] = UpstreamError({"requests": "quota"})
    assert get().status_code == 502

    api["reply"] = response()
    first = get().json()
    api["reply"] = httpx.ConnectError("down")
    expire()
    assert get().json() == first


def test_a_match_without_odds_or_without_a_key(api, monkeypatch):
    api["reply"] = []
    assert get().json() == {"bookmakers": [], "updated": None}

    monkeypatch.delenv("API_FOOTBALL_KEYS")
    monkeypatch.delenv("API_FOOTBALL_KEY", raising=False)
    bookmakers._odds.clear()
    assert get().json() == {"bookmakers": [], "updated": None}
    assert api["calls"] == 1  # without a key nothing is asked
