import pytest
from fastapi.testclient import TestClient

from app import parlays, radar
from app.gemini import Probabilities
from app.main import app
from app.parlays import MatchForecast
from test_parlays import age, api, match  # noqa: F401  (api: the parlays' fake match list and fake VYROX IA)

# Picks of the parlays' FORECAST from 55 %, likeliest first: (match_id, probability).
PICKS = {
    "bankers_1x2": [(3, 80), (5, 75), (4, 62), (2, 55)],
    "over_2_5": [(4, 66), (3, 62), (6, 60), (5, 55)],
    "btts_yes": [(6, 63), (4, 58)],
    "under_2_5": [(1, 55)],
}
SLIP = {"bankers_1x2": "result", "over_2_5": "goals", "btts_yes": "btts", "under_2_5": "goals"}


@pytest.fixture
def radar_api(api, monkeypatch):
    async def fake_fetch(day):
        return api["matches"], False

    monkeypatch.setattr(radar, "fetch_matches", fake_fetch)
    return api


def get(path="/api/radar"):
    return TestClient(app).get(path)


def check(body):
    """Four markets, likeliest first, from 55 to 92 %, each with its fair odd and the bet slip's category."""
    assert [(c["key"], c["title"]) for c in body["categories"]] == radar.CATEGORIES
    for category in body["categories"]:
        chances = [item["probability"] for item in category["items"]]
        assert chances == sorted(chances, reverse=True) and all(55 <= p <= 92 for p in chances) and len(chances) <= 8
        for item in category["items"]:
            assert item["fair_odd"] == round(100 / item["probability"], 2)
            assert item["confidence_badge"] == ("ALTA" if item["probability"] >= 70 else "MEDIA")
            assert item["market_category"] == SLIP[category["key"]]


def picks(body):
    return {c["key"]: [(item["match_id"], item["probability"]) for item in c["items"]] for c in body["categories"]}


def test_four_markets_from_one_forecast(radar_api):
    body = get().json()

    check(body)
    assert (body["simulated"], body["played"], body["message"]) == (False, False, None)
    assert picks(body) == PICKS  # finished match 7 and stale match 9 never show
    assert body["categories"][0]["items"][0] == {
        "match_id": 3,
        "league_id": 39,
        "league_name": "Premier League",
        "league_logo": "https://media.api-sports.io/football/leagues/39.png",
        "country_flag": None,
        "home_team": "Arsenal",
        "away_team": "Chelsea",
        "home_logo": "",
        "away_logo": "",
        "kickoff_label": "28/10 09:00",
        "market_category": "result",
        "market_selection": "Arsenal - Resultado del partido",
        "probability": 80,
        "fair_odd": 1.25,
        "confidence_badge": "ALTA",
        "insight": "Arsenal parte como favorito: 80% de victoria y 8% para Chelsea.",
    }
    selections = {c["key"]: c["items"][0]["market_selection"] for c in body["categories"]}
    assert list(selections.values())[1:] == ["Más de 2.5 - Goles totales", "Sí - Ambos anotan", "Menos de 2.5 - Goles totales"]


def test_shares_the_parlays_cached_forecast(radar_api):
    parlay_legs = [leg for parlay in get("/api/parlays").json()["parlays"] for leg in parlay["legs"]]
    body = get().json()
    get()
    assert len(radar_api["prompts"]) == 1  # one VYROX IA call per date for the parlays and the radar

    # The same pick has the same fair odd in both places, so the bet slip treats it as one.
    leg = next(leg for leg in parlay_legs if (leg["match_id"], leg["market_selection"]) == (6, "Más de 2.5 - Goles totales"))
    item = next(item for item in body["categories"][1]["items"] if item["match_id"] == 6)
    assert item["fair_odd"] == leg["odd"] == 1.67

    age(parlays.FORECAST_TTL)
    get()
    assert len(radar_api["prompts"]) == 2


def test_without_vyrox_ia_the_radar_is_simulated(radar_api):
    radar_api["fail"] = True

    body = get().json()

    check(body)
    assert body["simulated"] is True and any(c["items"] for c in body["categories"])


def test_a_day_already_played_shows_its_matches_as_a_reference(radar_api):
    for finished in radar_api["matches"]:
        finished["status"] = "FINISHED"

    body = get().json()

    assert body["played"] is True and picks(body) == PICKS
    assert "- 7: Junior" in radar_api["prompts"][0]  # every match of the day is read, finished ones included


def test_no_matches(radar_api):
    radar_api["matches"] = []
    assert get().json() == {"categories": [], "simulated": False, "played": False, "message": radar.NO_MATCHES}


def test_no_pick_is_shown_surer_than_92_percent():
    arsenal = match(3, 39, "Arsenal", "Chelsea", "09:00")
    sure = MatchForecast(match_id=3, result=Probabilities(home=96, draw=3, away=1), over_1_5=99, over_2_5=97, btts=95)

    markets = radar._markets(arsenal, sure)

    assert [percent for _, percent, _, _ in markets.values()] == [92, 92, 92, 3]
    assert radar._item(arsenal, markets["bankers_1x2"])["fair_odd"] == 1.09
