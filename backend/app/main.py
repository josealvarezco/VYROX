import httpx
from fastapi import FastAPI, HTTPException

from app.football_data import fetch_matches, group_by_competition

app = FastAPI(title="VYROX API")


@app.get("/api/matches")
async def matches():
    try:
        data, sample = await fetch_matches()
    except httpx.HTTPError:
        raise HTTPException(status_code=502, detail="No se pudo consultar football-data.org")
    return {"sample": sample, "competitions": group_by_competition(data)}
