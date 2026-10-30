import asyncio
from datetime import date, datetime, timedelta, timezone

import httpx
import pytest
from fastapi.testclient import TestClient

from app import api_football
from app.main import app

PRIMERA_A = {"id": 239, "name": "Primera A", "country": "Colombia", "logo": "https://media.api-sports.io/football/leagues/239.png", "flag": "https://media.api-sports.io/flags/co.svg", "round": "Clausura - 15"}
PREMIER = {"id": 39, "name": "Premier League", "country": "England", "logo": "https://media.api-sports.io/football/leagues/39.png", "flag": "https://media.api-sports.io/flags/gb-eng.svg", "round": "Regular Season - 9"}
COLOMBIA_TODAY = datetime.now(timezone(timedelta(hours=-5))).date()


def team(team_id, name):
    return {"id": team_id, "name": name, "logo": f"https://media.api-sports.io/football/teams/{team_id}.png", "winner": None}


# Trimmed GET /fixtures response from API-Football v3
UPSTREAM = {
    "get": "fixtures",
    "errors": [],
    "results": 2,
    "response": [
        {
            "fixture": {
                "id": 2002,
                "referee": "Wilmar Roldan",
                "date": "2026-10-27T20:00:00-05:00",
                "venue": {"id": 1, "name": "Estadio El Campín", "city": "Bogotá"},
                "status": {"long": "Second Half", "short": "2H", "elapsed": 67},
            },
            "league": PRIMERA_A,
            "teams": {"home": team(1125, "Millonarios"), "away": team(1137, "Atletico Nacional")},
            "goals": {"home": 1, "away": 0},
            "score": {"halftime": {"home": 1, "away": 0}},
        },
        {
            "fixture": {
                "id": 2001,
                "referee": None,
                "date": "2026-10-27T09:30:00-05:00",
                "venue": {"id": None, "name": None, "city": None},
                "status": {"long": "Not Started", "short": "NS", "elapsed": None},
            },
            "league": PREMIER,
            "teams": {"home": team(42, "Arsenal"), "away": team(49, "Chelsea")},
            "goals": {"home": None, "away": None},
            "score": {"halftime": {"home": None, "away": None}},
        },
    ],
}
FINISHED = {**UPSTREAM, "response": [{**UPSTREAM["response"][0], "fixture": {**UPSTREAM["response"][0]["fixture"], "status": {"short": "FT", "elapsed": 90}}}]}
QUOTA_ERROR = {"errors": {"requests": "You have reached the request limit for the day"}, "response": []}


@pytest.fixture(autouse=True)
def fresh_cache():
    api_football._cache.clear()


@pytest.fixture
def upstream(monkeypatch):
    """Fake API-Football: records requested dates; state["fail"] ("http" or "quota") or state["reply"] change the answer."""
    state = {"dates": [], "fail": None, "reply": UPSTREAM}

    async def fake_get(self, url, headers, params):
        state["dates"].append(params["date"])
        assert url == "https://v3.football.api-sports.io/fixtures"
        assert headers == {"x-apisports-key": "test-key"}
        assert params["timezone"] == "America/Bogota"
        request = httpx.Request("GET", url)
        if state["fail"] == "http":
            return httpx.Response(500, request=request)
        return httpx.Response(200, json=QUOTA_ERROR if state["fail"] == "quota" else state["reply"], request=request)

    monkeypatch.setenv("API_FOOTBALL_KEY", "test-key")
    monkeypatch.setattr(httpx.AsyncClient, "get", fake_get)
    return state


def fetch(day=None):
    return asyncio.run(api_football.fetch_matches(day))


def expire_cache():
    for entry in api_football._cache.values():
        entry["at"] -= api_football.CACHE_TTL + 1


def test_without_key_serves_sample_grouped_by_league(monkeypatch):
    monkeypatch.delenv("API_FOOTBALL_KEY", raising=False)

    body = TestClient(app).get("/api/matches").json()

    assert body["sample"] is True
    assert [c["league_name"] for c in body["competitions"]] == [
        "Premier League",
        "Primera A",
        "UEFA Champions League",
        "La Liga",
        "Liga Profesional Argentina",
    ]
    premier = body["competitions"][0]
    assert (premier["league_id"], premier["country"], premier["country_flag"]) == (39, "England", "https://media.api-sports.io/flags/gb-eng.svg")
    times = [m["utcDate"] for m in premier["matches"]]
    assert times == sorted(times) and len(times) == 3


