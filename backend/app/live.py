"""In-play chances: a match's expected goals carried to its score and minute, with a Poisson model of the goals left.
They spend no request: the score comes in the match list and the pre-match forecast, if any, from the day's cache."""
import math
from itertools import product

GOALS = range(11)  # goals still to come per side; more barely count
LEAGUE_GOALS = (1.45, 1.15)  # an average match's expected goals per side, for a match VYROX IA did not forecast


def _chances(mean: float) -> list[float]:
    return [math.exp(-mean) * mean**goals / math.factorial(goals) for goals in GOALS]


def _solve(f, target: float, low: float, high: float) -> float:
    """Bisection: where an increasing function reaches the target between low and high."""
    for _ in range(30):
        middle = (low + high) / 2
        if f(middle) < target:
            low = middle
        else:
            high = middle
    return (low + high) / 2


def _home_share(home: float, away: float) -> float:
    """The home side's share of the decisive results."""
    of_home, of_away = _chances(home), _chances(away)
    wins = sum(of_home[h] * of_away[a] for h, a in product(GOALS, GOALS) if h > a)
    losses = sum(of_home[h] * of_away[a] for h, a in product(GOALS, GOALS) if a > h)
    return wins / (wins + losses)


def expected_goals(home: int, away: int, over_2_5: int) -> tuple[float, float]:
    """Each side's expected goals for a forecast in percent, as the frontend's fitModel: the total that gives its
    chance of more than 2.5, split so the home side takes the share of the decisive results its chances give it."""
    total = _solve(lambda mean: 1 - math.exp(-mean) * (1 + mean + mean**2 / 2), over_2_5 / 100, 0.2, 8)
    share = _solve(lambda part: _home_share(total * part, total * (1 - part)), home / (home + away) if home + away else 0.5, 0.02, 0.98)
    return total * share, total * (1 - share)


def chances_at(goals: tuple[float, float], minute: int, home: int, away: int) -> dict[str, float]:
    """How the match ends from this score and minute, in percent: the goals left are the expected ones for the time left."""
    left = max(90 - minute, 0) / 90
    of_home, of_away = _chances(goals[0] * left), _chances(goals[1] * left)
    ends = [(home + h, away + a, of_home[h] * of_away[a]) for h, a in product(GOALS, GOALS)]

    def chance(wins) -> float:
        return 100 * sum(p for h, a, p in ends if wins(h, a))

    return {
        "home": chance(lambda h, a: h > a),
        "draw": chance(lambda h, a: h == a),
        "away": chance(lambda h, a: a > h),
        "over_1_5": chance(lambda h, a: h + a > 1.5),
        "over_2_5": chance(lambda h, a: h + a > 2.5),
        "btts": chance(lambda h, a: h > 0 and a > 0),
    }
