import logging
import os
import time
from typing import Annotated, Literal, TypeVar

import httpx
from pydantic import BaseModel, Field, computed_field, model_validator

from app.details import get_details

API_URL = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
# Aliases for the current models (gemini-2.5-flash is still listed but answers 404). Flash-Lite is tried
# when Flash fails, because Flash often answers 503 "high demand" or takes over a minute.
MODELS = ("gemini-flash-latest", "gemini-flash-lite-latest")
CACHE_TTL = 21600  # 6 hours; a match's prediction is reused instead of spending Gemini quota

# shortcut: expired entries are never evicted; fine for a few hundred matches a day, prune if the server runs for weeks
_cache: dict[int, tuple[float, dict]] = {}
log = logging.getLogger("uvicorn.error")

Text = Annotated[str, Field(max_length=100)]
Percent = Annotated[int, Field(ge=0, le=100)]
Answer = TypeVar("Answer", bound=BaseModel)


class Score(BaseModel):
    home: int | None = None
    away: int | None = None


class MatchInfo(BaseModel):
    match_id: int
    home_team: Text
    away_team: Text
    league: Text
    date: Text
    status: Text
    score: Score


class Probabilities(BaseModel):
    home: Percent
    draw: Percent
    away: Percent

    @model_validator(mode="after")
    def sum_to_100(self):
        """Gemini is asked for a total of 100 but not guaranteed to comply, so rescale when it doesn't."""
        values = self.model_dump()
        total = sum(values.values())
        if total == 0:
            raise ValueError("all probabilities are zero")
        scaled = {name: round(value * 100 / total) for name, value in values.items()}
        largest = max(scaled, key=scaled.get)
        scaled[largest] += 100 - sum(scaled.values())  # absorb rounding drift
        for name, value in scaled.items():
            setattr(self, name, value)
        return self


class Prediction(BaseModel):
    winner_pick: Literal["Local", "Empate", "Visitante", "Doble oportunidad"]
    probabilities: Probabilities
    both_teams_to_score: Literal["Sí", "No"]
    over_under_2_5: Literal["Más de 2.5 goles", "Menos de 2.5 goles"]
    confidence: Literal["Alta", "Media", "Baja"]
    recommended_bet: str
    recommended_bet_probability: Percent
    over_2_5_probability: Percent
    btts_probability: Percent
    reasoning: str

    # Computed, so it is left out of the schema Gemini answers and only appears in the API response.
    @computed_field
    @property
    def fair_odds(self) -> dict[str, float | None]:
        """VYROX IA's own fair odds: 100 / probability, without any bookmaker margin. Not bookmaker odds."""
        p = self.probabilities
        percents = {
            "recommended": self.recommended_bet_probability,
            "home": p.home,
            "draw": p.draw,
            "away": p.away,
            "over_2_5": self.over_2_5_probability,
            "under_2_5": 100 - self.over_2_5_probability,
            "btts_yes": self.btts_probability,
            "btts_no": 100 - self.btts_probability,
        }
        return {market: round(100 / percent, 2) if percent else None for market, percent in percents.items()}


PROMPT = """Eres VYROX IA, el motor propietario de analítica avanzada y predicción deportiva de VYROX, experto en fútbol. Da tu pronóstico para este partido.

Partido: {home_team} (local) vs {away_team} (visitante)
Liga: {league}
Fecha: {date}
Estado: {status}
Marcador: {score}

{context}

- probabilities: porcentajes enteros de victoria local (home), empate (draw) y victoria visitante (away); deben sumar exactamente 100. Básalos en los datos de arriba.
- recommended_bet: la jugada principal en pocas palabras, por ejemplo "Local o Empate + Más de 1.5 goles". recommended_bet_probability: probabilidad entera (0 a 100) de que se cumpla.
- over_2_5_probability y btts_probability: probabilidades enteras (0 a 100) de que haya más de 2.5 goles y de que ambos equipos anoten, coherentes con over_under_2_5 y both_teams_to_score (50 o más cuando eliges "Más de 2.5 goles" o "Sí").
- reasoning: análisis directo de 2 a 3 líneas en español explicando el porqué del pronóstico. Cita datos concretos del historial directo o de las estadísticas cuando existan y no inventes datos que no aparezcan aquí.
- Si el partido ya empezó o terminó, ten en cuenta el estado y el marcador.
- Habla siempre como VYROX IA. En reasoning nunca te presentes como Gemini, Google ni ningún otro modelo o empresa."""
NO_CONTEXT = "No hay historial directo ni estadísticas disponibles para este partido."

