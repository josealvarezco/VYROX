import json

import httpx
import pytest
from fastapi.testclient import TestClient

from app import gemini
from app.main import app
from fake_api_football import FIXTURE_ID, fixture, install

MATCH = {
    "match_id": 2002,
    "home_team": "Millonarios",
    "away_team": "Atletico Nacional",
    "league": "Primera A",
    "date": "2026-10-27T20:00:00-05:00",
    "status": "IN_PLAY",
    "score": {"home": 1, "away": 0},
}
PREDICTION = {
    "winner_pick": "Local",
    "probabilities": {"home": 55, "draw": 25, "away": 20},
    "both_teams_to_score": "No",
    "over_under_2_5": "Menos de 2.5 goles",
    "confidence": "Media",
    "recommended_bet": "Local o Empate + Menos de 3.5 goles",
    "recommended_bet_probability": 70,
    "over_2_5_probability": 40,
    "btts_probability": 45,
    "reasoning": "Millonarios gana 1-0 en casa y controla el partido.",
}
# Estimated market odds (app.odds): a 107.5 % book for 1X2, 6.5 % margins for the two-way markets
MARKET_ODDS = {
    "recommended": 1.43,
    "home": 1.71,
    "draw": 3.6,  # 25 % would pay 3.72: a draw stays within 3.10-3.60
    "away": 4.7,
    "over_2_5": 2.22,
    "under_2_5": 1.62,  # the other side, 60 %: both sides add up to 106.5 %
    "btts_yes": 2.04,
    "btts_no": 1.74,
}
EXPECTED = {"fallback": False, **PREDICTION, "market_odds": MARKET_ODDS}


def gemini_body(payload):
    """Shape of a generateContent response whose text is the given JSON payload."""
    text = payload if isinstance(payload, str) else json.dumps(payload)
    return {"candidates": [{"content": {"parts": [{"text": text}]}}]}


@pytest.fixture(autouse=True)
def fresh_cache():
    gemini._cache.clear()


@pytest.fixture
def upstream(monkeypatch):
    """Fake Gemini: records requests and answers with state["reply"] (a payload or an HTTP status).
    Models listed in state["overloaded"] answer 503."""
    state = {"requests": [], "reply": PREDICTION, "overloaded": set()}

    async def fake_post(self, url, headers, json):
        state["requests"].append({"url": url, "headers": headers, "json": json})
        request = httpx.Request("POST", url)
        if any(f"/models/{model}:" in url for model in state["overloaded"]):
            return httpx.Response(503, request=request)
        if isinstance(state["reply"], int):
            return httpx.Response(state["reply"], request=request)
        return httpx.Response(200, json=gemini_body(state["reply"]), request=request)

    monkeypatch.setenv("GEMINI_API_KEY", "test-key")
    monkeypatch.setattr(httpx.AsyncClient, "post", fake_post)
    return state


def post(match=MATCH):
    return TestClient(app).post("/api/predictions", json=match)


def test_returns_gemini_prediction(upstream):
    response = post()

    assert response.status_code == 200
    assert response.json() == EXPECTED
    sent = upstream["requests"][0]
    assert sent["url"].endswith("/models/gemini-flash-latest:generateContent")
    assert sent["headers"] == {"x-goog-api-key": "test-key"}
    assert sent["json"]["generationConfig"]["responseMimeType"] == "application/json"
    asked = sent["json"]["generationConfig"]["responseJsonSchema"]["properties"]
    assert "btts_probability" in asked and "market_odds" not in asked  # odds are computed here, never asked
    prompt = sent["json"]["contents"][0]["parts"][0]["text"]
    assert "Millonarios (local) vs Atletico Nacional (visitante)" in prompt and "Marcador: 1-0" in prompt
    assert prompt.startswith("Eres VYROX IA, el motor propietario de analítica avanzada y predicción deportiva de VYROX")
    assert "nunca te presentes como Gemini, Google" in prompt


def test_fallback_messages_say_vyrox_ia_and_never_gemini():
    for message in (gemini.NO_KEY, gemini.FAILED):
        assert "VYROX IA" in message and "gemini" not in message.lower()


