"""Match Center data for one match: events, statistics, lineups and head-to-head, cached in memory."""
import asyncio
import random
import time

import httpx

from app.api_football import UpstreamError, api_get, api_keys, fetch_matches, to_match

LIVE_TTL = 120  # seconds; a live match changes minute by minute
STATIC_TTL = 21600  # 6 hours for finished or not yet started matches
H2H_SIZE = 5
FINISHED = ("FT", "AET", "PEN")
NOT_STARTED = ("TIMED", "POSTPONED", "CANCELLED")
STATS = [
    ("Ball Possession", "Posesión"),
    ("Total Shots", "Remates totales"),
    ("Shots on Goal", "Remates al arco"),
    ("Corner Kicks", "Córners"),
    ("Fouls", "Faltas"),
    ("Yellow Cards", "Tarjetas amarillas"),
    ("Red Cards", "Tarjetas rojas"),
    ("Offsides", "Fueras de juego"),
]
FORMATIONS = ("4-3-3", "4-4-2", "4-2-3-1", "3-5-2")
NO_MARKS = {"goals": 0, "yellow": False, "red": False, "subbed_in": None, "subbed_out": None}

# shortcut: entries are never evicted; fine for the few hundred matches a day, prune if the server runs for weeks
_details: dict[int, dict] = {}  # match_id -> {"until": monotonic expiry, "data": {...}}
_h2h: dict[tuple[int, int], dict] = {}  # sorted team ids -> {"until": monotonic expiry, "matches": [...]}
_lock = asyncio.Lock()


class MatchNotFound(Exception):
    pass


def _minute(clock: dict) -> str:
    return f"{clock['elapsed']}+{clock['extra']}'" if clock["extra"] else f"{clock['elapsed']}'"


def _is_goal(event: dict) -> bool:
    return event["type"] == "Goal" and event["detail"] != "Missed Penalty"


def _card(event: dict) -> str:
    return "yellow" if event["detail"] == "Yellow Card" else "red"  # "Red Card" and "Second Yellow card" send off


def _events(item: dict) -> list[dict]:
    home_id = item["teams"]["home"]["id"]
    events = []
    for event in sorted(item["events"], key=lambda e: (e["time"]["elapsed"], e["time"]["extra"] or 0)):
        base = {"minute": _minute(event["time"]), "team": "home" if event["team"]["id"] == home_id else "away"}
        player, assist = event["player"]["name"], event["assist"]["name"]
        if _is_goal(event):
            detail = {"Penalty": "penal", "Own Goal": "autogol"}.get(event["detail"])
            events.append({**base, "type": "goal", "player": player, "assist": assist, "detail": detail})
        elif event["type"] == "Card":
            events.append({**base, "type": _card(event), "player": player})
        elif event["type"] == "subst":
            # API-Football puts the player coming off in "player" and the one coming on in "assist".
            events.append({**base, "type": "subst", "player_out": player, "player_in": assist})
    return events


def _number(value) -> int:
    return int(str(value).rstrip("%")) if value is not None else 0  # possession comes as "71%"


def _stat_rows(home: dict, away: dict) -> list[dict]:
    return [{"label": label, "home": _number(home.get(key)), "away": _number(away.get(key))} for key, label in STATS]


def _statistics(item: dict) -> list[dict]:
    by_team = {s["team"]["id"]: {x["type"]: x["value"] for x in s["statistics"]} for s in item["statistics"]}
    rows = _stat_rows(by_team.get(item["teams"]["home"]["id"], {}), by_team.get(item["teams"]["away"]["id"], {}))
    return rows if any(row["home"] or row["away"] for row in rows) else []  # some leagues send teams with no values


def _cells(starters: list[dict]) -> list[tuple[int, int]]:
    """Row (1 = goalkeeper) and column of each starter: API-Football's "row:col" grid, or lines by position."""
    if all(player["grid"] for player in starters):
        return [tuple(int(n) for n in player["grid"].split(":")) for player in starters]
    positions = [player["pos"] if player["pos"] in ("G", "D", "M", "F") else "M" for player in starters]
    lines = [pos for pos in "GDMF" if pos in positions]
    taken: dict[str, int] = {}
    cells = []
    for pos in positions:
        taken[pos] = taken.get(pos, 0) + 1
        cells.append((lines.index(pos) + 1, taken[pos]))
    return cells


