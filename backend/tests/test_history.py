from datetime import date, timedelta

import pytest
from fastapi.testclient import TestClient

from app import db, history
from app.api_football import colombia_today
from app.main import app

TODAY = date(2026, 11, 18)  # a Wednesday


def item(match_id, selection, odd=1.8, home="Arsenal", away="Chelsea"):
    return {"match_id": match_id, "league_name": "Premier League", "home_team": home, "away_team": away, "market_selection": selection, "market_odd": odd}


def row(row_id, status, day, odd=2.0, market="over_2_5", match_id=None):
    return {"id": row_id, "match_id": match_id or row_id, "date": day.isoformat(), "league": "Premier League", "teams": f"A{row_id} vs B{row_id}", "market": market, "prediction": "Más de 2.5 - Goles totales", "odd": odd, "status": status}


def match(match_id, home, away, status="FINISHED"):
    return {"id": match_id, "status": status, "score": {"fullTime": {"home": home, "away": away}}}


def test_the_radar_becomes_one_pending_row_per_match_and_market():
    radar = {
        "categories": [
            {"key": "bankers_1x2", "items": [item(1, "Arsenal - Resultado del partido"), item(2, "Chelsea - Resultado del partido", home="Spurs")]},
            {"key": "over_2_5", "items": [item(1, "Más de 2.5 - Goles totales", 1.62)]},
            {"key": "btts_yes", "items": [item(1, "Sí - Ambos anotan")]},
            {"key": "under_2_5", "items": []},
        ]
    }

    rows = history.radar_rows(radar, TODAY)

    assert [(r["match_id"], r["market"]) for r in rows] == [(1, "home_win"), (2, "away_win"), (1, "over_2_5"), (1, "btts_yes")]
    assert rows[2] | {} == {
        "match_id": 1, "date": "2026-11-18", "league": "Premier League", "teams": "Arsenal vs Chelsea", "market": "over_2_5",
        "prediction": "Más de 2.5 - Goles totales", "odd": 1.62, "status": "pending",
    }


@pytest.mark.parametrize("market, home, away, status", [
    ("home_win", 2, 1, "won"), ("home_win", 1, 1, "lost"), ("away_win", 0, 1, "won"),
    ("over_2_5", 2, 1, "won"), ("over_2_5", 1, 1, "lost"), ("under_2_5", 1, 1, "won"), ("under_2_5", 3, 0, "lost"),
    ("btts_yes", 1, 1, "won"), ("btts_yes", 2, 0, "lost"),
])
def test_a_pick_is_settled_by_the_final_score(market, home, away, status):
    assert history.settle([row(1, "pending", TODAY, market=market)], [match(1, home, away)]) == {1: status}


def test_only_finished_matches_settle():
    rows = [row(1, "pending", TODAY), row(2, "pending", TODAY), row(3, "pending", TODAY)]
    matches = [match(1, 2, 1), match(2, 0, 0, "IN_PLAY"), match(3, None, None, "POSTPONED")]

    assert history.settle(rows, matches) == {1: "won"}


def test_the_week_adds_up_from_the_settled_rows():
    rows = [
        row(1, "won", TODAY, 1.5), row(2, "lost", TODAY, 2.0), row(3, "won", TODAY - timedelta(days=1), 2.5),
        row(4, "won", TODAY - timedelta(days=6), 1.8), row(5, "won", TODAY - timedelta(days=7), 3.0),  # 8 days back: out
    ]

    body = history.summarize(rows, TODAY)

    assert body["kpis"] == {"win_rate": 75, "avg_odd": 1.95, "roi": "+45.0%", "picks": 4}  # (1.5 + 2.5 + 1.8 - 4) / 4
    assert [d["day"] for d in body["daily_trend"]] == ["Jue", "Vie", "Sáb", "Dom", "Lun", "Mar", "Mié"]
    assert body["daily_trend"][-1] == {"day": "Mié", "won": 1, "lost": 1} and body["daily_trend"][0] == {"day": "Jue", "won": 1, "lost": 0}
    assert [hit["date"] for hit in body["recent_hits"]] == ["18/11", "17/11", "12/11"]


def test_no_settled_picks_means_no_kpis_yet():
    body = history.summarize([], TODAY)

    assert body["kpis"] is None and len(body["daily_trend"]) == 7 and body["recent_hits"] == []


@pytest.fixture
def table(monkeypatch):
    """A fake predictions table and a fake API-Football list."""
    state = {"rows": [], "updates": {}, "inserted": [], "fetched": []}

    async def fake_client():
        return object()

    async def pending_until(day):
        return [r for r in state["rows"] if r["status"] == "pending" and r["date"] <= day.isoformat()]

    async def set_status(row_id, status):
        state["updates"][row_id] = status

    async def settled_since(day):
        return [r for r in state["rows"] if r["status"] != "pending" and r["date"] >= day.isoformat()]

    async def fake_fetch(day):
        state["fetched"].append(day)
        return [match(1, 3, 0), match(2, 1, 1)], False

    monkeypatch.setattr(db, "client", fake_client)
    monkeypatch.setattr(db, "pending_until", pending_until)
    monkeypatch.setattr(db, "set_status", set_status)
    monkeypatch.setattr(db, "settled_since", settled_since)
    monkeypatch.setattr(history, "fetch_matches", fake_fetch)
    monkeypatch.setenv("ADMIN_TOKEN", "secret-token")
    return state


def resolve(token="secret-token"):
    return TestClient(app).post("/api/admin/resolve-yesterday", headers={"Authorization": f"Bearer {token}"} if token else {})


def test_the_verifier_settles_what_finished_and_leaves_the_rest(table):
    today = colombia_today()
    table["rows"] = [
        row(1, "pending", today - timedelta(days=1), match_id=1),  # 3-0: more than 2.5 won
        row(2, "pending", today - timedelta(days=1), match_id=2),  # 1-1: lost
        row(3, "pending", today - timedelta(days=1), match_id=99),  # not in the list yet
        row(4, "pending", today - timedelta(days=5), match_id=1),  # out of the free plan's dates
        row(5, "pending", today + timedelta(days=1), match_id=1),  # tomorrow: not yet
    ]

    assert resolve().json() == {"resolved": 2, "pending": 1, "unreachable": 1}
    assert table["updates"] == {1: "won", 2: "lost"}
    assert table["fetched"] == [today - timedelta(days=1)]  # one cached request per date, never for an unreachable one


@pytest.mark.parametrize("token, code", [(None, 401), ("wrong", 401)])
def test_the_verifier_needs_the_admin_token(table, token, code):
    assert resolve(token).status_code == code
    assert table["updates"] == {}


def test_the_verifier_is_off_without_a_token(table, monkeypatch):
    monkeypatch.delenv("ADMIN_TOKEN")

    assert resolve().status_code == 503


def test_performance_reads_the_real_record(table):
    table["rows"] = [row(1, "won", colombia_today(), 1.9), row(2, "pending", colombia_today())]

    body = TestClient(app).get("/api/performance").json()

    assert body["kpis"] == {"win_rate": 100, "avg_odd": 1.9, "roi": "+90.0%", "picks": 1}  # a pending pick never counts


def test_without_supabase_the_record_is_empty(monkeypatch):
    monkeypatch.delenv("SUPABASE_URL", raising=False)
    monkeypatch.setattr(db, "_client", None)

    assert TestClient(app).get("/api/performance").json()["kpis"] is None
