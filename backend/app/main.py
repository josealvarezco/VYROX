from datetime import date, timedelta

import httpx
from fastapi import FastAPI, HTTPException, Query

from app.api_football import DAYS_AVAILABLE, UpstreamError, colombia_today, fetch_matches, group_by_competition
from app.gemini import MatchInfo, predict

app = FastAPI(title="VYROX API")


@app.get("/api/matches")
async def matches(day: date | None = Query(None, alias="date")):
    today = colombia_today()
    if day and abs((day - today).days) > DAYS_AVAILABLE:  # checked here so a bad date never spends quota
        first, last = today - timedelta(DAYS_AVAILABLE), today + timedelta(DAYS_AVAILABLE)
        raise HTTPException(status_code=400, detail=f"Solo hay partidos del {first} al {last} (plan gratuito de API-Football).")
    try:
        data, sample = await fetch_matches(day)
    except (httpx.HTTPError, UpstreamError) as error:
        raise HTTPException(status_code=502, detail=f"No se pudo consultar API-Football: {error}")
    return {"sample": sample, "competitions": group_by_competition(data)}


@app.post("/api/predictions")
async def predictions(match: MatchInfo):
    return await predict(match)
