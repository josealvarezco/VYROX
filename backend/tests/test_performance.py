from datetime import date

from fastapi.testclient import TestClient

from app.main import app
from app.performance import get_performance

DAY = date(2026, 11, 18)  # a Wednesday


def test_a_week_of_demo_numbers_that_add_up():
    body = get_performance(DAY)

    assert body["simulated"] is True  # never passes for VYROX IA's real record
    trend = body["daily_trend"]
    assert [row["day"] for row in trend] == ["Mié", "Jue", "Vie", "Sáb", "Dom", "Lun", "Mar"]  # the 7 days before
    won, total = sum(row["won"] for row in trend), sum(row["won"] + row["lost"] for row in trend)
    assert body["kpis"]["win_rate"] == round(100 * won / total)
    assert 1.45 <= body["kpis"]["avg_odd"] <= 2.3
    assert body["kpis"]["roi"][0] in "+-" and body["kpis"]["roi"].endswith("%")
    assert len(body["recent_hits"]) == 3 and all(1.45 <= hit["odd"] <= 2.3 for hit in body["recent_hits"])


def test_the_same_date_always_shows_the_same_week():
    assert get_performance(DAY) == get_performance(DAY)
    assert get_performance(DAY) != get_performance(date(2026, 11, 19))


def test_the_endpoint_spends_no_quota():
    body = TestClient(app).get("/api/performance").json()

    assert body["simulated"] is True and len(body["daily_trend"]) == 7