# Shown to users, who only know the engine as VYROX IA; the key's variable name stays in .env.example.
NO_KEY = "VYROX IA no está disponible: falta configurar la clave del motor de IA en el backend."
FAILED = "VYROX IA no pudo generar el pronóstico en este momento. Intenta de nuevo en unos minutos."


async def _generate(client: httpx.AsyncClient, model: str, prompt: str, schema: type[Answer]) -> Answer:
    response = await client.post(
        API_URL.format(model=model),
        headers={"x-goog-api-key": os.environ["GEMINI_API_KEY"]},
        json={
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "responseMimeType": "application/json",
                "responseJsonSchema": schema.model_json_schema(),
            },
        },
    )
    response.raise_for_status()
    return schema.model_validate_json(response.json()["candidates"][0]["content"]["parts"][0]["text"])


async def ask_vyrox_ia(prompt: str, schema: type[Answer], subject: str) -> Answer | None:
    """Ask Gemini (Flash, then Flash-Lite) for JSON matching `schema`; None when both fail."""
    async with httpx.AsyncClient(timeout=30) as client:
        for model in MODELS:
            try:
                return await _generate(client, model, prompt, schema)
            except (httpx.HTTPError, KeyError, IndexError, ValueError) as error:  # ValueError: bad JSON or schema
                log.warning("Gemini %s failed for %s: %r", model, subject, error)
    return None


async def _context(match_id: int) -> str:
    """Real head-to-head and match statistics for the prompt; simulated demo data never reaches Gemini."""
    try:
        details = await get_details(match_id)
    except Exception as error:  # the prediction still works without context
        log.warning("No context for match %s: %r", match_id, error)
        return NO_CONTEXT
    lines = []
    h2h = details["h2h"]
    if h2h and h2h["matches"]:
        played = len(h2h["matches"])
        lines.append(f"Historial directo (últimos {played} partidos terminados):")
        lines += [f"- {m['date']}: {m['home']} {m['home_goals']}-{m['away_goals']} {m['away']} ({m['league']})" for m in h2h["matches"]]
        lines.append(
            f"Promedio de goles: {h2h['avg_goals']}. Ambos anotaron en {h2h['btts']} de {played}. "
            f"Más de 2.5 goles en {h2h['over_2_5']} de {played}."
        )
    if details["statistics"] and "statistics" not in details["simulated"]:
        lines.append("Estadísticas de este partido (local - visitante):")
        lines += [f"- {row['label']}: {row['home']} - {row['away']}" for row in details["statistics"]]
    return "\n".join(lines) or NO_CONTEXT


async def predict(match: MatchInfo) -> dict:
    """Return Gemini's prediction for the match, or a fallback explaining why there is none."""
    cached = _cache.get(match.match_id)
    if cached and time.monotonic() - cached[0] < CACHE_TTL:
        return cached[1]

    if not os.environ.get("GEMINI_API_KEY"):
        return {"fallback": True, "reasoning": NO_KEY}

    score = "sin goles registrados" if match.score.home is None else f"{match.score.home}-{match.score.away}"
    context = await _context(match.match_id)
    prompt = PROMPT.format(**match.model_dump(exclude={"score"}), score=score, context=context)
    prediction = await ask_vyrox_ia(prompt, Prediction, f"match {match.match_id}")
    if prediction is None:
        return {"fallback": True, "reasoning": FAILED}

    result = {"fallback": False, **prediction.model_dump()}
    _cache[match.match_id] = (time.monotonic(), result)
    return result
