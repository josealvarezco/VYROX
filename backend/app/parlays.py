"""Popular parlays: one VYROX IA forecast per date for the upcoming matches, combined into three slips."""
import asyncio
import itertools
import math
import os
import random
import time
from collections.abc import Callable
from datetime import date, datetime, timedelta, timezone

from pydantic import BaseModel

from app.api_football import colombia_today, fetch_matches, group_by_league
from app.gemini import Percent, Probabilities, ask_vyrox_ia
from app.live import LEAGUE_GOALS, chances_at, expected_goals
from app.momentum import LIVE
from app.odds import PICK, live_odd, odds_1x2, pick_odd, prob_to_market_odd

FORECAST_TTL = 21600  # 6 hours: one VYROX IA call per date and period
RETRY_TTL = 300  # never ask VYROX IA again within 5 minutes, even after a failure
MAX_CANDIDATES = 12  # top leagues first; keeps the single daily prompt short
ENOUGH_MATCHES = 5  # with fewer still to be played, the live ones join and VYROX IA is asked about any left uncovered
SLIP_LEGS = 3  # the selections a slip takes
SAFE_CHANCE = 62  # what a pick of the Combinada Segura needs, in percent
SAFE_ODD = (1.22, 1.52)
SAFE_TOTAL = (2.0, 2.9)
MIX = ("result", "btts", "goals")  # the markets the Multi Valor goes through
LIVE_UNTIL = 75  # from this minute a live match no longer goes into a slip
MIN_MATCHES = 3  # with fewer matches open today, the page points to tomorrow's
NO_MATCHES = "No hay suficientes partidos por jugar en esta fecha para armar combinadas."


class MatchForecast(BaseModel):
    match_id: int
    result: Probabilities
    over_1_5: Percent
    over_2_5: Percent
    btts: Percent


class DayForecast(BaseModel):
    matches: list[MatchForecast]


# (asked at, forecast by match_id), with None for a failed call; the radar reads the same forecast.
# shortcut: one entry per date ever asked, never evicted; fine for the three dates the free plan serves
parlays_cache: dict[date, tuple[float, dict[int, MatchForecast] | None]] = {}
_lock = asyncio.Lock()

PROMPT = """Eres VYROX IA, el motor propietario de analítica avanzada y predicción deportiva de VYROX, experto en fútbol.
Estima probabilidades para estos partidos por jugar (match_id: local vs visitante, liga, hora de Colombia):
{lines}

Para cada partido devuelve su match_id y probabilidades enteras de 0 a 100:
- result: victoria local (home), empate (draw) y victoria visitante (away); deben sumar 100.
- over_1_5 y over_2_5: más de 1.5 y más de 2.5 goles en el partido (over_2_5 nunca mayor que over_1_5).
- btts: que ambos equipos anoten.
Usa solo los match_id de la lista."""


def kickoff(match: dict) -> str:
    return datetime.fromisoformat(match["utcDate"]).strftime("%d/%m %H:%M")  # dates carry Colombia's offset


def still_open(match: dict, until: int) -> bool:
    """Whether a match is live before this minute; without a minute there is no telling."""
    minute = match.get("minute")
    return match["status"] in LIVE and minute is not None and minute < until


def live_forecast(match: dict, forecast: MatchForecast | None) -> MatchForecast:
    """A live match's chances at its score and minute, from its pre-match forecast or else from an average match."""
    goals = expected_goals(forecast.result.home, forecast.result.away, forecast.over_2_5) if forecast else LEAGUE_GOALS
    score = match["score"]["fullTime"]
    chances = {key: round(value) for key, value in chances_at(goals, match["minute"], score["home"] or 0, score["away"] or 0).items()}
    return MatchForecast(
        match_id=match["id"],
        result=Probabilities(home=chances["home"], draw=chances["draw"], away=chances["away"]),
        over_1_5=chances["over_1_5"],
        over_2_5=chances["over_2_5"],
        btts=chances["btts"],
    )


def prices(match: dict, forecast: MatchForecast) -> tuple[dict[str, float | None], Callable[[float], float | None]]:
    """A match's 1X2 odds and how it prices a two-way market. In play every side goes by its own chance: the
    pre-match book's ranges no longer hold once the score moves."""
    r = forecast.result
    if match["status"] in LIVE:
        return {"home": live_odd(r.home), "draw": live_odd(r.draw), "away": live_odd(r.away)}, live_odd
    return odds_1x2(r.home, r.draw, r.away), prob_to_market_odd


