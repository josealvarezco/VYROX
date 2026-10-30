"""Popular parlays: one VYROX IA forecast per date for the upcoming matches, combined into three slips."""
import asyncio
import math
import os
import random
import time
from datetime import date, datetime, timezone

from pydantic import BaseModel

from app.api_football import colombia_today, fetch_matches, group_by_league
from app.gemini import Percent, Probabilities, ask_vyrox_ia
from app.odds import odds_1x2, pick_odd, prob_to_market_odd

FORECAST_TTL = 21600  # 6 hours: one VYROX IA call per date and period
RETRY_TTL = 300  # never ask VYROX IA again within 5 minutes, even after a failure
MAX_CANDIDATES = 12  # top leagues first; keeps the single daily prompt short
LEGS = 5  # the most selections a slip takes
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


def _options(match: dict, forecast: MatchForecast) -> dict[str, tuple[str, int, str, float | None]]:
    """The likeliest side of each market, as (selection label, probability, market category, market odd)."""
    home, away = match["homeTeam"]["shortName"], match["awayTeam"]["shortName"]
    r = forecast.result
    prices = odds_1x2(r.home, r.draw, r.away)
    result = max(
        [
            (f"{home} - Resultado del partido", r.home, prices["home"]),
            ("Empate - Resultado del partido", r.draw, prices["draw"]),
            (f"{away} - Resultado del partido", r.away, prices["away"]),
        ],
        key=lambda option: option[1],
    )
    over = forecast.over_2_5
    goals = ("Más de 2.5 - Goles totales", over) if over >= 50 else ("Menos de 2.5 - Goles totales", 100 - over)
    btts = ("Sí - Ambos anotan", forecast.btts) if forecast.btts >= 50 else ("No - Ambos anotan", 100 - forecast.btts)
    two_way = {"over_1_5": ("Más de 1.5 - Goles totales", forecast.over_1_5), "goals": goals, "btts": btts}
    options = {"result": result} | {category: (label, percent, prob_to_market_odd(percent)) for category, (label, percent) in two_way.items()}
    return {category: (label, percent, category, pick_odd(odd) if odd else None) for category, (label, percent, odd) in options.items()}


def _leg(match: dict, selection: tuple[str, int, str, float]) -> dict:
    market, percent, category, odd = selection
    league = match["league"]
    return {
        "match_id": match["id"],
        "league_name": league["league_name"],
        "league_logo": league["league_logo"],
        "country_flag": league["country_flag"],
        "home_team": match["homeTeam"]["shortName"],
        "away_team": match["awayTeam"]["shortName"],
        "kickoff_label": kickoff(match),
        "market_selection": market,
        "market_category": category,  # the bet slip keeps one side per match and category
        "probability": percent,
        "odd": odd,  # estimated market odd, bookmaker margin included
        "popularity_label": f"{percent}% prob.",  # the leg's real VYROX IA probability, never a made-up crowd count
    }


def _parlay(key: str, title: str, rows: list[tuple[dict, tuple[str, int, str, float]]]) -> dict:
    legs = [_leg(match, selection) for match, selection in rows]
    return {
        "key": key,
        "title": title,
        "legs": legs,
        "total_odd": round(math.prod(leg["odd"] for leg in legs), 2),
        "probability": round(math.prod(leg["probability"] / 100 for leg in legs) * 100),  # different matches: independent
    }


def _build(candidates: list[dict], forecasts: dict[int, MatchForecast]) -> list[dict]:
    rows = [(match, _options(match, forecasts[match["id"]])) for match in candidates if match["id"] in forecasts]
    if len(rows) < 2:
        return []
    by_safety = sorted(
        ((match, max(options["result"], options["over_1_5"], key=lambda option: option[1])) for match, options in rows),
        key=lambda row: -row[1][1],
    )
    safe = by_safety[:4] if len(by_safety) >= 4 and by_safety[3][1][1] >= 70 else by_safety[:3]
    mixed = [(match, options[("result", "btts", "goals")[i % 3]]) for i, (match, options) in enumerate(rows[:LEGS])]
    # "Attractive" picks: the market closest to 55 %, an odd near 1.75, from the most popular leagues.
    trending = [
        (match, min((options["result"], options["goals"], options["btts"]), key=lambda option: abs(option[1] - 55)))
        for match, options in rows[:LEGS]
    ]
    segura = _parlay("segura", "Combinada Segura IA", safe)
    valor = _parlay("valor", "Multi Valor VYROX", mixed)
    tendencia = _parlay("tendencia", "Selecciones en Tendencia", trending)
    # The badge shows the whole slip's chance: a per-leg "85%" would read as the slip's chance.
    segura["badge"] = f"{segura['probability']}% IA"
    valor["badge"] = "MIXTA IA"  # odds with a bookmaker's margin carry no edge, so no "value" claim
    tendencia["badge"] = f"{tendencia['total_odd']:.2f}"
    return [segura, valor, tendencia]


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
        covered = sum(m["id"] in forecasts for m in candidates) if forecasts else 0
        # Asked again when it expires, or when kickoffs left it without enough of the upcoming matches.
        if age < FORECAST_TTL and (age < RETRY_TTL or covered >= min(len(candidates), LEGS)):
            return forecasts
        lines = "\n".join(
            f"- {m['id']}: {m['homeTeam']['shortName']} vs {m['awayTeam']['shortName']}, {m['league']['league_name']}, {kickoff(m)}"
            for m in candidates
        )
        answer = await ask_vyrox_ia(PROMPT.format(lines=lines), DayForecast, f"parlays {day}")
        forecasts = {f.match_id: f for f in answer.matches} if answer else None
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


async def get_parlays(day: date | None = None) -> dict:
    """The day's three parlays over matches still to be played: VYROX IA's, or flagged simulated ones without it."""
    day = day or colombia_today()
    matches, _ = await fetch_matches(day)
    candidates = upcoming(matches)
    if len(candidates) < 2:
        return {"parlays": [], "simulated": False, "message": NO_MATCHES}

    forecasts = await day_forecasts(day, candidates) if os.environ.get("GEMINI_API_KEY") else None
    parlays = _build(candidates, forecasts) if forecasts else []
    simulated = not parlays  # without VYROX IA the section still works, with demo data the interface labels
    if simulated:
        parlays = _build(candidates, {m["id"]: simulated_forecast(m["id"]) for m in candidates})
    return {"parlays": parlays, "simulated": simulated, "message": None}