def _lineups(item: dict) -> dict | None:
    if len(item["lineups"]) < 2:
        return None
    # Goals, cards and substitutions per player id, so the pitch and the bench can show them.
    marks: dict[int, dict] = {}
    for event in item["events"]:
        player_id, assist_id = event["player"]["id"], event["assist"]["id"]
        if _is_goal(event) and event["detail"] != "Own Goal":
            marks.setdefault(player_id, dict(NO_MARKS))["goals"] += 1
        elif event["type"] == "Card":
            marks.setdefault(player_id, dict(NO_MARKS))[_card(event)] = True
        elif event["type"] == "subst":
            marks.setdefault(player_id, dict(NO_MARKS))["subbed_out"] = _minute(event["time"])
            marks.setdefault(assist_id, dict(NO_MARKS))["subbed_in"] = _minute(event["time"])

    def player(p: dict) -> dict:
        return {"id": p["id"], "name": p["name"], "number": p["number"], "pos": p["pos"], **marks.get(p["id"], NO_MARKS)}

    def lineup(team: dict) -> dict:
        starters = [entry["player"] for entry in team["startXI"]]
        return {
            "formation": team["formation"],
            "coach": (team.get("coach") or {}).get("name"),
            "starters": [{**player(p), "row": row, "col": col} for p, (row, col) in zip(starters, _cells(starters))],
            "substitutes": [player(entry["player"]) for entry in team["substitutes"]],
        }

    by_team = {team["team"]["id"]: team for team in item["lineups"]}
    sides = {side: by_team.get(item["teams"][side]["id"]) for side in ("home", "away")}
    return {side: lineup(team) for side, team in sides.items()} if all(sides.values()) else None


