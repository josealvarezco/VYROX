"""League table for the Match Center's "Clasificación" tab: one API-Football request per league and season every 12 hours."""
import asyncio
import os
import random
import time

import httpx

from app.api_football import CACHE_TTL, UpstreamError, api_get

STANDINGS_TTL = 43200  # 12 hours: one table serves every match of the league
FORM = {"W": "V", "D": "E", "L": "D"}  # win, draw and loss in Spanish: victoria, empate, derrota

# (league_id, season) -> {"until": monotonic expiry, "groups": API-Football's tables, [] when there is none}
# shortcut: entries are never evicted; fine for the few leagues people open, prune if the server runs for weeks
standings_cache: dict[tuple[int, int], dict] = {}
_lock = asyncio.Lock()


def _zone(description: str | None) -> str | None:
    """The competition a zone leads to, or "Descenso": "Promotion - Champions League (League phase: )" -> "Champions League"."""
    if not description:
        return None
    # shortcut: the phase in parentheses is dropped, so zones of one competition merge (Champions League top 8 and 9-24);
    # translate the phases if that difference matters
    return "Descenso" if description.startswith("Relegation") else description.split(" (")[0].removeprefix("Promotion - ")


def _row(row: dict) -> dict:
    games = row["all"]
    return {
        "rank": row["rank"],
        "team_id": row["team"]["id"],
        "team_name": row["team"]["name"],
        "team_logo": row["team"]["logo"],
        "played": games["played"],
        "win": games["win"],
        "draw": games["draw"],
        "lose": games["lose"],
        "goals_for": games["goals"]["for"],
        "goals_against": games["goals"]["against"],
        "goals_diff": row["goalsDiff"],
        "points": row["points"],
        "description": _zone(row["description"]),
        "form": [FORM[letter] for letter in (row["form"] or "") if letter in FORM],  # null before a team's first match
    }


def _pick(groups: list[list[dict]], team_ids: set) -> list[dict]:
    """The table with both teams of the match, else with one; among equals the latest updated, so the Clausura
    beats the finished Apertura, and then the first."""
    return max(groups, key=lambda rows: (len(team_ids & {row["team"]["id"] for row in rows}), max(row["update"] or "" for row in rows)))


def _simulated(seed: str, teams: list[tuple[int | None, str]]) -> list[dict]:
    """A stable demo table of 10 to 16 teams, the match's included, from a simulated round robin so every number adds up."""
    rnd = random.Random(seed)  # the same table every time the tab opens
    clubs = teams + [(None, f"Equipo {chr(65 + i)}") for i in range(rnd.randint(10, 16) - len(teams))]
    strength = [rnd.random() for _ in clubs]
    games: list[list[tuple[int, int]]] = [[] for _ in clubs]  # each club's (scored, conceded), oldest first

    def goals(attack: int, defense: int) -> int:
        return sum(rnd.random() < 0.12 + 0.3 * strength[attack] - 0.12 * strength[defense] for _ in range(5))

    # Circle method: the first club stays and the rest rotate; with an odd count, whoever meets None rests that round.
    order = [*range(len(clubs)), *[None] * (len(clubs) % 2)]
    for _ in range(rnd.randint(len(order) // 2, len(order) - 1)):
        half = len(order) // 2
        for home, away in zip(order[:half], reversed(order[half:])):
            if home is not None and away is not None:
                scored, conceded = goals(home, away), goals(away, home)
                games[home].append((scored, conceded))
                games[away].append((conceded, scored))
        order = [order[0], order[-1], *order[1:-1]]

    rows = []
    for (team_id, name), played in zip(clubs, games):
        win = sum(mine > theirs for mine, theirs in played)
        draw = sum(mine == theirs for mine, theirs in played)
        scored = sum(mine for mine, _ in played)
        conceded = sum(theirs for _, theirs in played)
        rows.append({
            "team_id": team_id,
            "team_name": name,
            "team_logo": None,
            "played": len(played),
            "win": win,
            "draw": draw,
            "lose": len(played) - win - draw,
            "goals_for": scored,
            "goals_against": conceded,
            "goals_diff": scored - conceded,
            "points": 3 * win + draw,
            "form": ["V" if mine > theirs else "E" if mine == theirs else "D" for mine, theirs in played[-5:]],
        })
    rows.sort(key=lambda row: (-row["points"], -row["goals_diff"], -row["goals_for"]))
    # Generic zones, so the zone colors and their legend show in the demo too.
    last = len(rows) - 2
    return [
        {"rank": rank, **row, "description": "Zona de clasificación" if rank <= 4 else "Descenso" if rank > last else None}
        for rank, row in enumerate(rows, start=1)
    ]


async def _tables(league_id: int, season: int) -> list[list[dict]]:
    """API-Football's tables for a season (several with groups or Apertura/Clausura); [] for a cup without one."""
    key = (league_id, season)
    # The lock makes concurrent misses for a league share one upstream request.
    async with _lock:
        entry = standings_cache.get(key)
        if entry and time.monotonic() < entry["until"]:
            return entry["groups"]
        try:
            items = await api_get("/standings", {"league": league_id, "season": season})
            groups = [rows for rows in items[0]["league"]["standings"] if rows] if items else []
            ttl = STANDINGS_TTL
        except (httpx.HTTPError, UpstreamError) as error:
            # Serve the last table, if any. A quota or plan error lasts (the free plan lacks recent seasons);
            # a network error may clear up in minutes.
            groups = entry["groups"] if entry else []
            ttl = STANDINGS_TTL if isinstance(error, UpstreamError) else CACHE_TTL
        standings_cache[key] = {"until": time.monotonic() + ttl, "groups": groups}
        return groups


async def get_standings(
    league_id: int, season: int, home_id: int | None, away_id: int | None, home: str | None, away: str | None
) -> dict:
    """The table of the match's group; simulated without an API key, for a cup without a table or when API-Football fails."""
    groups = await _tables(league_id, season) if os.environ.get("API_FOOTBALL_KEY") else []
    if not groups:
        teams = [(team_id, name) for team_id, name in ((home_id, home), (away_id, away)) if name]
        return {"group": None, "is_simulated": True, "standings": _simulated(f"{league_id}-{season}-{home}-{away}", teams)}
    rows = _pick(groups, {home_id, away_id})
    return {"group": rows[0]["group"], "is_simulated": False, "standings": [_row(row) for row in rows]}
