from datetime import date, timedelta

import httpx
from fastapi import FastAPI, HTTPException, Query

from app.api_football import DAYS_AVAILABLE, UpstreamError, colombia_today, fetch_matches, group_by_league
from app.details import MatchNotFound, get_details
from app.gemini import MatchInfo, predict
from app.parlays import get_parlays
from app.radar import get_radar
from app.standings import get_standings

app = FastAPI(title="VYROX API")


def check_available(day: date | None) -> None:
    """Reject dates the free plan does not serve before any quota is spent."""
    today = colombia_today()
    if day and abs((day - today).days) > DAYS_AVAILABLE:
        first, last = today - timedelta(DAYS_AVAILABLE), today + timedelta(DAYS_AVAILABLE)
        raise HTTPException(status_code=400, detail=f"Solo hay partidos del {first} al {last} (plan gratuito de API-Football).")


@app.get("/api/matches")
async def matches(day: date | None = Query(None, alias="date")):
    check_available(day)
    try:
        data, sample = await fetch_matches(day)
    except (httpx.HTTPError, UpstreamError) as error:
        raise HTTPException(status_code=502, detail=f"No se pudo consultar API-Football: {error}")
    return {"sample": sample, "competitions": group_by_league(data)}


@app.get("/api/matches/{match_id}/details")
async def match_details(match_id: int):
    try:
        return await get_details(match_id)
    except MatchNotFound:
        raise HTTPException(status_code=404, detail="Partido no encontrado")
    except (httpx.HTTPError, UpstreamError) as error:
        raise HTTPException(status_code=502, detail=f"No se pudo consultar API-Football: {error}")


@app.get("/api/parlays")
async def parlays(day: date | None = Query(None, alias="date")):
    check_available(day)
    try:
        return await get_parlays(day)
    except (httpx.HTTPError, UpstreamError) as error:
        raise HTTPException(status_code=502, detail=f"No se pudo consultar API-Football: {error}")


@app.get("/api/radar")
async def radar(day: date | None = Query(None, alias="date")):
    check_available(day)
    try:
        return await get_radar(day)
    except (httpx.HTTPError, UpstreamError) as error:
        raise HTTPException(status_code=502, detail=f"No se pudo consultar API-Football: {error}")


@app.get("/api/leagues/{league_id}/standings")
async def standings(
    league_id: int,
    season: int | None = None,
    home_team_id: int | None = None,
    away_team_id: int | None = None,
    home_team: str | None = None,
    away_team: str | None = None,
):
    # Without a season, the current year: most leagues name their season after the year it starts.
    return await get_standings(league_id, season or colombia_today().year, home_team_id, away_team_id, home_team, away_team)


@app.post("/api/predictions")
async def predictions(match: MatchInfo):
    return await predict(match)
