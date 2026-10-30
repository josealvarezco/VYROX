import math

import pytest
from fastapi.testclient import TestClient

from app import builder
from app.main import app
from app.odds import PICK
from test_parlays import api  # noqa: F401  (the parlays' fake match list and fake VYROX IA)
from test_radar import radar_api  # noqa: F401  (the same list for the radar's forecast, which the builder reads)

CATEGORIES = {"all": {"result", "over_1_5", "goals", "btts"}, "1x2": {"result"}, "goals": {"over_1_5", "goals"}, "btts": {"btts"}}


def build(**params):
    return TestClient(app).get("/api/parlays/builder", params=params)


@pytest.mark.parametrize("market", CATEGORIES)
@pytest.mark.parametrize("legs", range(2, 7))
def test_one_pick_per_match_with_the_legs_and_market_asked(radar_api, legs, market):
    body = build(target_odd=5, legs=legs, market_filter=market).json()

    ids = [leg["match_id"] for leg in body["legs"]]
    assert len(ids) == len(set(ids)) == body["legs_count"] == legs  # the fixture has 6 matches to be played
    assert {leg["market_category"] for leg in body["legs"]} <= CATEGORIES[market]
    assert all(PICK[0] <= leg["odd"] <= builder.MAX_ODD for leg in body["legs"])
    assert body["total_odd"] == round(math.prod(leg["odd"] for leg in body["legs"]), 2)
    assert body["probability"] == round(math.prod(leg["probability"] / 100 for leg in body["legs"]) * 100)


@pytest.mark.parametrize("target, legs", [(2, 2), (3, 3), (5, 4), (10, 5), (20, 6)])
def test_auto_splits_the_target_into_safe_legs(radar_api, target, legs):
    body = build(target_odd=target).json()

    assert (body["legs_count"], body["on_target"]) == (legs, True)
    assert abs(body["total_odd"] / target - 1) <= 0.2
    assert all(PICK[0] <= leg["odd"] <= 1.85 for leg in body["legs"])


def test_auto_takes_fewer_legs_when_the_market_pays_more_per_leg(radar_api):
    # Every both-score pick pays 1.56 or more here, so five legs would pass 13: four land near 7.5.
    body = build(target_odd=7.5, market_filter="btts").json()

    assert (body["legs_count"], body["on_target"]) == (4, True)


def test_another_combination_is_another_mix_of_matches_on_target(radar_api):
    first, second = (build(target_odd=5, legs=3, variant=variant).json() for variant in (0, 1))

    assert {leg["match_id"] for leg in first["legs"]} != {leg["match_id"] for leg in second["legs"]}
    assert first["on_target"] and second["on_target"]
    assert first["probability"] >= second["probability"]  # the likeliest slip comes first


def test_reads_the_cached_forecast_without_new_calls(radar_api):
    TestClient(app).get("/api/parlays")
    for target in (2, 5, 10):
        build(target_odd=target)

    assert len(radar_api["prompts"]) == 1  # the parlays' VYROX IA call serves the builder too


def test_without_vyrox_ia_the_builder_is_simulated(radar_api, monkeypatch):
    monkeypatch.delenv("GEMINI_API_KEY")

    body = build(target_odd=5).json()

    assert body["simulated"] is True and body["legs"]


def test_a_day_already_played_builds_a_reference(radar_api):
    for finished in radar_api["matches"]:
        finished["status"] = "FINISHED"

    body = build(target_odd=3).json()

    assert body["played"] is True and body["legs"]


def test_too_few_matches(radar_api):
    radar_api["matches"] = radar_api["matches"][:1]

    assert build(target_odd=3).json()["message"] == builder.NO_MATCHES


@pytest.mark.parametrize("params", [{"target_odd": 1.4}, {"target_odd": 51}, {"legs": 1}, {"legs": 7}, {"market_filter": "corners"}, {"variant": -1}])
def test_settings_out_of_range_return_422(radar_api, params):
    assert build(**{"target_odd": 5, **params}).status_code == 422


def test_dates_outside_the_free_plan_return_400(radar_api):
    assert build(target_odd=5, date="2020-01-01").status_code == 400
