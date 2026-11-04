from datetime import timedelta

import pytest
from fastapi.testclient import TestClient

from app import builder, live, odds, parlays, radar
from app.api_football import colombia_today
from app.main import app
from app.parlays import MatchForecast, live_forecast
from test_parlays import age, api, forecast, match  # noqa: F401  (api: the parlays' fake match list and fake VYROX IA)
from test_radar import radar_api  # noqa: F401  (the same list for the radar's forecast)

GOALS = live.LEAGUE_GOALS
TOMORROW = str(colombia_today() + timedelta(days=1))
OVER, UNDER = "Más de 2.5 - Goles totales", "Menos de 2.5 - Goles totales"


def live_match(match_id, minute, home, away, status="IN_PLAY", league=239):
    fixture = match(match_id, league, f"Local {match_id}", f"Visitante {match_id}", "20:00", status)
    return {**fixture, "minute": minute, "score": {"fullTime": {"home": home, "away": away}}}


def finished(matches):
    return [{**m, "status": "FINISHED"} for m in matches]


def test_a_forecast_keeps_its_chances_at_kickoff():
    goals = live.expected_goals(50, 25, 55)
    chances = live.chances_at(goals, 0, 0, 0)

    assert abs(chances["home"] - 50) < 5 and abs(chances["over_2_5"] - 55) < 0.1
    assert goals[0] > goals[1]
    assert chances["home"] / chances["away"] == pytest.approx(50 / 25, abs=0.01)


def test_a_goal_moves_the_chances_toward_the_side_that_scored():
    level, ahead = live.chances_at(GOALS, 60, 0, 0), live.chances_at(GOALS, 60, 1, 0)

    assert ahead["home"] > level["home"] and ahead["draw"] < level["draw"] and ahead["away"] < level["away"]
    assert sum(ahead[side] for side in ("home", "draw", "away")) == pytest.approx(100)
    assert live.chances_at(GOALS, 80, 1, 0)["home"] > ahead["home"]  # the same lead is worth more as time runs out


def test_what_the_score_already_settled_is_certain():
    assert live.chances_at(GOALS, 30, 2, 1)["over_2_5"] == pytest.approx(100)
    assert live.chances_at(GOALS, 30, 1, 1)["btts"] == pytest.approx(100)
    assert live.chances_at(GOALS, 90, 1, 0)["home"] == pytest.approx(100)


def test_a_live_odd_always_carries_a_margin_and_a_settled_side_has_none():
    for percent in range(2, 99):
        odd = odds.live_odd(percent)
        assert 1 < odd and 1 / odd > percent / 100 - 0.005  # 0.005: the rounding to two decimals
    assert odds.live_odd(50) == pytest.approx(1.88, abs=0.01)  # the same as the two-way market's 50 %
    assert all(odds.live_odd(percent) is None for percent in (0, 1, 99, 100))


def test_the_list_prices_live_matches_by_score_and_locks_the_closing_stretch(api, monkeypatch):
    async def fake_fetch(day=None):
        return api["matches"], False

    monkeypatch.setattr("app.main.fetch_matches", fake_fetch)
    api["matches"] = [live_match(1, 60, 1, 0), live_match(2, 60, 0, 0), live_match(3, 85, 1, 0), live_match(4, None, 0, 0), live_match(5, 30, 2, 1), match(6, 39, "A", "B", "20:00")]

    competitions = TestClient(app).get("/api/matches").json()["competitions"]
    by_id = {m["id"]: m for group in competitions for m in group["matches"]}

    ahead, level = by_id[1]["live_picks"], by_id[2]["live_picks"]
    assert ahead["home"]["odd"] < level["home"]["odd"] and ahead["draw"]["odd"] > level["draw"]["odd"] and ahead["away"]["odd"] > level["away"]["odd"]
    assert ahead["home"]["market_selection"] == "Local 1 - Resultado del partido" and ahead["home"]["market_category"] == "result"
    assert (ahead["over_2_5"]["market_selection"], ahead["under_2_5"]["market_selection"]) == (OVER, UNDER)
    assert ahead["over_2_5"]["probability"] + ahead["under_2_5"]["probability"] == 100
    assert not {"live_picks"} & (by_id[3].keys() | by_id[4].keys() | by_id[6].keys())  # 85', no minute and not started
    settled = by_id[5]["live_picks"]  # 2-1: three goals and both scored
    assert all(settled[key]["odd"] is None for key in ("over_2_5", "under_2_5", "btts_yes", "btts_no"))
    assert api["prompts"] == []  # no VYROX IA call for any of it


def test_the_list_starts_from_the_cached_forecast_when_there_is_one(api, monkeypatch):
    async def fake_fetch(day=None):
        return api["matches"], False

    monkeypatch.setattr("app.main.fetch_matches", fake_fetch)
    api["matches"] = [live_match(1, 10, 0, 0), live_match(2, 10, 0, 0)]
    parlays.parlays_cache[colombia_today()] = (0, {1: MatchForecast(**forecast(1, 70, 20, 10, 80, 55, 45))})

    competitions = TestClient(app).get("/api/matches").json()["competitions"]
    by_id = {m["id"]: m for group in competitions for m in group["matches"]}

    assert by_id[1]["live_picks"]["home"]["probability"] > by_id[2]["live_picks"]["home"]["probability"]


