import json
import math
import re
from datetime import timedelta

import httpx
import pytest
from fastapi.testclient import TestClient

from app import parlays
from app.api_football import colombia_today
from app.main import app

LEAGUES = {
    239: ("Primera A", "Colombia"),
    39: ("Premier League", "England"),
    253: ("Major League Soccer", "USA"),
    140: ("La Liga", "Spain"),
    999: ("Liga Menor", "Nowhere"),
}


def match(match_id, league_id, home, away, hour, status="TIMED"):
    name, country = LEAGUES[league_id]
    return {
        "id": match_id,
        "utcDate": f"2099-10-28T{hour}:00-05:00",  # always ahead, so every match is still to be played
        "status": status,
        "league": {
            "league_id": league_id,
            "league_name": name,
            "country": country,
            "league_logo": f"https://media.api-sports.io/football/leagues/{league_id}.png",
            "country_flag": None,
        },
        "homeTeam": {"id": match_id * 10, "shortName": home, "crest": ""},
        "awayTeam": {"id": match_id * 10 + 1, "shortName": away, "crest": ""},
        "score": {"fullTime": {"home": None, "away": None}},
    }


def matches():
    return [
        match(1, 999, "Menor A", "Menor B", "12:00"),  # minor league: after the top leagues
        match(2, 239, "Millonarios", "Nacional", "20:05"),
        match(3, 39, "Arsenal", "Chelsea", "09:00"),
        match(4, 253, "Inter Miami", "Cincinnati", "18:30"),
        match(5, 140, "Real Madrid", "Sevilla", "14:00"),
        match(6, 39, "Liverpool", "City", "11:30"),
        match(7, 239, "Junior", "America", "18:00", status="FINISHED"),  # never in a parlay
        # "Not started" long after kickoff, as API-Football leaves matches without live coverage: never in a parlay.
        {**match(9, 39, "Wolves U18", "Sunderland U18", "06:00"), "utcDate": "2020-10-28T06:00:00-05:00"},
    ]


def forecast(match_id, home, draw, away, over_1_5, over_2_5, btts):
    result = {"home": home, "draw": draw, "away": away}
    return {"match_id": match_id, "result": result, "over_1_5": over_1_5, "over_2_5": over_2_5, "btts": btts}


FORECAST = {
    "matches": [
        forecast(1, 40, 30, 30, 70, 45, 48),
        forecast(2, 55, 25, 20, 72, 46, 44),
        forecast(3, 80, 12, 8, 85, 62, 50),
        forecast(4, 62, 20, 18, 88, 66, 58),
        forecast(5, 75, 15, 10, 78, 55, 40),
        forecast(6, 45, 27, 28, 80, 60, 63),
        forecast(99, 50, 25, 25, 70, 50, 50),  # not in the list: ignored
    ]
}
GEMINI_ANSWER = {"candidates": [{"content": {"parts": [{"text": json.dumps(FORECAST)}]}}]}


@pytest.fixture
def api(monkeypatch):
    """Fake match list and fake VYROX IA (Gemini) answering FORECAST, or failing with state["fail"]."""
    state = {"matches": matches(), "prompts": [], "fail": False}

    async def fake_fetch(day):
        return state["matches"], False

    async def fake_post(self, url, headers, json):
        state["prompts"].append(json["contents"][0]["parts"][0]["text"])
        request = httpx.Request("POST", url)
        if state["fail"]:
            return httpx.Response(503, request=request)
        return httpx.Response(200, json=GEMINI_ANSWER, request=request)

    monkeypatch.setattr(parlays, "fetch_matches", fake_fetch)
    monkeypatch.setattr(httpx.AsyncClient, "post", fake_post)
    monkeypatch.setenv("GEMINI_API_KEY", "test-key")
    parlays.parlays_cache.clear()
    return state


def get(day=None):
    return TestClient(app).get("/api/parlays", params={"date": str(day)} if day else None)


def age(seconds):
    """Make today's cached forecast older by `seconds` (plus one)."""
    asked, forecasts = parlays.parlays_cache[colombia_today()]
    parlays.parlays_cache[colombia_today()] = (asked - seconds - 1, forecasts)