def _simulated_statistics(rnd: random.Random, goals: dict) -> list[dict]:
    def side(scored: int | None) -> dict:
        shots = rnd.randint(4, 18)
        on_target = max(scored or 0, rnd.randint(1, max(1, shots // 2)))  # never fewer than the goals scored
        return {
            "Total Shots": max(shots, on_target),
            "Shots on Goal": on_target,
            "Corner Kicks": rnd.randint(1, 9),
            "Fouls": rnd.randint(6, 16),
            "Yellow Cards": rnd.randint(0, 4),
            "Red Cards": int(rnd.random() < 0.07),
            "Offsides": rnd.randint(0, 4),
        }

    possession = rnd.randint(35, 65)
    home, away = side(goals["home"]), side(goals["away"])
    return _stat_rows({**home, "Ball Possession": possession}, {**away, "Ball Possession": 100 - possession})


def _simulated_lineup(rnd: random.Random) -> dict:
    formation = rnd.choice(FORMATIONS)
    lines = [1, *(int(n) for n in formation.split("-"))]
    numbers = iter(rnd.sample(range(2, 31), 17))  # 10 outfield starters + 7 substitutes; the goalkeeper wears 1
    starters = []
    for row, size in enumerate(lines, start=1):
        pos = "G" if row == 1 else "D" if row == 2 else "F" if row == len(lines) else "M"
        for col in range(1, size + 1):
            number = 1 if pos == "G" else next(numbers)
            starters.append({**NO_MARKS, "id": None, "name": f"Jugador {number}", "number": number, "pos": pos, "row": row, "col": col})
    substitutes = [{**NO_MARKS, "id": None, "name": f"Jugador {n}", "number": n, "pos": rnd.choice("GDMF")} for n in numbers]
    return {"formation": formation, "coach": None, "starters": starters, "substitutes": substitutes}


async def _head_to_head(home_id: int, away_id: int) -> list[dict]:
    """Finished meetings between two teams, newest first, cached per pair of teams."""
    pair = (min(home_id, away_id), max(home_id, away_id))
    entry = _h2h.get(pair)
    if entry and time.monotonic() < entry["until"]:
        return entry["matches"]
    # The free plan rejects the "last" parameter, so the whole history comes back and is trimmed here.
    items = await api_get("/fixtures/headtohead", {"h2h": f"{home_id}-{away_id}", "timezone": "America/Bogota"})
    finished = sorted(
        (item for item in items if item["fixture"]["status"]["short"] in FINISHED),
        key=lambda item: item["fixture"]["timestamp"],
        reverse=True,
    )
    matches = [
        {
            "id": item["fixture"]["id"],
            "date": item["fixture"]["date"][:10],
            "league": item["league"]["name"],
            "home": item["teams"]["home"]["name"],
            "away": item["teams"]["away"]["name"],
            "home_goals": item["goals"]["home"],
            "away_goals": item["goals"]["away"],
        }
        for item in finished
    ]
    _h2h[pair] = {"until": time.monotonic() + STATIC_TTL, "matches": matches}
    return matches


def _h2h_summary(matches: list[dict], match_id: int) -> dict:
    last = [m for m in matches if m["id"] != match_id][:H2H_SIZE]  # the match itself is not history
    goals = [m["home_goals"] + m["away_goals"] for m in last]
    return {
        "matches": last,
        "avg_goals": round(sum(goals) / len(goals), 1) if goals else None,
        "btts": sum(1 for m in last if m["home_goals"] and m["away_goals"]),
        "over_2_5": sum(1 for total in goals if total > 2.5),
    }


def _ttl(match: dict, item: dict) -> float:
    if match["status"] in ("IN_PLAY", "PAUSED"):
        return LIVE_TTL
    if match["status"] == "TIMED":
        # A pre-match snapshot must not outlive kickoff, or the Match Center would miss the match itself.
        return max(LIVE_TTL, min(STATIC_TTL, item["fixture"]["timestamp"] - time.time()))
    return STATIC_TTL


def _build(match_id: int, match: dict, item: dict | None, h2h: dict | None, sample: bool) -> dict:
    statistics = _statistics(item) if item else []
    lineups = _lineups(item) if item else None
    simulated = []
    # Demo data only for matches already played: an unplayed match has no statistics or lineups by nature.
    if match["status"] not in NOT_STARTED:
        rnd = random.Random(match_id)  # the same demo data every time the match is opened
        if not statistics:
            statistics = _simulated_statistics(rnd, match["score"]["fullTime"])
            simulated.append("statistics")
        if not lineups:
            lineups = {"home": _simulated_lineup(rnd), "away": _simulated_lineup(rnd)}
            simulated.append("lineups")
    return {
        "sample": sample,
        "simulated": simulated,
        "events": _events(item) if item else [],
        "statistics": statistics,
        "lineups": lineups,
        "h2h": h2h,
    }


async def get_details(match_id: int) -> dict:
    """Return the Match Center data; without an API key, demo data for a sample match."""
    if not api_keys():
        sample, _ = await fetch_matches()
        match = next((m for m in sample if m["id"] == match_id), None)
        if match is None:
            raise MatchNotFound(match_id)
        return _build(match_id, match, None, None, sample=True)

    # The lock makes the modal and a prediction asking for the same match share one upstream request.
    async with _lock:
        entry = _details.get(match_id)
        if entry and time.monotonic() < entry["until"]:
            return entry["data"]
        try:
            items = await api_get("/fixtures", {"id": match_id, "timezone": "America/Bogota"})
        except (httpx.HTTPError, UpstreamError):
            if entry:
                entry["until"] = time.monotonic() + LIVE_TTL  # serve the stale data and retry a bit later
                return entry["data"]
            raise
        if not items:
            raise MatchNotFound(match_id)
        item = items[0]
        match = to_match(item)
        try:
            history = await _head_to_head(item["teams"]["home"]["id"], item["teams"]["away"]["id"])
            h2h = _h2h_summary(history, match_id)
        except (httpx.HTTPError, UpstreamError):
            h2h = None  # head-to-head is secondary; the rest of the Match Center still works
        data = _build(match_id, match, item, h2h, sample=False)
        _details[match_id] = {"until": time.monotonic() + _ttl(match, item), "data": data}
        return data
