"""Radar VYROX IA: the date's strongest picks per market, read from the parlays' forecast (one VYROX IA call per date)."""
import os
from datetime import date

from app.api_football import colombia_today, fetch_matches, group_by_league
from app.odds import odds_1x2, pick_odd, prob_to_market_odd
from app.parlays import MAX_CANDIDATES, MatchForecast, day_forecasts, kickoff, simulated_forecast, upcoming

LOW, HIGH = 55, 92  # a trend starts at 55 %, and no pick is shown as surer than 92 %
PER_MARKET = 8
CATEGORIES = [
    ("bankers_1x2", "Fijos del Día (1X2)"),
    ("over_2_5", "Tendencia +2.5 Goles"),
    ("btts_yes", "Especial Ambos Anotan"),
    ("under_2_5", "Partidos Cerrados (-2.5)"),
]
NO_MATCHES = "No hay partidos en esta fecha para el radar."


def _markets(match: dict, forecast: MatchForecast) -> dict[str, tuple[str, int, str, str, float | None]]:
    """Each radar market's pick for one match: (selection, probability, slip category, insight, market odd)."""
    home, away = match["homeTeam"]["shortName"], match["awayTeam"]["shortName"]
    r = forecast.result
    (team, _, side), (rival, other, _) = sorted([(home, r.home, "home"), (away, r.away, "away")], key=lambda option: -option[1])
    win, over, under, btts = (min(p, HIGH) for p in (max(r.home, r.away), forecast.over_2_5, 100 - forecast.over_2_5, forecast.btts))
    # Priced as in the parlays, 1X2 from its whole book, so the same pick has the same odd in both.
    favourite = odds_1x2(r.home, r.draw, r.away)[side]
    # Selections and categories the bet slip already settles: "result", "goals" and "btts".
    return {
        "bankers_1x2": (
            f"{team} - Resultado del partido", win, "result", f"{team} parte como favorito: {win}% de victoria y {other}% para {rival}.", favourite
        ),
        "over_2_5": (
            "Más de 2.5 - Goles totales", over, "goals", f"Partido abierto: {over}% de ver 3 goles o más y {btts}% de que marquen los dos.", prob_to_market_odd(over)
        ),
        "btts_yes": (
            "Sí - Ambos anotan", btts, "btts", f"Los dos ataques pesan: {btts}% de que ambos marquen y {over}% de más de 2.5 goles.", prob_to_market_odd(btts)
        ),
        "under_2_5": (
            "Menos de 2.5 - Goles totales", under, "goals", f"Duelo cerrado: {under}% de 2 goles o menos, con el empate en {r.draw}%.", prob_to_market_odd(under)
        ),
    }


def _item(match: dict, pick: tuple[str, int, str, str, float]) -> dict:
    selection, percent, category, insight, odd = pick
    league = match["league"]
    return {
        "match_id": match["id"],
        "league_id": league["league_id"],
        "league_name": league["league_name"],
        "league_logo": league["league_logo"],
        "country_flag": league["country_flag"],
        "home_team": match["homeTeam"]["shortName"],
        "away_team": match["awayTeam"]["shortName"],
        "home_logo": match["homeTeam"]["crest"],
        "away_logo": match["awayTeam"]["crest"],
        "kickoff_label": kickoff(match),
        "market_category": category,
        "market_selection": selection,
        "probability": percent,
        "market_odd": pick_odd(odd),  # estimated market odd, bookmaker margin included
        "confidence_badge": "ALTA" if percent >= 70 else "MEDIA",
        "insight": insight,
    }


async def get_radar(day: date | None = None) -> dict:
    """Up to 8 picks per market from 55 %, likeliest first: VYROX IA's, or flagged simulated ones without it."""
    day = day or colombia_today()
    matches, _ = await fetch_matches(day)
    candidates = upcoming(matches)
    played = not candidates
    if played:  # a day already played: its matches as a reference that takes no plays
        candidates = [m for group in group_by_league(matches) for m in group["matches"]][:MAX_CANDIDATES]
    if not candidates:
        return {"categories": [], "simulated": False, "played": False, "message": NO_MATCHES}

    forecasts = await day_forecasts(day, candidates) if os.environ.get("GEMINI_API_KEY") else None
    simulated = not (forecasts and any(m["id"] in forecasts for m in candidates))
    if simulated:  # without VYROX IA the radar still works, with demo data the interface labels
        forecasts = {m["id"]: simulated_forecast(m["id"]) for m in candidates}
    rows = [(m, _markets(m, forecasts[m["id"]])) for m in candidates if m["id"] in forecasts]
    categories = [
        {
            "key": key,
            "title": title,
            # Stable sort: equal probabilities keep the top leagues and earlier kickoffs first.
            "items": [_item(m, picks[key]) for m, picks in sorted(rows, key=lambda row: -row[1][key][1]) if picks[key][1] >= LOW][:PER_MARKET],
        }
        for key, title in CATEGORIES
    ]
    return {"categories": categories, "simulated": simulated, "played": played, "message": None}