def check_slips(body):
    """Three slips of upcoming matches whose odds are fair odds and whose total is their product."""
    assert body["message"] is None
    assert [p["title"] for p in body["parlays"]] == ["Combinada Segura IA", "Multi Valor VYROX", "Selecciones en Tendencia"]
    for parlay in body["parlays"]:
        ids = [leg["match_id"] for leg in parlay["legs"]]
        assert len(ids) == len(set(ids)) and not {7, 9, 99} & set(ids)  # one leg per match, only upcoming ones
        assert parlay["total_odd"] == round(math.prod(leg["odd"] for leg in parlay["legs"]), 2)
        assert parlay["probability"] == round(math.prod(leg["probability"] / 100 for leg in parlay["legs"]) * 100)
        for leg in parlay["legs"]:
            assert leg["odd"] == round(100 / leg["probability"], 2)
            assert leg["popularity_label"] == f"{leg['probability']}% prob."
            assert re.fullmatch(r"\d{2}/\d{2} \d{2}:\d{2}", leg["kickoff_label"])


def test_three_parlays_from_one_forecast(api):
    body = get().json()

    check_slips(body)
    assert body["simulated"] is False
    segura, valor, tendencia = body["parlays"]
    assert [(leg["match_id"], leg["market_selection"]) for leg in segura["legs"]] == [
        (4, "Más de 1.5 - Goles totales"),
        (3, "Más de 1.5 - Goles totales"),
        (6, "Más de 1.5 - Goles totales"),
        (5, "Más de 1.5 - Goles totales"),
    ]
    assert (segura["probability"], segura["badge"], segura["total_odd"]) == (47, "47% IA", 2.15)
    assert valor["badge"] == "MIXTA IA" and len(valor["legs"]) == 5
    assert {leg["market_selection"].split(" - ")[1] for leg in valor["legs"]} == {"Resultado del partido", "Ambos anotan", "Goles totales"}
    assert tendencia["badge"] == f"{tendencia['total_odd']:.2f}" and len(tendencia["legs"]) == 5

    millonarios = next(leg for leg in valor["legs"] if leg["match_id"] == 2)
    assert (millonarios["home_team"], millonarios["away_team"], millonarios["kickoff_label"]) == ("Millonarios", "Nacional", "28/10 20:05")
    assert (millonarios["league_name"], millonarios["league_logo"]) == ("Primera A", "https://media.api-sports.io/football/leagues/239.png")

    prompt = api["prompts"][0]
    assert prompt.startswith("Eres VYROX IA") and prompt.index("- 3: Arsenal") < prompt.index("- 1: Menor A")  # top leagues first
    assert "Wolves U18" not in prompt


def test_forecast_is_cached_per_date_for_6_hours(api):
    get()
    get()
    assert len(api["prompts"]) == 1

    get(colombia_today() + timedelta(days=1))
    assert len(api["prompts"]) == 2

    age(parlays.FORECAST_TTL)
    get()
    assert len(api["prompts"]) == 3


def test_started_matches_drop_out_without_a_new_call(api):
    get()
    api["matches"][3]["status"] = "IN_PLAY"  # Inter Miami vs Cincinnati kicks off
    age(parlays.RETRY_TTL)

    body = get().json()

    assert len(api["prompts"]) == 1  # the other five upcoming matches are still forecast
    assert all(leg["match_id"] != 4 for parlay in body["parlays"] for leg in parlay["legs"])


def test_new_matches_are_asked_once_few_forecast_ones_remain(api):
    get()
    for started in api["matches"][1:4]:  # Millonarios, Arsenal and Inter Miami kick off
        started["status"] = "IN_PLAY"
    api["matches"].append(match(8, 39, "Spurs", "Everton", "21:00"))

    get()
    assert len(api["prompts"]) == 1  # never twice within 5 minutes

    age(parlays.RETRY_TTL)
    get()
    assert len(api["prompts"]) == 2 and "- 8: Spurs" in api["prompts"][1]


def test_failure_serves_simulated_parlays_and_retries_after_5_minutes(api):
    api["fail"] = True
    body = get().json()

    check_slips(body)
    assert body["simulated"] is True
    get()
    assert len(api["prompts"]) == 2  # Flash and Flash-Lite, once

    api["fail"] = False
    age(parlays.RETRY_TTL)
    assert get().json()["simulated"] is False


def test_without_key_parlays_are_simulated_and_stable(api, monkeypatch):
    monkeypatch.delenv("GEMINI_API_KEY")

    body = get().json()

    check_slips(body)
    assert body["simulated"] is True
    assert get().json() == body
    assert api["prompts"] == []


def test_too_few_upcoming_matches(api):
    api["matches"] = [match(2, 239, "Millonarios", "Nacional", "20:05"), match(7, 239, "Junior", "America", "18:00", status="FINISHED")]

    assert get().json() == {"parlays": [], "simulated": False, "message": parlays.NO_MATCHES}
    assert api["prompts"] == []


def test_dates_outside_the_free_plan_return_400(api):
    assert get(colombia_today() + timedelta(days=2)).status_code == 400
    assert api["prompts"] == []
