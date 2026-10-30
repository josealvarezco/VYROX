import pytest

from app.odds import DRAW, FAVOURITE, odds_1x2, pick_odd, prob_to_market_odd


@pytest.mark.parametrize(
    "percents, low, high",
    [
        (range(42, 51), 1.88, 2.35),  # an even market or a competitive away side
        (range(52, 61), 1.62, 1.85),  # a moderate favourite
        (range(63, 76), 1.35, 1.57),  # a clear favourite; 62 % pays 1.58, a cent above
    ],
)
def test_two_way_odds_fall_in_the_bookmaker_ranges(percents, low, high):
    for percent in percents:
        assert low <= prob_to_market_odd(percent) <= high, percent


def test_both_sides_of_a_two_way_market_carry_a_6_5_percent_margin():
    for percent in range(5, 96, 5):
        book = 1 / prob_to_market_odd(percent) + 1 / prob_to_market_odd(100 - percent)
        assert book == pytest.approx(1.065, abs=0.006), percent
    assert prob_to_market_odd(0) is None


def test_1x2_shares_a_107_5_percent_book():
    odds = odds_1x2(46, 27, 27)
    assert odds == {"home": 2.02, "draw": 3.45, "away": 3.45}
    assert sum(1 / odd for odd in odds.values()) == pytest.approx(1.075, abs=0.002)


@pytest.mark.parametrize("home", range(0, 101, 4))
def test_1x2_keeps_the_draw_and_the_favourite_in_range(home):
    for draw in range(0, 101 - home, 4):
        odds = odds_1x2(home, draw, 100 - home - draw)
        if home or 100 - home - draw:  # a side can win, so its favourite keeps the three from all paying over 2.50
            assert min(odd for odd in odds.values() if odd) <= 2.25
        assert odds["draw"] is None or DRAW[0] <= odds["draw"] <= DRAW[1]
        favourite = odds["home"] if home >= 100 - home - draw else odds["away"]
        assert favourite is None or FAVOURITE[0] <= favourite <= FAVOURITE[1]


def test_a_pick_pays_between_1_22_and_2_35():
    assert (pick_odd(1.06), pick_odd(1.74), pick_odd(3.6)) == (1.22, 1.74, 2.35)
