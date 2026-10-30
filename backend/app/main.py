from datetime import date, timedelta
from typing import Literal

import httpx
from fastapi import FastAPI, HTTPException, Query

from app.api_football import DAYS_AVAILABLE, UpstreamError, colombia_today, fetch_matches, group_by_league
from app.builder import get_builder
from app.details import MatchNotFound, get_details
from app.gemini import MatchInfo, predict
from app.momentum import with_momentum
from app.parlays import get_parlays
from app.radar import get_radar

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
    return {"sample": sample, "competitions": group_by_league(with_momentum(data))}


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


@app.get("/api/parlays/builder")
async def parlay_builder(
    day: date | None = Query(None, alias="date"),
    target_odd: float = Query(5.0, ge=1.5, le=50),
    legs: int | None = Query(None, ge=2, le=6),  # left out: VYROX IA picks how many
    market_filter: Literal["all", "1x2", "goals", "btts"] = "all",
    variant: int = Query(0, ge=0),
):
    check_available(day)
    try:
        return await get_builder(day, target_odd, legs, market_filter, variant)
    except (httpx.HTTPError, UpstreamError) as error:
        raise HTTPException(status_code=502, detail=f"No se pudo consultar API-Football: {error}")


@app.get("/api/radar")
async def radar(day: date | None = Query(None, alias="date")):
    check_available(day)
    try:
        return await get_radar(day)
    except (httpx.HTTPError, UpstreamError) as error:
        raise HTTPException(status_code=502, detail=f"No se pudo consultar API-Football: {error}")


@app.post("/api/predictions")
async def predictions(match: MatchInfo):
    return await predict(match)
