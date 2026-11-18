"""VYROX IA's real record: today's Radar IA picks are saved before kickoff and settled with the final scores."""
import logging
import time
from datetime import date, timedelta

from app import db
from app.api_football import DAYS_AVAILABLE, colombia_today, fetch_matches
from app.radar import get_radar

log = logging.getLogger(__name__)
DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]
# Whether a pick won with a final score, by its market.
OUTCOME = {
    "home_win": lambda home, away: home > away,
    "away_win": lambda home, away: away > home,
    "over_2_5": lambda home, away: home + away > 2.5,
    "under_2_5": lambda home, away: home + away < 2.5,
    "btts_yes": lambda home, away: home > 0 and away > 0,
}
RECORD_EVERY = 600  # seconds: the radar's picks only change when its forecast does
WINDOW = 30  # days of record the Rendimiento IA view charts
_recorded_at = -float("inf")


def radar_rows(radar: dict, day: date) -> list[dict]:
    """The table's rows for a day's radar: one per match and market, at the odd the radar shows."""
    rows = {}
    for category in radar["categories"]:
        for item in category["items"]:
            market = category["key"]
            if market == "bankers_1x2":  # the favourite: home or away
                market = "home_win" if item["market_selection"].startswith(f"{item['home_team']} - ") else "away_win"
            rows[(item["match_id"], market)] = {
                "match_id": item["match_id"],
                "date": day.isoformat(),
                "league": item["league_name"],
                "teams": f"{item['home_team']} vs {item['away_team']}",
                "market": market,
                "prediction": item["market_selection"],
                "odd": item["market_odd"],
                "status": "pending",
            }
    return list(rows.values())


async def record_today() -> None:
    """Saves today's radar picks, at most every 10 minutes; never with demo data or a day already played."""
    global _recorded_at
    if time.monotonic() - _recorded_at < RECORD_EVERY or not await db.client():
        return
    _recorded_at = time.monotonic()
    today = colombia_today()
    try:
        radar = await get_radar(today)
        if not radar["simulated"] and not radar["played"]:
            await db.insert_new(radar_rows(radar, today))
    except Exception as error:  # the history must never break the page that triggered it
        log.warning("Could not record today's picks: %r", error)


def settle(rows: list[dict], matches: list[dict]) -> dict[int, str]:
    """The new status of each pending row whose match has finished: won or lost."""
    scores = {m["id"]: m["score"]["fullTime"] for m in matches if m["status"] == "FINISHED"}
    return {
        row["id"]: "won" if OUTCOME[row["market"]](score["home"], score["away"]) else "lost"
        for row in rows
        if (score := scores.get(row["match_id"])) and score["home"] is not None and score["away"] is not None
    }


async def resolve_pending() -> dict:
    """Settles the pending picks up to today with API-Football's final scores: one cached request per date."""
    today = colombia_today()
    rows = await db.pending_until(today)
    by_date: dict[str, list[dict]] = {}
    for row in rows:
        by_date.setdefault(row["date"], []).append(row)
    resolved, unreachable = 0, 0
    for day, day_rows in by_date.items():
        if (today - date.fromisoformat(day)).days > DAYS_AVAILABLE:  # the free plan no longer serves that date
            unreachable += len(day_rows)
            continue
        matches, sample = await fetch_matches(date.fromisoformat(day))
        if sample:
            continue  # without an API-Football key there are no real scores to settle with
        for row_id, status in settle(day_rows, matches).items():
            await db.set_status(row_id, status)
            resolved += 1
    return {"resolved": resolved, "pending": len(rows) - resolved - unreachable, "unreachable": unreachable}


def net(row: dict) -> float:
    """What a settled pick made, in units, at a stake of one unit: its odd less the stake, or the stake lost."""
    return float(row["odd"]) - 1 if row["status"] == "won" else -1.0


def summarize(rows: list[dict], today: date) -> dict:
    """The record of the last 30 days from its settled rows: KPIs at a flat stake of one unit, the running net profit
    day by day (from the day before the first settled pick, at 0) and the last hits."""
    rows = [row for row in rows if row["date"] >= (today - timedelta(days=WINDOW - 1)).isoformat()]
    won = [row for row in rows if row["status"] == "won"]
    kpis = None
    if rows:
        profit = sum(net(row) for row in rows)
        kpis = {
            "profit": round(profit, 2),  # units
            "win_rate": round(100 * len(won) / len(rows)),
            "avg_odd": round(sum(float(row["odd"]) for row in rows) / len(rows), 2),
            "roi": f"{profit / len(rows) * 100:+.1f}%",
            "picks": len(rows),
        }
    start = date.fromisoformat(min(row["date"] for row in rows)) - timedelta(days=1) if rows else today
    daily, running = [], 0.0
    for back in range((today - start).days, -1, -1):
        day = today - timedelta(days=back)
        of_day = [row for row in rows if row["date"] == day.isoformat()]
        running += sum(net(row) for row in of_day)
        daily.append({
            "date": day.strftime("%d/%m"),
            "day": DAYS[day.weekday()],
            "won": sum(1 for row in of_day if row["status"] == "won"),
            "lost": sum(1 for row in of_day if row["status"] == "lost"),
            "profit": round(running, 2),  # running net profit up to this day, in units
        })
    return {
        "kpis": kpis,  # None until a pick is settled
        "daily": daily,
        "recent_hits": [
            {"match": row["teams"], "market": row["prediction"], "odd": float(row["odd"]), "date": date.fromisoformat(row["date"]).strftime("%d/%m")}
            for row in sorted(won, key=lambda row: (row["date"], row["id"]), reverse=True)[:3]
        ],
    }


async def get_performance() -> dict:
    today = colombia_today()
    # shortcut: Supabase answers up to 1000 rows per query, about 33 settled picks a day for 30 days; page the query
    # if the radar ever saves more
    return summarize(await db.settled_since(today - timedelta(days=WINDOW - 1)), today)
