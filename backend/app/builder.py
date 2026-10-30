"""Constructor Inteligente VYROX IA: the parlay nearest a target odd, from the radar's cached forecast of the day."""
import itertools
import math
from datetime import date

from app.api_football import colombia_today
from app.odds import PICK, odds_1x2, prob_to_market_odd
from app.parlays import MatchForecast, _leg
from app.radar import forecast_rows

MAX_ODD = 2.65  # the builder also takes picks a little riskier than the parlays' favourites
TOLERANCE = math.log(1.2)  # a total within 20 % of the target is on target
CLOSE = math.log(1.05)  # totals within 5 % of each other are equally close, so the likelier slip wins
LEG_ODD = 1.55  # "auto" splits the target into legs of about this odd, inside the safe 1.30-1.85
TOP = 10  # "Otra combinación" rotates through the best mixes of matches
MARKETS = {"all": {"result", "over_1_5", "goals", "btts"}, "1x2": {"result"}, "goals": {"over_1_5", "goals"}, "btts": {"btts"}}
NO_MATCHES = "No hay suficientes partidos con este mercado para armar la combinada."


def _picks(match: dict, forecast: MatchForecast, markets: set[str]) -> list[tuple[str, int, str, float]]:
    """Every selection of one match the builder may take: (selection, probability, slip category, market odd)."""
    home, away = match["homeTeam"]["shortName"], match["awayTeam"]["shortName"]
    r = forecast.result
    prices = odds_1x2(r.home, r.draw, r.away)
    options = [
        (f"{home} - Resultado del partido", r.home, "result", prices["home"]),
        ("Empate - Resultado del partido", r.draw, "result", prices["draw"]),
        (f"{away} - Resultado del partido", r.away, "result", prices["away"]),
    ]
    two_way = [
        ("Más de 1.5 - Goles totales", "Menos de 1.5 - Goles totales", forecast.over_1_5, "over_1_5"),
        ("Más de 2.5 - Goles totales", "Menos de 2.5 - Goles totales", forecast.over_2_5, "goals"),
        ("Sí - Ambos anotan", "No - Ambos anotan", forecast.btts, "btts"),
    ]
    for yes, no, percent, category in two_way:
        options += [(yes, percent, category, prob_to_market_odd(percent)), (no, 100 - percent, category, prob_to_market_odd(100 - percent))]
    # The parlays' 1.22 floor, so a pick shared with them has the same odd and the bet slip treats both as one.
    return [(label, percent, category, max(odd, PICK[0])) for label, percent, category, odd in options if category in markets and odd and odd <= MAX_ODD]


def _mixes(rows: list[tuple[dict, MatchForecast]], target: float, count: int, market: str) -> list[tuple[float, float, tuple]]:
    """The best slip of every mix of `count` matches (fewer when the market has fewer), as (total odd, joint
    probability, legs): closest to the target first, then likeliest. One selection per match."""
    catalog = [(match, picks) for match, forecast in rows if (picks := _picks(match, forecast, MARKETS[market]))]
    count = min(count, len(catalog))
    if count < 2:
        return []
    goal = math.log(target)
    # For a given total, near-even odds give the likeliest slip (log probability is concave in log odd), so each
    # match only offers its two picks nearest the per-leg odd, and each slip is scored with sums of logs.
    near = [
        sorted([(math.log(pick[3]), math.log(pick[1] / 100), match, pick) for pick in picks], key=lambda leg: abs(leg[0] - goal / count))[:2]
        for match, picks in catalog
    ]
    likeliest = sorted(range(len(near)), key=lambda i: -max(leg[1] for leg in near[i]))[: count + 4]
    near = [near[i] for i in sorted(likeliest)]  # the likeliest matches, top leagues first: 210 mixes at most
    best = [
        # Each mix of matches keeps its likeliest slip among the closest to the target.
        min(
            (((int(abs(sum(leg[0] for leg in slip) - goal) / CLOSE), -sum(leg[1] for leg in slip)), slip) for slip in itertools.product(*matches)),
            key=lambda entry: entry[0],
        )
        for matches in itertools.combinations(near, count)
    ]
    best.sort(key=lambda entry: entry[0])
    return [
        (math.prod(leg[3][3] for leg in slip), math.exp(-chance), tuple((leg[2], leg[3]) for leg in slip))
        for (_, chance), slip in best
    ]


async def get_builder(day: date | None, target: float, legs: int | None, market: str, variant: int) -> dict:
    """VYROX IA's slip nearest `target`: the variant-th of the best mixes on target (or of the closest ones)."""
    rows, simulated, played = await forecast_rows(day or colombia_today())
    mixes = []
    # "Auto" tries the leg counts whose per-leg odd is nearest 1.55 first, until one lands on target: a market whose
    # picks all pay 1.55 or more needs fewer legs to reach x7.5.
    for count in [legs] if legs else sorted(range(2, 7), key=lambda n: abs(math.log(target) / n - math.log(LEG_ODD))):
        found = _mixes(rows, target, count, market)
        if found and abs(math.log(found[0][0] / target)) <= TOLERANCE:
            mixes = found
            break
        mixes = mixes or found  # none on target: the closest slips of the likeliest count
    if not mixes:
        return {"legs": [], "total_odd": 0, "probability": 0, "legs_count": 0, "on_target": False, "simulated": False, "played": False, "message": NO_MATCHES}
    pool = ([mix for mix in mixes if abs(math.log(mix[0] / target)) <= TOLERANCE] or mixes)[:TOP]
    odd, chance, slip = pool[variant % len(pool)]
    return {
        "legs": [_leg(match, pick) for match, pick in slip],
        "total_odd": round(odd, 2),
        "probability": round(chance * 100),
        "legs_count": len(slip),
        "on_target": abs(math.log(odd / target)) <= TOLERANCE,
        "simulated": simulated,
        "played": played,  # a day already played: the slip is a reference that takes no plays
        "message": None,
    }