def _options(match: dict, forecast: MatchForecast) -> dict[str, tuple[str, int, str, float | None]]:
    """The likeliest side of each market, as (selection label, probability, market category, market odd)."""
    home, away = match["homeTeam"]["shortName"], match["awayTeam"]["shortName"]
    r = forecast.result
    book, price = prices(match, forecast)
    result = max(
        [
            (f"{home} - Resultado del partido", r.home, book["home"]),
            ("Empate - Resultado del partido", r.draw, book["draw"]),
            (f"{away} - Resultado del partido", r.away, book["away"]),
        ],
        key=lambda option: option[1],
    )
    over = forecast.over_2_5
    goals = ("Más de 2.5 - Goles totales", over) if over >= 50 else ("Menos de 2.5 - Goles totales", 100 - over)
    btts = ("Sí - Ambos anotan", forecast.btts) if forecast.btts >= 50 else ("No - Ambos anotan", 100 - forecast.btts)
    two_way = {"over_1_5": ("Más de 1.5 - Goles totales", forecast.over_1_5), "goals": goals, "btts": btts}
    options = {"result": result} | {category: (label, percent, price(percent)) for category, (label, percent) in two_way.items()}
    if match["status"] not in LIVE:
        return {category: (label, percent, category, pick_odd(odd) if odd else None) for category, (label, percent, odd) in options.items()}
    # In play a market the score all but settled takes no picks: it gives way to the likeliest open one, and with none
    # open the match sits out. Under the 1.22 floor a pick is too close to settled to go into a slip.
    priced = {category: (label, percent, category, odd) for category, (label, percent, odd) in options.items()}
    fair = [option for option in priced.values() if option[3] and option[3] >= PICK[0]]
    return {category: option if option in fair else max(fair, key=lambda other: other[1]) for category, option in priced.items()} if fair else {}


def _leg(match: dict, selection: tuple[str, int, str, float]) -> dict:
    market, percent, category, odd = selection
    league = match["league"]
    score = match["score"]["fullTime"]
    return {
        "match_id": match["id"],
        "league_name": league["league_name"],
        "league_logo": league["league_logo"],
        "country_flag": league["country_flag"],
        "home_team": match["homeTeam"]["shortName"],
        "away_team": match["awayTeam"]["shortName"],
        "kickoff_label": kickoff(match),
        "live_label": f"En vivo {match['minute']}' · {score['home']} - {score['away']}" if match["status"] in LIVE else None,
        "market_selection": market,
        "market_category": category,  # the bet slip keeps one side per match and category
        "probability": percent,
        "odd": odd,  # estimated market odd, bookmaker margin included
        "popularity_label": f"{percent}% prob.",  # the leg's real VYROX IA probability, never a made-up crowd count
    }


def _parlay(key: str, title: str, badge: str, rows: list[tuple[dict, tuple[str, int, str, float]]]) -> dict:
    legs = [_leg(match, selection) for match, selection in rows]
    return {
        "key": key,
        "title": title,
        "badge": badge,
        "legs": legs,
        "total_odd": round(math.prod(leg["odd"] for leg in legs), 2),
        "probability": round(math.prod(leg["probability"] / 100 for leg in legs) * 100),  # different matches: independent
    }


def _safest(rows: list[tuple[dict, dict]]) -> list[tuple[dict, tuple]]:
    """The Combinada Segura: the likeliest three picks of different matches, each from 62 % at 1.22-1.52, whose total
    falls within 2.00-2.90. With no such three, the likeliest pick of the likeliest matches."""
    picks = [
        (match, option)
        for match, options in rows
        for option in options.values()
        if option[1] >= SAFE_CHANCE and option[3] and SAFE_ODD[0] <= option[3] <= SAFE_ODD[1]
    ]
    trios = [
        trio
        for trio in itertools.combinations(picks, SLIP_LEGS)
        if len({match["id"] for match, _ in trio}) == SLIP_LEGS and SAFE_TOTAL[0] <= math.prod(option[3] for _, option in trio) <= SAFE_TOTAL[1]
    ]
    if trios:
        return list(max(trios, key=lambda trio: math.prod(option[1] for _, option in trio)))
    likeliest = ((match, max(options.values(), key=lambda option: option[1])) for match, options in rows)
    return sorted(likeliest, key=lambda row: -row[1][1])[:SLIP_LEGS]


def _fresh(rows: list[tuple[dict, dict]], used: set[tuple[int, str]], choose) -> list[tuple[dict, tuple]]:
    """Up to three picks of different matches that no earlier slip took, each what `choose` prefers among those of its
    match. Matches no slip touched come first, so the slips differ in their matches when the day has enough."""
    touched = {match_id for match_id, _ in used}
    slip = []
    for match, options in sorted(rows, key=lambda row: row[0]["id"] in touched):
        fresh = [option for option in options.values() if option[3] and (match["id"], option[0]) not in used]
        if fresh and len(slip) < SLIP_LEGS:
            slip.append((match, choose(fresh, len(slip))))
    used.update((match["id"], option[0]) for match, option in slip)
    return slip


