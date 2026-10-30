"""Momentum IA: each side's attacking pressure in a live match, from the statistics the Match Center already
fetches. It spends no API-Football request: a live match is measured each time its Match Center loads."""
import math
import time

LIVE = ("IN_PLAY", "PAUSED")
WINDOW = 15  # minutes of play that count as recent, and the horizon of the goal estimate
# Shots weigh more on target and inside the box: API-Football counts no "dangerous attacks", box shots stand in.
WEIGHTS = {"Total Shots": 1, "Shots on Goal": 2, "Shots insidebox": 1.5, "Corner Kicks": 1.5}
KINDS = (*WEIGHTS, "Ball Possession", "Red Cards")
SCALE = 7.2  # 10 weighted actions in 15 minutes make 75 of pressure; an average side makes 7, about 61
AVERAGE = 61
GOALS_PER_MINUTE = 1.35 / 90  # an average side scores 1.35 goals a match
HOT = 75
CLEAR = 20  # points of pressure between the sides that make a domination
FRESH = 600  # seconds a measurement keeps showing in the match list

# shortcut: one entry per measured match, never evicted; fine for the matches opened in a day
_snapshots: dict[int, list[tuple[int, dict]]] = {}  # match id -> [(minute, counts)], the last 15 minutes
_measured: dict[int, tuple[float, dict]] = {}  # match id -> (monotonic time, momentum fields)


def pressure(now: dict, minute: int, goals: tuple[int, int], earlier: tuple[int, dict] | None = None) -> dict:
    """Each side's pressure from 0 to 100, the match's momentum and the chance of a goal in the next 15 minutes.
    `now` holds each side's counts ({"home": {kind: n}, "away": ...}); the pace since `earlier`, a measurement
    5 to 15 minutes back as (minute, counts), weighs more than the whole match's."""

    def attack(side: str, other: str) -> float:
        def actions(counts: dict) -> float:
            return sum(weight * counts[side].get(kind, 0) for kind, weight in WEIGHTS.items())

        pace = actions(now) * WINDOW / max(minute, 1)
        recent = (actions(now) - actions(earlier[1])) * WINDOW / (minute - earlier[0]) if earlier else pace
        value = (0.6 * recent + 0.4 * pace) * (0.75 + (now[side].get("Ball Possession") or 50) / 200)  # 50 % keeps it
        return value * (1 + 0.15 * (now[other].get("Red Cards", 0) - now[side].get("Red Cards", 0)))  # a man up pushes more

    home, away = (round(100 * (1 - math.exp(-max(attack(side, other), 0) / SCALE))) for side, other in (("home", "away"), ("away", "home")))
    tight = abs(goals[0] - goals[1]) <= 1
    if (home + away) / 2 > HOT or (max(home, away) >= HOT and abs(home - away) >= CLEAR and tight):
        status = "high_voltage"
    elif home - away >= CLEAR:
        status = "home_domination"
    elif away - home >= CLEAR:
        status = "away_domination"
    else:
        status = "balanced"
    rate = GOALS_PER_MINUTE * ((home / AVERAGE) ** 2 + (away / AVERAGE) ** 2)
    return {
        "home_pressure": home,
        "away_pressure": away,
        "momentum_status": status,
        "goal_probability_next_15m": min(95, round(100 * (1 - math.exp(-rate * WINDOW)))),
    }


def measure(match_id: int, minute: int, now: dict, goals: tuple[int, int]) -> dict:
    """A live match's momentum now, against its measurement 5 to 15 minutes back when there is one. The match list
    shows it for the next 10 minutes."""
    history = [snapshot for snapshot in _snapshots.get(match_id, []) if minute - WINDOW <= snapshot[0] < minute]
    earlier = next((snapshot for snapshot in history if minute - snapshot[0] >= 5), None)  # the oldest one in the window
    fields = pressure(now, minute, goals, earlier)
    _snapshots[match_id] = [*history, (minute, now)]
    _measured[match_id] = (time.monotonic(), fields)
    return fields


def with_momentum(matches: list[dict]) -> list[dict]:
    """The match list, with the momentum of every live match measured in the last 10 minutes."""
    fresh = {match_id: fields for match_id, (at, fields) in _measured.items() if time.monotonic() - at < FRESH}
    return [{**match, **fresh[match["id"]]} if match["status"] in LIVE and match["id"] in fresh else match for match in matches]
