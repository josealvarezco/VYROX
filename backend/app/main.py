import logging
import os
import secrets
from datetime import date, timedelta
from typing import Literal

import httpx
from fastapi import BackgroundTasks, FastAPI, Header, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from app.api_football import DAYS_AVAILABLE, UpstreamError, colombia_today, fetch_matches, group_by_league
from app.bookmakers import get_odds
from app.builder import get_builder
from app.details import MatchNotFound, get_details
from app.gemini import MatchInfo, predict
from app.momentum import with_momentum
from app.parlays import get_parlays
from app.history import get_performance, record_today, resolve_pending
from app.radar import get_forecasts, get_radar, with_live_picks

app = FastAPI(title="VYROX API")
# The frontend is served from another domain (Vercel) than this API (Render). The API sets no cookies and has no
# login, so any origin may call it.
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])


def check_available(day: date | None) -> None:
    """Reject dates the free plan does not serve before any quota is spent."""
    today = colombia_today()
    if day and abs((day - today).days) > DAYS_AVAILABLE:
        first, last = today - timedelta(DAYS_AVAILABLE), today + timedelta(DAYS_AVAILABLE)
        raise HTTPException(status_code=400, detail=f"Solo hay partidos del {first} al {last} (plan gratuito de API-Football).")


@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "vyrox-api"}  # no upstream call: for the host's health check


@app.get("/api/performance")
async def performance():
    try:
        return await get_performance()
    except Exception as error:  # Supabase down or misconfigured: the card hides itself
        logging.getLogger(__name__).warning("Could not read the predictions: %r", error)
        raise HTTPException(status_code=502, detail="No se pudo consultar el historial de pronósticos")


@app.post("/api/admin/resolve-yesterday")
async def resolve_yesterday(authorization: str = Header("")):
    """Settles the pending picks with the final scores; for a daily cron, with `Authorization: Bearer <ADMIN_TOKEN>`."""
    token = os.environ.get("ADMIN_TOKEN", "")
    if not token:
        raise HTTPException(status_code=503, detail="ADMIN_TOKEN no está configurado")
    if not secrets.compare_digest(authorization.encode(), f"Bearer {token}".encode()):
        raise HTTPException(status_code=401, detail="Token inválido")
    try:
        return await resolve_pending()
    except (httpx.HTTPError, UpstreamError) as error:
        raise HTTPException(status_code=502, detail=f"No se pudo consultar API-Football: {error}")


@app.get("/api/matches")
async def matches(day: date | None = Query(None, alias="date")):
    check_available(day)
    try:
        data, sample = await fetch_matches(day)
    except (httpx.HTTPError, UpstreamError) as error:
        raise HTTPException(status_code=502, detail=f"No se pudo consultar API-Football: {error}")
    return {"sample": sample, "competitions": group_by_league(with_live_picks(with_momentum(data), day or colombia_today()))}


@app.get("/api/matches/{match_id}/details")
async def match_details(match_id: int):
    try:
        return await get_details(match_id)
    except MatchNotFound:
        raise HTTPException(status_code=404, detail="Partido no encontrado")
    except (httpx.HTTPError, UpstreamError) as error:
        raise HTTPException(status_code=502, detail=f"No se pudo consultar API-Football: {error}")


@app.get("/api/matches/{match_id}/odds")
async def match_odds(match_id: int):
    try:
        return await get_odds(match_id)
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


@app.get("/api/forecasts")
async def forecasts(background: BackgroundTasks, day: date | None = Query(None, alias="date")):
    check_available(day)
    if (day or colombia_today()) == colombia_today():
        background.add_task(record_today)  # every visit asks for today's forecast: today's radar picks get saved
    try:
        return await get_forecasts(day)
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