def _build(forecasts: list[tuple[dict, MatchForecast]]) -> list[dict]:
    rows = [(match, options) for match, forecast in forecasts if (options := _options(match, forecast))]
    if len(rows) < 2:
        return []
    safe = _safest(rows)
    used = {(match["id"], option[0]) for match, option in safe}  # no slip repeats a pick another one took
    mixed = _fresh(rows, used, lambda fresh, leg: next((option for option in fresh if option[2] == MIX[leg % 3]), fresh[0]))
    # "Attractive" picks: the market closest to 55 %, an odd near 1.75, from the most popular leagues.
    trending = _fresh(rows, used, lambda fresh, _: min(fresh, key=lambda option: abs(option[1] - 55)))
    slips = [
        _parlay("segura", "Combinada Segura IA", "BAJO RIESGO", safe),
        _parlay("valor", "Multi Valor VYROX", "VALOR IA", mixed),
        _parlay("tendencia", "Selecciones en Tendencia", "TENDENCIA", trending),
    ]
    return [slip for slip in slips if len(slip["legs"]) >= 2]


def simulated_forecast(match_id: int) -> MatchForecast:
    """Demo forecast for when VYROX IA is unavailable; the response flags it so it never passes for analysis."""
    rnd = random.Random(match_id)  # the same demo parlays on every request
    home = rnd.randint(25, 70)
    draw = rnd.randint(15, min(35, 95 - home))
    over_1_5 = rnd.randint(60, 90)
    return MatchForecast(
        match_id=match_id,
        result=Probabilities(home=home, draw=draw, away=100 - home - draw),
        over_1_5=over_1_5,
        over_2_5=rnd.randint(30, over_1_5 - 10),
        btts=rnd.randint(35, 70),
    )


async def day_forecasts(day: date, candidates: list[dict]) -> dict[int, MatchForecast] | None:
    """VYROX IA's cached forecast for the date, or None while it fails."""
    async with _lock:  # concurrent first visits share one VYROX IA call
        asked, forecasts = parlays_cache.get(day, (-math.inf, None))
        age = time.monotonic() - asked
        if not candidates:  # only live matches left: they read what is cached, and VYROX IA is not asked about them
            return forecasts
        covered = sum(m["id"] in forecasts for m in candidates) if forecasts else 0
        # Asked again when it expires, or when kickoffs left it without enough of the upcoming matches.
        if age < FORECAST_TTL and (age < RETRY_TTL or covered >= min(len(candidates), ENOUGH_MATCHES)):
            return forecasts
        lines = "\n".join(
            f"- {m['id']}: {m['homeTeam']['shortName']} vs {m['awayTeam']['shortName']}, {m['league']['league_name']}, {kickoff(m)}"
            for m in candidates
        )
        answer = await ask_vyrox_ia(PROMPT.format(lines=lines), DayForecast, f"parlays {day}")
        # Added to the earlier ones: a match already live still starts its in-play chances from its own forecast.
        forecasts = {**(forecasts or {}), **{f.match_id: f for f in answer.matches}} if answer else forecasts
        parlays_cache[day] = (time.monotonic(), forecasts)
        return forecasts


def upcoming(matches: list[dict]) -> list[dict]:
    """The matches still to be played, top leagues first, as many as one VYROX IA prompt takes."""
    # Recomputed on every request, so matches that have started drop out while the forecast stays cached.
    # The kickoff time counts too: API-Football leaves matches without live coverage "not started" for good.
    now = datetime.now(timezone.utc)
    return [
        m for group in group_by_league(matches) for m in group["matches"] if m["status"] == "TIMED" and datetime.fromisoformat(m["utcDate"]) > now
    ][:MAX_CANDIDATES]


def next_date(day: date) -> str | None:
    """Where the page sends the user once today runs out of matches; another date has nothing to point to."""
    return (day + timedelta(days=1)).isoformat() if day == colombia_today() else None


async def open_rows(day: date) -> tuple[list[tuple[dict, MatchForecast]], bool]:
    """The matches that take plays now with their forecast, as (rows, simulated): those still to be played and, when
    a slip's worth does not remain, the live ones before minute 75 at their score. None with fewer than 3 in all."""
    matches, _ = await fetch_matches(day)
    candidates = upcoming(matches)
    live = [m for group in group_by_league(matches) for m in group["matches"] if still_open(m, LIVE_UNTIL)] if len(candidates) < ENOUGH_MATCHES else []
    if len(candidates) + len(live) < MIN_MATCHES:
        return [], False
    forecasts = (await day_forecasts(day, candidates) if os.environ.get("GEMINI_API_KEY") else None) or {}
    simulated = sum(m["id"] in forecasts for m in candidates) < min(len(candidates), 2)
    if simulated:  # without VYROX IA the section still works, with demo data the interface labels
        forecasts = {**forecasts, **{m["id"]: simulated_forecast(m["id"]) for m in candidates}}
    rows = [(m, forecasts[m["id"]]) for m in candidates if m["id"] in forecasts]
    return rows + [(m, live_forecast(m, forecasts.get(m["id"]))) for m in live], simulated


async def get_parlays(day: date | None = None) -> dict:
    """The day's three parlays over the matches open to plays: VYROX IA's, or flagged simulated ones without it."""
    day = day or colombia_today()
    rows, simulated = await open_rows(day)
    parlays = _build(rows)
    if not parlays:
        return {"parlays": [], "simulated": False, "message": NO_MATCHES, "next_date": next_date(day)}
    return {"parlays": parlays, "simulated": simulated, "message": None, "next_date": None}