def test_maps_api_football_fixtures_to_frontend_format(upstream):
    body = TestClient(app).get("/api/matches").json()

    assert upstream["dates"] == [COLOMBIA_TODAY.isoformat()]
    assert body["sample"] is False
    premier, primera_a = body["competitions"]  # 39 before 239 in TOP_LEAGUES
    assert premier["league_name"] == "Premier League"
    assert premier["matches"][0]["status"] == "TIMED"
    assert premier["matches"][0]["score"] == {"fullTime": {"home": None, "away": None}, "halfTime": {"home": None, "away": None}}
    league = {
        "league_id": 239,
        "league_name": "Primera A",
        "country": "Colombia",
        "league_logo": "https://media.api-sports.io/football/leagues/239.png",
        "country_flag": "https://media.api-sports.io/flags/co.svg",
    }
    assert primera_a == {
        **league,
        "matches": [
            {
                "id": 2002,
                "utcDate": "2026-10-27T20:00:00-05:00",
                "status": "IN_PLAY",
                "league": league,
                "homeTeam": {"id": 1125, "shortName": "Millonarios", "crest": "https://media.api-sports.io/football/teams/1125.png"},
                "awayTeam": {"id": 1137, "shortName": "Atletico Nacional", "crest": "https://media.api-sports.io/football/teams/1137.png"},
                "score": {"fullTime": {"home": 1, "away": 0}, "halfTime": {"home": 1, "away": 0}},
                "minute": 67,
                "round": "Clausura - 15",
                "venue": {"id": 1, "name": "Estadio El Campín", "city": "Bogotá"},
                "referee": "Wilmar Roldan",
            }
        ],
    }


def league_fixture(fixture_id, league_id, name, country):
    item = UPSTREAM["response"][1]  # a not started Premier League fixture, retargeted to another league
    return {
        **item,
        "fixture": {**item["fixture"], "id": fixture_id, "date": f"2026-10-27T{8 + fixture_id:02d}:00:00-05:00"},
        "league": {**PREMIER, "id": league_id, "name": name, "country": country},
    }


def test_top_leagues_come_first_then_world_then_country_and_name(upstream):
    leagues = [
        (136, "Serie B", "Italy"),
        (128, "Liga Profesional Argentina", "Argentina"),
        (78, "Bundesliga", "Germany"),
        (14, "UEFA Youth League", "World"),
        (239, "Primera A", "Colombia"),
        (137, "Coppa Italia", "Italy"),
        (39, "Premier League", "England"),
        (188, "A-League", "Australia"),
    ]
    upstream["reply"] = {"errors": [], "response": [league_fixture(i, *league) for i, league in enumerate(leagues)]}

    groups = TestClient(app).get("/api/matches").json()["competitions"]

    assert [g["league_name"] for g in groups] == [
        "Premier League",  # top leagues in TOP_LEAGUES order, whatever their kickoff
        "Primera A",
        "Bundesliga",
        "UEFA Youth League",  # then international competitions
        "Liga Profesional Argentina",  # then by country and league name
        "A-League",
        "Coppa Italia",
        "Serie B",
    ]


def test_date_param_is_sent_and_each_date_is_cached_separately(upstream):
    client = TestClient(app)
    yesterday, today, tomorrow = (str(COLOMBIA_TODAY + timedelta(days=offset)) for offset in (-1, 0, 1))

    for day in [yesterday, yesterday, tomorrow, today, None]:
        assert client.get("/api/matches", params={"date": day} if day else None).status_code == 200

    assert upstream["dates"] == [yesterday, tomorrow, today]


def test_invalid_date_returns_422(upstream):
    assert TestClient(app).get("/api/matches", params={"date": "27-10-2026"}).status_code == 422
    assert upstream["dates"] == []


@pytest.mark.parametrize("offset", [-2, 2])
def test_dates_outside_the_free_plan_return_400_without_spending_quota(upstream, offset):
    response = TestClient(app).get("/api/matches", params={"date": str(COLOMBIA_TODAY + timedelta(days=offset))})

    assert response.status_code == 400
    assert "plan gratuito" in response.json()["detail"]
    assert upstream["dates"] == []


