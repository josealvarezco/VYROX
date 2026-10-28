import httpx
from fastapi import FastAPI, HTTPException

from app.api_football import UpstreamError, fetch_matches, group_by_competition
from app.gemini import MatchInfo, predict

app = FastAPI(title="VYROX API")


@app.get("/api/matches")
async def matches():
    try:
        data, sample = await fetch_matches()
    except (httpx.HTTPError, UpstreamError) as error:
        raise HTTPException(status_code=502, detail=f"No se pudo consultar API-Football: {error}")
    return {"sample": sample, "competitions": group_by_competition(data)}


@app.post("/api/predictions")
async def predictions(match: MatchInfo):
    return await predict(match)
