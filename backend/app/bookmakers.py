"""Real bookmaker odds for one match from API-Football (/odds): 1X2, over/under 2.5 and 1.5, and both teams score.
Asked only when someone opens the Match Center's "Cuotas" tab: one request per match every 3 hours."""
import time

import httpx

from app.api_football import UpstreamError, api_get, api_keys

ODDS_TTL = 10800  # API-Football refreshes pre-match odds every 3 hours
RETRY_TTL = 300
# API-Football's bets and values -> the comparator's markets and sides.
BETS = {
    "Match Winner": {"1x2": {"Home": "home", "Draw": "draw", "Away": "away"}},
    "Goals Over/Under": {"goals_2_5": {"Over 2.5": "over", "Under 2.5": "under"}, "goals_1_5": {"Over 1.5": "over", "Under 1.5": "under"}},
    "Both Teams Score": {"btts": {"Yes": "yes", "No": "no"}},
}
NO_ODDS = {"bookmakers": [], "updated": None}

# shortcut: one entry per match whose odds were opened, never evicted; fine for the matches opened in a day
_odds: dict[int, dict] = {}  # match id -> {"until": monotonic expiry, "data": {...}}


def _quote(odd: float, earlier: float | None) -> dict:
    return {"odd": odd, "trend": "stable" if earlier in (None, odd) else "up" if odd > earlier else "down"}


def _bookmakers(item: dict, before: dict) -> list[dict]:
    """Each bookmaker's markets with every side quoted. A quote's trend compares it with the same bookmaker's previous
    fetch, so an arrow is always a move VYROX saw, never a guess."""
    rows = []
    for bookmaker in item["bookmakers"]:
        markets = {}
        for bet in bookmaker["bets"]:
            for market, sides in BETS.get(bet["name"], {}).items():
                odds = {sides[value["value"]]: float(value["odd"]) for value in bet["values"] if value["value"] in sides}
                if len(odds) == len(sides):
                    earlier = before.get(bookmaker["name"], {}).get(market, {})
                    markets[market] = {side: _quote(odd, earlier.get(side, {}).get("odd")) for side, odd in odds.items()}
        if markets:
            rows.append({"name": bookmaker["name"], "markets": markets})
    return rows


async def get_odds(match_id: int) -> dict:
    """The bookmakers' odds for one match, cached 3 hours; on an upstream failure, the last ones fetched."""
    if not api_keys():
        return NO_ODDS
    entry = _odds.get(match_id)
    if entry and time.monotonic() < entry["until"]:
        return entry["data"]
    try:
        items = await api_get("/odds", {"fixture": match_id})
    except (httpx.HTTPError, UpstreamError):
        if entry:
            entry["until"] = time.monotonic() + RETRY_TTL  # serve the stale odds and retry a bit later
            return entry["data"]
        raise
    before = {row["name"]: row["markets"] for row in entry["data"]["bookmakers"]} if entry else {}
    data = {"bookmakers": _bookmakers(items[0], before), "updated": items[0]["update"]} if items else NO_ODDS
    _odds[match_id] = {"until": time.monotonic() + ODDS_TTL, "data": data}
    return data