def test_repeated_requests_within_ttl_hit_upstream_once(upstream):
    for _ in range(3):
        matches, sample = fetch()

    assert len(upstream["dates"]) == 1
    assert len(matches) == 2 and sample is False


def test_finished_past_day_is_never_requested_again(upstream):
    upstream["reply"] = FINISHED
    yesterday = COLOMBIA_TODAY - timedelta(days=1)
    fetch(yesterday)

    expire_cache()
    fetch(yesterday)

    assert upstream["dates"] == [yesterday.isoformat()]


@pytest.mark.parametrize("fetched_on", ["same day", "later with a live match"])
def test_past_day_refreshes_after_ttl_until_it_is_final(upstream, fetched_on):
    yesterday = COLOMBIA_TODAY - timedelta(days=1)
    if fetched_on == "same day":
        upstream["reply"] = FINISHED
    fetch(yesterday)
    if fetched_on == "same day":
        api_football._cache[yesterday]["on"] = yesterday  # cached yesterday, while it was still "today"

    expire_cache()
    fetch(yesterday)

    assert len(upstream["dates"]) == 2


def test_quota_error_serves_stale_cache_and_waits_a_ttl_to_retry(upstream):
    fetch()
    expire_cache()
    upstream["fail"] = "quota"

    for _ in range(2):
        matches, _ = fetch()

    assert len(upstream["dates"]) == 2
    assert len(matches) == 2


@pytest.mark.parametrize("failure", ["http", "quota"])
def test_upstream_error_without_cache_returns_502(upstream, failure):
    upstream["fail"] = failure

    response = TestClient(app).get("/api/matches")

    assert response.status_code == 502


def test_future_day_is_not_treated_as_final(upstream):
    tomorrow = date.fromordinal(COLOMBIA_TODAY.toordinal() + 1)
    upstream["reply"] = FINISHED
    fetch(tomorrow)

    expire_cache()
    fetch(tomorrow)

    assert len(upstream["dates"]) == 2


@pytest.fixture
def keys(monkeypatch):
    """Two keys, "spent" first; state[key] is what API-Football answers that key (default: the fixtures), or 429."""
    state = {"used": []}

    async def fake_get(self, url, headers, params):
        key = headers["x-apisports-key"]
        state["used"].append(key)
        reply = state.get(key, UPSTREAM)
        if reply == 429:
            return httpx.Response(429, request=httpx.Request("GET", url))
        return httpx.Response(200, json=reply, request=httpx.Request("GET", url))

    monkeypatch.setenv("API_FOOTBALL_KEYS", "spent, fresh")
    monkeypatch.setattr(api_football, "_turn", 0)
    monkeypatch.setattr(httpx.AsyncClient, "get", fake_get)
    return state


RATE_LIMIT = {"errors": {"rateLimit": "Too many requests. Your rate limit is 10 requests per minute."}, "response": []}


SUSPENDED = {"errors": {"access": "Your account is suspended, check on https://dashboard.api-football.com."}, "response": []}


@pytest.mark.parametrize(
    "spent", [QUOTA_ERROR, RATE_LIMIT, 429, SUSPENDED], ids=["daily quota", "rate limit", "HTTP 429", "suspended account"]
)
def test_a_spent_key_hands_the_same_request_to_the_next_one(keys, spent):
    keys["spent"] = spent

    assert TestClient(app).get("/api/matches").json()["competitions"]
    expire_cache()
    TestClient(app).get("/api/matches")

    assert keys["used"] == ["spent", "fresh", "fresh"]  # later requests start on the key that works


PLAN_ERROR = {"errors": {"plan": "Free plans do not have access to this date, try from 2026-10-28 to 2026-10-30."}, "response": []}


@pytest.mark.parametrize(
    ("replies", "used"),
    [
        ({"spent": QUOTA_ERROR, "fresh": QUOTA_ERROR}, ["spent", "fresh"]),  # every key ran out
        ({"spent": PLAN_ERROR}, ["spent"]),  # any key would get the same answer, so no other is tried
    ],
)
def test_errors_that_no_other_key_fixes_reach_the_caller(keys, replies, used):
    keys.update(replies)

    assert TestClient(app).get("/api/matches").status_code == 502
    assert keys["used"] == used