def test_overloaded_flash_falls_back_to_flash_lite(upstream):
    upstream["overloaded"] = {"gemini-flash-latest"}

    assert post().json() == EXPECTED
    models = [sent["url"].split("/models/")[1].split(":")[0] for sent in upstream["requests"]]
    assert models == ["gemini-flash-latest", "gemini-flash-lite-latest"]


def test_same_match_is_served_from_cache_until_ttl(upstream):
    post()
    post()
    assert len(upstream["requests"]) == 1

    post({**MATCH, "match_id": 2003})
    assert len(upstream["requests"]) == 2

    gemini._cache[2002] = (gemini._cache[2002][0] - gemini.CACHE_TTL - 1, gemini._cache[2002][1])
    post()
    assert len(upstream["requests"]) == 3


def test_probabilities_are_rescaled_to_sum_100(upstream):
    upstream["reply"] = {**PREDICTION, "probabilities": {"home": 50, "draw": 30, "away": 30}}

    assert post().json()["probabilities"] == {"home": 46, "draw": 27, "away": 27}


def test_market_odds_follow_the_rescaled_probabilities_and_skip_zero(upstream):
    upstream["reply"] = {**PREDICTION, "probabilities": {"home": 50, "draw": 30, "away": 30}, "btts_probability": 0}

    odds = post().json()["market_odds"]

    assert (odds["home"], odds["draw"], odds["away"]) == (2.02, 3.45, 3.45)  # from 46/27/27, not 50/30/30
    assert odds["btts_yes"] is None  # no odd for an event VYROX IA gives no chance
    assert odds["btts_no"] == 1.06  # while a certainty still pays the margin's 1.06


def test_missing_market_probability_is_outside_schema(upstream):
    upstream["reply"] = {key: value for key, value in PREDICTION.items() if key != "over_2_5_probability"}

    assert post().json() == {"fallback": True, "reasoning": gemini.FAILED}


def test_without_key_returns_fallback(monkeypatch):
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)

    response = post()

    assert response.status_code == 200
    assert response.json() == {"fallback": True, "reasoning": gemini.NO_KEY}


@pytest.mark.parametrize(
    "reply",
    [429, "esto no es JSON", {**PREDICTION, "confidence": "Muy alta"}],
    ids=["http-error", "invalid-json", "outside-schema"],
)
def test_gemini_failure_returns_fallback_and_is_not_cached(upstream, reply):
    upstream["reply"] = reply

    response = post()

    assert response.status_code == 200
    assert response.json() == {"fallback": True, "reasoning": gemini.FAILED}
    upstream["reply"] = PREDICTION
    assert post().json()["fallback"] is False


def test_rejects_oversized_fields():
    assert post({**MATCH, "home_team": "x" * 101}).status_code == 422


def sent_prompt(upstream):
    return upstream["requests"][0]["json"]["contents"][0]["parts"][0]["text"]


def test_prompt_includes_real_h2h_and_match_statistics(upstream, monkeypatch):
    install(monkeypatch)

    post({**MATCH, "match_id": FIXTURE_ID})

    prompt = sent_prompt(upstream)
    assert "Historial directo (últimos 5 partidos terminados):" in prompt
    assert "- 2025-04-01: Kashima 2-1 Pohang Steelers (AFC Champions League Elite)" in prompt
    assert "Promedio de goles: 2.2. Ambos anotaron en 3 de 5. Más de 2.5 goles en 2 de 5." in prompt
    assert "Estadísticas de este partido (local - visitante):\n- Posesión: 71 - 29" in prompt


def test_simulated_statistics_never_reach_gemini(upstream, monkeypatch):
    api = install(monkeypatch)
    api["fixture"] = fixture(lineups=[], statistics=[])

    post({**MATCH, "match_id": FIXTURE_ID})

    prompt = sent_prompt(upstream)
    assert "Historial directo" in prompt and "Estadísticas de este partido" not in prompt


def test_prediction_without_match_data_still_works(upstream, monkeypatch):
    monkeypatch.delenv("API_FOOTBALL_KEY", raising=False)  # match 2002 is not in the sample data

    assert post().json()["fallback"] is False
    assert gemini.NO_CONTEXT in sent_prompt(upstream)
