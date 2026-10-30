"""Estimated market odds: VYROX IA's probabilities priced the way a bookmaker prices them, margin included.

Calibrated to the ranges bookmakers show: a 62-75 % favourite pays about 1.35-1.57, a 52-60 % pick 1.62-1.85
and a 42-50 % one 1.88-2.35.
"""

TWO_WAY_BOOK = 1.065  # both sides of a goals or both-score market add up to 106.5 %: a 6.5 % margin
SHRINK = 0.83  # bookmakers price favourites less sharply than a model: each probability moves 17 % toward 50 %
BOOK_1X2 = 1.075  # home, draw and away add up to 107.5 %
DRAW = (3.10, 3.60)
FAVOURITE = (1.45, 2.25)
PICK = (1.22, 2.35)  # what a single selection of the parlays and the radar pays


def _within(value: float, low: float, high: float) -> float:
    return min(max(value, low), high)


def prob_to_market_odd(percent: float) -> float | None:
    """Odd of one side of a two-way market (goals, both teams score, the recommended play) for a probability in
    percent; None when VYROX IA gives it no chance."""
    if not percent:
        return None
    return round(1 / (TWO_WAY_BOOK / 2 + SHRINK * (percent / 100 - 0.5)), 2)


def odds_1x2(home: float, draw: float, away: float) -> dict[str, float | None]:
    """Home, draw and away odds from a 107.5 % book: the draw within 3.10-3.60, the favourite within 1.45-2.25
    and the underdog with what is left, so the three never all pay more than 2.50. None for a side with no chance."""
    implied_draw = _within(BOOK_1X2 * draw / (home + draw + away), 1 / DRAW[1], 1 / DRAW[0])
    rest = BOOK_1X2 - implied_draw
    favourite = _within(rest * max(home, away) / (home + away) if home + away else rest / 2, 1 / FAVOURITE[1], 1 / FAVOURITE[0])
    # On an even forecast the home side is the favourite, as home advantage makes it.
    leader, trailer = ("home", "away") if home >= away else ("away", "home")
    implied = {leader: favourite, "draw": implied_draw, trailer: rest - favourite}
    return {side: round(1 / implied[side], 2) if percent else None for side, percent in (("home", home), ("draw", draw), ("away", away))}


def pick_odd(odd: float) -> float:
    """A parlay or radar pick's odd, within what a single selection pays."""
    return _within(odd, *PICK)
