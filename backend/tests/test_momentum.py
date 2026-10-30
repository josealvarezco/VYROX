import pytest

from app import momentum
from app.momentum import measure, pressure, with_momentum


def side(shots, on_target, in_box, corners, possession, red=0):
    return {"Total Shots": shots, "Shots on Goal": on_target, "Shots insidebox": in_box, "Corner Kicks": corners, "Ball Possession": possession, "Red Cards": red}


AVERAGE = {"home": side(8, 3, 5, 3, 50), "away": side(8, 3, 5, 3, 50)}
SIEGE = {"home": side(16, 7, 11, 8, 68), "away": side(4, 1, 2, 1, 32)}
OPEN = {"home": side(15, 7, 10, 7, 52), "away": side(14, 6, 9, 6, 48)}


@pytest.fixture(autouse=True)
def fresh_measurements():
    momentum._snapshots.clear()
    momentum._measured.clear()


def test_an_average_match_is_balanced():
    assert pressure(AVERAGE, 60, (1, 1)) == {"home_pressure": 59, "away_pressure": 59, "momentum_status": "balanced", "goal_probability_next_15m": 34}


@pytest.mark.parametrize(
    "counts, goals, status",
    [
        (SIEGE, (0, 0), "high_voltage"),  # one side pins the other back with the score still open
        (SIEGE, (3, 0), "home_domination"),  # the same siege at 3-0 is no longer a hot match
        (OPEN, (2, 2), "high_voltage"),  # both sides above 75 on average
        ({"home": SIEGE["away"], "away": SIEGE["home"]}, (1, 3), "away_domination"),
    ],
)
def test_hot_matches_and_dominations(counts, goals, status):
    assert pressure(counts, 70, goals)["momentum_status"] == status


def test_more_pressure_means_a_likelier_goal_and_a_quiet_match_almost_none():
    quiet = pressure({"home": side(1, 0, 0, 1, 55), "away": side(1, 0, 1, 0, 45)}, 30, (0, 0))
    assert (quiet["home_pressure"], quiet["goal_probability_next_15m"]) == (16, 3)
    assert pressure(OPEN, 75, (2, 2))["goal_probability_next_15m"] > pressure(AVERAGE, 75, (2, 2))["goal_probability_next_15m"] > 3


def test_a_side_a_man_down_presses_less():
    now = {"home": side(8, 3, 5, 3, 50, red=1), "away": side(8, 3, 5, 3, 50)}
    result = pressure(now, 60, (0, 0))
    assert result["home_pressure"] < 59 < result["away_pressure"]


def test_the_last_minutes_weigh_more_than_the_whole_match():
    now = {"home": side(10, 4, 6, 4, 60), "away": side(6, 2, 3, 2, 40)}
    earlier = (55, {"home": side(5, 1, 2, 1, 55), "away": side(6, 2, 3, 2, 45)})  # the home side did all of it lately

    assert pressure(now, 65, (0, 0), earlier)["home_pressure"] > pressure(now, 65, (0, 0))["home_pressure"]
    assert pressure(now, 65, (0, 0), earlier)["away_pressure"] < pressure(now, 65, (0, 0))["away_pressure"]


def test_measurements_compare_with_the_one_5_to_15_minutes_back():
    calm = {"home": side(2, 0, 1, 0, 50), "away": side(2, 0, 1, 0, 50)}
    measure(9, 50, calm, (0, 0))
    measure(9, 58, calm, (0, 0))  # not 5 minutes after the next one: skipped as the reference
    surge = {"home": side(9, 4, 6, 4, 60), "away": side(2, 0, 1, 0, 40)}

    assert measure(9, 62, surge, (0, 0)) == pressure(surge, 62, (0, 0), (50, calm))
    assert [minute for minute, _ in momentum._snapshots[9]] == [50, 58, 62]
    measure(9, 70, surge, (0, 0))
    assert [minute for minute, _ in momentum._snapshots[9]] == [58, 62, 70]  # older than 15 minutes: dropped


def test_the_list_shows_fresh_measurements_of_live_matches_only(monkeypatch):
    measure(1, 60, SIEGE, (0, 0))
    measure(2, 60, SIEGE, (0, 0))
    matches = [{"id": 1, "status": "IN_PLAY"}, {"id": 2, "status": "FINISHED"}, {"id": 3, "status": "IN_PLAY"}]

    live, finished, unmeasured = with_momentum(matches)
    assert live["momentum_status"] == "high_voltage" and "home_pressure" not in finished and unmeasured == matches[2]

    later = momentum.time.monotonic() + momentum.FRESH + 1
    monkeypatch.setattr(momentum.time, "monotonic", lambda: later)
    assert with_momentum(matches) == matches  # ten minutes on, a measurement no longer shows
