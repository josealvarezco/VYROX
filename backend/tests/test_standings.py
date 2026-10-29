import httpx
import pytest
from fastapi.testclient import TestClient

from app import standings
from app.api_football import API_BASE, CACHE_TTL
from app.main import app

MILLONARIOS, NACIONAL, JUNIOR = 1125, 1137, 1139
NAMES = {MILLONARIOS: "Millonarios", NACIONAL: "Atletico Nacional", JUNIOR: "Junior"}
MATCH = {"season": 2026, "home_team_id": MILLONARIOS, "away_team_id": NACIONAL, "home_team": "Millonarios", "away_team": "Atletico Nacional"}
PLAN_ERROR = {"plan": "Free plans do not have access to this season, try from 2022 to 2024."}


def row(rank, team_id, group, update, form="WWDLW", description=None):
    """A trimmed API-Football standings row: 15 played, 10 won, 3 drawn, 2 lost, 28:12."""
    return {
        "rank": rank,
        "team": {"id": team_id, "name": NAMES.get(team_id, f"Team {team_id}"), "logo": f"https://media.api-sports.io/football/teams/{team_id}.png"},
        "points": 33,
        "goalsDiff": 16,
        "group": group,
        "form": form,
        "status": "same",
        "description": description,
        "all": {"played": 15, "win": 10, "draw": 3, "lose": 2, "goals": {"for": 28, "against": 12}},
        "update": update,
    }


# Apertura and Clausura both hold the match's teams; the Clausura is the one still being played.
APERTURA = [row(1, MILLONARIOS, "Primera A: Apertura", "2026-06-20T00:00:00+00:00"), row(2, NACIONAL, "Primera A: Apertura", "2026-06-20T00:00:00+00:00")]
CLAUSURA = [
    row(1, NACIONAL, "Primera A: Clausura", "2026-10-28T00:00:00+00:00", description="Promotion - Copa Libertadores (Group Stage: )"),
    row(2, JUNIOR, "Primera A: Clausura", "2026-10-28T00:00:00+00:00", form=None),
    row(3, MILLONARIOS, "Primera A: Clausura", "2026-10-28T00:00:00+00:00", form="LDLWW", description="Relegation - Primera B"),
]
OTHER_GROUP = [row(1, 9999, "Group B", "2026-10-29T00:00:00+00:00")]  # newest, but without the match's teams


@pytest.fixture
def api(monkeypatch):
    """Fake API-Football /standings answering state["reply"]: a response list, "plan" (an error answer) or "http" (a 500)."""
    state = {"calls": [], "reply": [{"league": {"id": 239, "season": 2026, "standings": [APERTURA, OTHER_GROUP, CLAUSURA]}}]}

    async def fake_get(self, url, headers, params):
        assert url == f"{API_BASE}/standings"
        state["calls"].append(params)
        request = httpx.Request("GET", url)
        if state["reply"] == "http":
            return httpx.Response(500, request=request)
        body = {"errors": PLAN_ERROR, "response": []} if state["reply"] == "plan" else {"errors": [], "response": state["reply"]}
        return httpx.Response(200, json=body, request=request)

    monkeypatch.setenv("API_FOOTBALL_KEY", "test-key")
    monkeypatch.setattr(httpx.AsyncClient, "get", fake_get)
    standings.standings_cache.clear()
    return state


def get(league_id=239, **changes):
    return TestClient(app).get(f"/api/leagues/{league_id}/standings", params={**MATCH, **changes})


def age(seconds):
    """Bring every cached table `seconds` (plus one) closer to expiry."""
    for entry in standings.standings_cache.values():
        entry["until"] -= seconds + 1


def test_maps_the_current_table_of_the_match_with_the_form_in_spanish(api):
    body = get().json()

    assert api["calls"] == [{"league": 239, "season": 2026}]
    assert (body["group"], body["is_simulated"]) == ("Primera A: Clausura", False)
    assert body["standings"][0] == {
        "rank": 1,
        "team_id": NACIONAL,
        "team_name": "Atletico Nacional",
        "team_logo": "https://media.api-sports.io/football/teams/1137.png",
        "played": 15,
        "win": 10,
        "draw": 3,
        "lose": 2,
        "goals_for": 28,
        "goals_against": 12,
        "goals_diff": 16,
        "points": 33,
        "description": "Copa Libertadores",
        "form": ["V", "V", "E", "D", "V"],
    }
    assert [(r["description"], r["form"]) for r in body["standings"][1:]] == [
        (None, []),  # no form before a team's first match
        ("Descenso", ["D", "E", "D", "V", "V"]),
    ]


def test_one_request_per_league_and_season_for_12_hours(api):
    get()
    get(home_team_id=JUNIOR, home_team="Junior")  # another match of the same league
    assert len(api["calls"]) == 1

    get(season=2025)
    assert api["calls"][-1] == {"league": 239, "season": 2025}

    age(standings.STANDINGS_TTL)
    get()
    assert len(api["calls"]) == 3


def test_keeps_the_last_table_when_a_refresh_fails(api):
    get()
    age(standings.STANDINGS_TTL)
    api["reply"] = "http"

    body = get().json()

    assert len(api["calls"]) == 2
    assert (body["group"], body["is_simulated"]) == ("Primera A: Clausura", False)


def check_simulated(body):
    """10 to 16 teams, the match's among them, whose numbers add up team by team and across the league."""
    table = body["standings"]
    assert (body["group"], body["is_simulated"]) == (None, True)
    assert 10 <= len(table) <= 16
    assert {(r["team_id"], r["team_name"]) for r in table} >= {(MILLONARIOS, "Millonarios"), (NACIONAL, "Atletico Nacional")}
    assert [r["rank"] for r in table] == list(range(1, len(table) + 1))
    assert [r["points"] for r in table] == sorted((r["points"] for r in table), reverse=True)
    for r in table:
        assert r["win"] + r["draw"] + r["lose"] == r["played"] > 0
        assert r["points"] == 3 * r["win"] + r["draw"]
        assert r["goals_diff"] == r["goals_for"] - r["goals_against"]
        assert len(r["form"]) == min(5, r["played"])
        assert r["form"].count("V") <= r["win"] and r["form"].count("E") <= r["draw"] and r["form"].count("D") <= r["lose"]
    # Every simulated match has a winner and a loser, or two teams that drew.
    assert sum(r["win"] for r in table) == sum(r["lose"] for r in table)
    assert sum(r["goals_for"] for r in table) == sum(r["goals_against"] for r in table)
    assert [r["description"] for r in table[:4]] == ["Zona de clasificación"] * 4
    assert [r["description"] for r in table[-2:]] == ["Descenso"] * 2


def test_without_key_serves_a_stable_simulated_table(monkeypatch):
    monkeypatch.delenv("API_FOOTBALL_KEY", raising=False)

    body = get().json()

    check_simulated(body)
    assert get().json() == body  # the same table every time the tab opens
    assert get(season=2025).json() != body


@pytest.mark.parametrize(
    ("reply", "retried_after_5_minutes"),
    [
        ([], False),  # a cup without a table
        ([{"league": {"id": 239, "season": 2026, "standings": []}}], False),
        ("plan", False),  # the free plan does not cover the season: asking again soon would only spend quota
        ("http", True),  # a network error may clear up in minutes
    ],
)
def test_without_table_serves_a_simulated_one_and_saves_quota(api, reply, retried_after_5_minutes):
    api["reply"] = reply

    check_simulated(get().json())
    get()
    assert len(api["calls"]) == 1

    age(CACHE_TTL)
    get()
    assert len(api["calls"]) == (2 if retried_after_5_minutes else 1)
