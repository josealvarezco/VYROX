"""Fake API-Football for the Match Center: a trimmed real fixture (Kashima 3-0 Pohang, AFC Champions League Elite)."""
from datetime import datetime

import httpx

from app import details
from app.api_football import API_BASE

FIXTURE_ID, KASHIMA, POHANG = 1629958, 290, 2764
NAMES = {KASHIMA: "Kashima", POHANG: "Pohang Steelers"}
LEAGUE = {"id": 17, "name": "AFC Champions League Elite", "country": "World", "logo": "https://media.api-sports.io/football/leagues/17.png", "round": "League Stage - 4"}


def team(team_id):
    return {"id": team_id, "name": NAMES[team_id], "logo": f"https://media.api-sports.io/football/teams/{team_id}.png", "winner": None}


def player(player_id, name, number, pos, grid=None):
    return {"player": {"id": player_id, "name": name, "number": number, "pos": pos, "grid": grid}}


def event(minute, team_id, kind, detail, who=(None, None), assist=(None, None), extra=None):
    return {
        "time": {"elapsed": minute, "extra": extra},
        "team": {"id": team_id, "name": NAMES[team_id]},
        "player": {"id": who[0], "name": who[1]},
        "assist": {"id": assist[0], "name": assist[1]},
        "type": kind,
        "detail": detail,
        "comments": None,
    }


def stats(team_id, possession, shots, on_target, corners, fouls, yellow, red, offsides):
    values = {
        "expected_goals": "2.59",
        "Shots on Goal": on_target,
        "Total Shots": shots,
        "Fouls": fouls,
        "Corner Kicks": corners,
        "Offsides": offsides,
        "Ball Possession": possession,
        "Yellow Cards": yellow,
        "Red Cards": red,
    }
    return {"team": {"id": team_id}, "statistics": [{"type": key, "value": value} for key, value in values.items()]}


# Out of order on purpose; the Var check and the missed penalty are not shown in the Match Center.
EVENTS = [
    event(9, KASHIMA, "subst", "Substitution 1", (33008, "Rikuto Hirose"), (33596, "Ryuta Koike")),
    event(69, KASHIMA, "Goal", "Normal Goal", (33596, "Ryuta Koike"), (9354, "Matheus Bueno")),
    event(90, POHANG, "subst", "Substitution 4", (34569, "Wanderson Oliveira"), (34304, "Kim Ye-Sung"), extra=1),
    event(75, KASHIMA, "Goal", "Penalty", (61157, "Aleksandar Čavrić")),
    event(85, POHANG, "Card", "Yellow Card", (550411, "Jin Si-woo")),
    event(88, KASHIMA, "Var", "Goal confirmed", (33089, "Yuma Suzuki")),
    event(89, POHANG, "Goal", "Missed Penalty", (277197, "Jorge Luiz")),
    event(90, POHANG, "Card", "Second Yellow card", (550411, "Jin Si-woo"), extra=3),
]
# The away team comes first on purpose: lineups are matched by team id, not by order.
LINEUPS = [
    {
        "team": {"id": POHANG, "name": NAMES[POHANG], "colors": None},
        "coach": {"id": 0, "name": "Tae-ha Park", "photo": None},
        "formation": "5-3-2",
        "startXI": [player(99205, "Hwang In-Jae", 21, "G", "1:1"), player(34569, "Wanderson", 77, "D", "2:1"), player(550411, "Jin Si-woo", 5, "D", "2:4")],
        "substitutes": [player(34304, "Ye-Sung Kim", 3, "D")],
    },
    {
        "team": {"id": KASHIMA, "name": NAMES[KASHIMA], "colors": None},
        "coach": {"id": 553, "name": "T. Oniki", "photo": None},
        "formation": "4-4-2",
        "startXI": [player(304782, "T. Hayakawa", 1, "G", "1:1"), player(33008, "R. Hirose", 37, "D", "2:4"), player(61157, "A. Čavrić", 77, "F", "4:1")],
        "substitutes": [player(33596, "R. Koike", 25, "D"), player(33399, "Y. Higuchi", 14, "M")],
    },
]
STATISTICS = [stats(KASHIMA, "71%", 15, 6, 4, 5, 0, 0, 1), stats(POHANG, "29%", 4, 0, 3, 6, 2, None, 1)]


def fixture(status="FT", elapsed=90, kickoff=1793181600, events=EVENTS, lineups=LINEUPS, statistics=STATISTICS, goals=(3, 0)):
    return {
        "fixture": {
            "id": FIXTURE_ID,
            "referee": "Sadullo Gulmurodi",
            "date": "2026-10-28T05:00:00-05:00",
            "timestamp": kickoff,
            "venue": {"id": 964, "name": "Mercari Stadium", "city": "Kashima"},
            "status": {"long": "", "short": status, "elapsed": elapsed, "extra": None},
        },
        "league": LEAGUE,
        "teams": {"home": team(KASHIMA), "away": team(POHANG)},
        "goals": {"home": goals[0], "away": goals[1]},
        "score": {"halftime": {"home": 0, "away": 0}},
        "events": events,
        "lineups": lineups,
        "statistics": statistics,
    }


def meeting(fixture_id, day, home, away, goals, status="FT"):
    moment = f"{day}T05:00:00-05:00"
    return {
        "fixture": {"id": fixture_id, "date": moment, "timestamp": int(datetime.fromisoformat(moment).timestamp()), "status": {"short": status}},
        "league": LEAGUE,
        "teams": {"home": team(home), "away": team(away)},
        "goals": {"home": goals[0], "away": goals[1]},
    }


H2H = [
    meeting(1, "2027-04-01", KASHIMA, POHANG, (None, None), status="NS"),  # scheduled, not history
    meeting(FIXTURE_ID, "2026-10-28", KASHIMA, POHANG, (3, 0)),  # the match itself
    meeting(2, "2019-05-08", POHANG, KASHIMA, (5, 0)),  # sixth newest: left out
    meeting(3, "2025-04-01", KASHIMA, POHANG, (2, 1)),
    meeting(4, "2024-03-01", POHANG, KASHIMA, (0, 0)),
    meeting(5, "2023-02-01", KASHIMA, POHANG, (3, 1), status="AET"),
    meeting(6, "2022-01-01", POHANG, KASHIMA, (1, 1)),
    meeting(7, "2021-01-01", KASHIMA, POHANG, (0, 2), status="PEN"),
]


def install(monkeypatch) -> dict:
    """Serve state["fixture"] for /fixtures?id and state["h2h"] for the head-to-head; paths in state["fail"] answer 500."""
    state = {"calls": [], "fixture": fixture(), "h2h": H2H, "fail": set()}

    async def fake_get(self, url, headers, params):
        path = url.removeprefix(API_BASE)
        state["calls"].append(path)
        request = httpx.Request("GET", url)
        if path in state["fail"]:
            return httpx.Response(500, request=request)
        response = {"/fixtures": [state["fixture"]] if state["fixture"] else [], "/fixtures/headtohead": state["h2h"]}[path]
        return httpx.Response(200, json={"errors": [], "response": response}, request=request)

    monkeypatch.setenv("API_FOOTBALL_KEY", "test-key")
    monkeypatch.setattr(httpx.AsyncClient, "get", fake_get)
    details._details.clear()
    details._h2h.clear()
    return state