def upcoming_matches(count):
    return [match(10 + i, 39, f"A{i}", f"B{i}", "20:00") for i in range(count)]


def test_few_upcoming_matches_are_joined_by_the_live_ones_before_minute_75(api):
    api["matches"] = [match(4, 253, "Inter Miami", "Cincinnati", "18:30"), live_match(21, 30, 0, 0), live_match(22, 74, 1, 0), live_match(23, 75, 0, 0), live_match(24, 60, 1, 1, "PAUSED")]

    body = TestClient(app).get("/api/parlays").json()

    ids = {leg["match_id"] for parlay in body["parlays"] for leg in parlay["legs"]}
    assert ids == {4, 21, 22, 24} and body["next_date"] is None
    assert "Local" not in api["prompts"][0]  # VYROX IA is only asked about the match still to be played
    legs = {leg["match_id"]: leg for parlay in body["parlays"] for leg in parlay["legs"]}
    assert legs[21]["live_label"] == "En vivo 30' · 0 - 0" and legs[4]["live_label"] is None


def test_plenty_of_upcoming_matches_leave_the_live_ones_out(api):
    api["matches"] = [*upcoming_matches(5), live_match(21, 30, 0, 0)]

    body = TestClient(app).get("/api/parlays").json()

    assert all(leg["match_id"] != 21 for parlay in body["parlays"] for leg in parlay["legs"])


def test_a_slip_never_takes_what_the_score_settled(api):
    # 3-1 at 70': goals and both-score are settled and the home win is nearly so; only the 0-0 still offers something.
    api["matches"] = [live_match(21, 70, 3, 1), live_match(22, 70, 2, 1), live_match(23, 30, 0, 0), live_match(24, 20, 1, 1)]

    body = TestClient(app).get("/api/parlays").json()

    legs = [leg for parlay in body["parlays"] for leg in parlay["legs"]]
    assert legs and all(leg["odd"] >= odds.PICK[0] for leg in legs)
    settled = {(21, OVER), (21, "Más de 1.5 - Goles totales"), (21, "Sí - Ambos anotan"), (22, OVER), (22, "Sí - Ambos anotan"), (24, "Sí - Ambos anotan")}
    assert not settled & {(leg["match_id"], leg["market_selection"]) for leg in legs}


@pytest.mark.parametrize("left", [[], upcoming_matches(1), [live_match(21, 30, 0, 0), live_match(22, 80, 0, 0)], upcoming_matches(1) + [live_match(21, 30, 0, 0)]])
def test_fewer_than_3_matches_today_point_to_tomorrow(api, left):
    api["matches"] = left + finished(upcoming_matches(4))

    body = TestClient(app).get("/api/parlays").json()

    assert body["parlays"] == [] and body["next_date"] == TOMORROW
    assert api["prompts"] == []


def test_another_day_never_points_ahead(api):
    api["matches"] = upcoming_matches(1)

    assert TestClient(app).get("/api/parlays", params={"date": TOMORROW}).json()["next_date"] is None


def test_the_builder_takes_live_matches_at_their_price(radar_api):
    radar_api["matches"] = [live_match(21, 30, 0, 0), live_match(22, 40, 1, 0), live_match(23, 20, 0, 1), live_match(24, 80, 0, 0)]

    body = TestClient(app).get("/api/parlays/builder", params={"target_odd": 3}).json()

    assert body["legs"] and not body["played"] and body["next_date"] is None
    assert {leg["match_id"] for leg in body["legs"]} <= {21, 22, 23}
    for leg in body["legs"]:
        assert leg["odd"] == odds.live_odd(leg["probability"]) and odds.PICK[0] <= leg["odd"] <= builder.MAX_ODD
    assert radar_api["prompts"] == []


def test_the_builder_points_to_tomorrow_when_today_is_over(radar_api):
    radar_api["matches"] = finished(radar_api["matches"])

    body = TestClient(app).get("/api/parlays/builder", params={"target_odd": 3}).json()

    assert body["legs"] == [] and body["next_date"] == TOMORROW


def test_the_comparator_and_the_radar_stay_with_the_matches_to_be_played(radar_api):
    radar_api["matches"].append(live_match(21, 30, 0, 0))

    assert all(row["match_id"] != 21 for row in TestClient(app).get("/api/forecasts").json()["matches"])
    assert radar.NO_MATCHES != TestClient(app).get("/api/radar").json()["message"]


def test_a_later_forecast_keeps_the_earlier_one_of_matches_already_live(api):
    TestClient(app).get("/api/parlays")
    first = parlays.parlays_cache[colombia_today()][1]
    for started in api["matches"][1:4]:
        started["status"] = "IN_PLAY"
    api["matches"].append(match(8, 39, "Spurs", "Everton", "21:00"))
    age(parlays.RETRY_TTL)

    TestClient(app).get("/api/parlays")

    assert len(api["prompts"]) == 2 and first.keys() <= parlays.parlays_cache[colombia_today()][1].keys()


def test_live_forecast_without_a_forecast_uses_an_average_match():
    fair = live_forecast(live_match(1, 0, 0, 0), None)

    assert fair.result.home > fair.result.away and fair.result.home + fair.result.draw + fair.result.away == 100
