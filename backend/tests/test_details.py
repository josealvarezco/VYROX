import time

import pytest
from fastapi.testclient import TestClient

from app import details
from app.main import app
from fake_api_football import FIXTURE_ID, LINEUPS, fixture, install


@pytest.fixture
def api(monkeypatch):
    return install(monkeypatch)


def get(match_id=FIXTURE_ID):
    return TestClient(app).get(f"/api/matches/{match_id}/details")


def expire(seconds):
    """Bring every cached detail and head-to-head `seconds` closer to expiry."""
    for cache in (details._details, details._h2h):
        for entry in cache.values():
            entry["until"] -= seconds


def test_maps_events_statistics_lineups_and_h2h(api):
    body = get().json()

    assert (body["sample"], body["simulated"]) == (False, [])
    assert body["events"] == [
        {"minute": "9'", "team": "home", "type": "subst", "player_out": "Rikuto Hirose", "player_in": "Ryuta Koike"},
        {"minute": "69'", "team": "home", "type": "goal", "player": "Ryuta Koike", "assist": "Matheus Bueno", "detail": None},
        {"minute": "75'", "team": "home", "type": "goal", "player": "Aleksandar Čavrić", "assist": None, "detail": "penal"},
        {"minute": "85'", "team": "away", "type": "yellow", "player": "Jin Si-woo"},
        {"minute": "90+1'", "team": "away", "type": "subst", "player_out": "Wanderson Oliveira", "player_in": "Kim Ye-Sung"},
        {"minute": "90+3'", "team": "away", "type": "red", "player": "Jin Si-woo"},
    ]

    assert [row["label"] for row in body["statistics"]] == [label for _, label in details.STATS]
    assert body["statistics"][0] == {"label": "Posesión", "home": 71, "away": 29}
    assert {"label": "Tarjetas rojas", "home": 0, "away": 0} in body["statistics"]  # a null value counts as 0

    home, away = body["lineups"]["home"], body["lineups"]["away"]
    assert (home["formation"], home["coach"], away["formation"], away["coach"]) == ("4-4-2", "T. Oniki", "5-3-2", "Tae-ha Park")
    hirose, cavric = home["starters"][1], home["starters"][2]
    assert (hirose["number"], hirose["row"], hirose["col"], hirose["subbed_out"]) == (37, 2, 4, "9'")
    assert (cavric["goals"], cavric["subbed_out"]) == (1, None)
    koike = home["substitutes"][0]
    assert (koike["subbed_in"], koike["goals"]) == ("9'", 1)
    jin = away["starters"][2]
    assert (jin["yellow"], jin["red"]) == (True, True)
    assert away["substitutes"][0]["subbed_in"] == "90+1'"

    h2h = body["h2h"]
    assert [m["date"] for m in h2h["matches"]] == ["2025-04-01", "2024-03-01", "2023-02-01", "2022-01-01", "2021-01-01"]
    assert h2h["matches"][0] == {
        "id": 3,
        "date": "2025-04-01",
        "league": "AFC Champions League Elite",
        "home": "Kashima",
        "away": "Pohang Steelers",
        "home_goals": 2,
        "away_goals": 1,
    }
    assert (h2h["avg_goals"], h2h["btts"], h2h["over_2_5"]) == (2.2, 3, 2)


def test_live_match_refreshes_after_two_minutes_but_reuses_h2h(api):
    api["fixture"] = fixture(status="2H", elapsed=67)
    get()
    get()
    assert api["calls"] == ["/fixtures", "/fixtures/headtohead"]

    expire(details.LIVE_TTL + 1)
    get()
    assert api["calls"] == ["/fixtures", "/fixtures/headtohead", "/fixtures"]


def test_finished_match_is_cached_for_six_hours(api):
    get()
    expire(details.LIVE_TTL + 1)
    get()
    assert api["calls"].count("/fixtures") == 1

    expire(details.STATIC_TTL)
    get()
    assert api["calls"].count("/fixtures") == 2


def test_not_started_match_is_cached_only_until_kickoff(api):
    api["fixture"] = fixture(status="NS", elapsed=None, kickoff=int(time.time()) + 600, events=[], lineups=[], statistics=[])

    get()

    assert 590 < details._details[FIXTURE_ID]["until"] - time.monotonic() <= 600


def test_played_match_without_coverage_gets_steady_simulated_lineups_and_statistics(api):
    api["fixture"] = fixture(lineups=[], statistics=[], goals=(6, 0))
    first = get().json()
    details._details.clear()
    second = get().json()

    assert first["simulated"] == ["statistics", "lineups"]
    assert first == second  # the same demo data every time
    possession = first["statistics"][0]
    assert possession["label"] == "Posesión" and possession["home"] + possession["away"] == 100
    on_target = next(row for row in first["statistics"] if row["label"] == "Remates al arco")
    assert on_target["home"] >= 6  # never fewer shots on target than goals
    for side in ("home", "away"):
        lineup = first["lineups"][side]
        rows = [p["row"] for p in lineup["starters"]]
        assert (len(lineup["starters"]), len(lineup["substitutes"])) == (11, 7)
        assert rows.count(1) == 1 and max(rows) == len(lineup["formation"].split("-")) + 1
    assert first["events"]  # the real events are kept


def test_unplayed_match_without_data_is_not_simulated(api):
    api["fixture"] = fixture(status="NS", elapsed=None, kickoff=int(time.time()) + 3600, events=[], lineups=[], statistics=[], goals=(None, None))

    body = get().json()

    assert (body["simulated"], body["statistics"], body["lineups"], body["events"]) == ([], [], None, [])


def test_lineup_without_grid_is_laid_out_by_position(api):
    no_grid = [{**team, "startXI": [{"player": {**p["player"], "grid": None}} for p in team["startXI"]]} for team in LINEUPS]
    api["fixture"] = fixture(lineups=no_grid)

    lineups = get().json()["lineups"]

    assert [(p["pos"], p["row"], p["col"]) for p in lineups["home"]["starters"]] == [("G", 1, 1), ("D", 2, 1), ("F", 3, 1)]
    assert [(p["row"], p["col"]) for p in lineups["away"]["starters"]] == [(1, 1), (2, 1), (2, 2)]


def test_h2h_failure_keeps_the_rest_of_the_match_center(api):
    api["fail"].add("/fixtures/headtohead")

    body = get().json()

    assert body["h2h"] is None and body["events"] and body["lineups"]


def test_unknown_match_returns_404(api):
    api["fixture"] = None

    assert get().status_code == 404


def test_upstream_error_serves_stale_details_or_returns_502(api):
    assert get().status_code == 200
    expire(details.STATIC_TTL + 1)
    api["fail"].add("/fixtures")

    assert get().json()["events"]  # the stale copy

    details._details.clear()
    assert get().status_code == 502


def test_without_key_sample_matches_get_demo_data(monkeypatch):
    monkeypatch.delenv("API_FOOTBALL_KEY", raising=False)
    client = TestClient(app)

    live = client.get("/api/matches/1001/details").json()  # sample match in play
    assert (live["sample"], live["simulated"], live["events"], live["h2h"]) == (True, ["statistics", "lineups"], [], None)
    assert client.get("/api/matches/1003/details").json()["simulated"] == []  # sample match not started yet
    assert client.get("/api/matches/999/details").status_code == 404
