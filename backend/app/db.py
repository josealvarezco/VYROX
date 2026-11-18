"""The `predictions` table in Supabase (PostgreSQL): VYROX IA's real record. SQL in backend/predictions.sql.

SUPABASE_KEY must be the service_role key: the table has row level security on and no policies, so only the backend
reads and writes it. Without SUPABASE_URL and SUPABASE_KEY the history is off and the rest of the app works as before.
"""
import os
from datetime import date

from supabase import AsyncClient, acreate_client

_client: AsyncClient | None = None


async def client() -> AsyncClient | None:
    global _client
    if _client is None and os.environ.get("SUPABASE_URL") and os.environ.get("SUPABASE_KEY"):
        _client = await acreate_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_KEY"])
    return _client


async def insert_new(rows: list[dict]) -> None:
    """Saves picks not saved yet: a pick keeps the odd it had when first recorded, before its match kicked off."""
    db = await client()
    if db and rows:
        await db.table("predictions").upsert(rows, on_conflict="match_id,market", ignore_duplicates=True).execute()


async def pending_until(day: date) -> list[dict]:
    db = await client()
    return (await db.table("predictions").select("*").eq("status", "pending").lte("date", day.isoformat()).execute()).data if db else []


async def set_status(row_id: int, status: str) -> None:
    db = await client()
    if db:
        await db.table("predictions").update({"status": status}).eq("id", row_id).execute()


async def settled_since(day: date) -> list[dict]:
    db = await client()
    query = db.table("predictions").select("*").in_("status", ["won", "lost"]).gte("date", day.isoformat()) if db else None
    return (await query.order("date", desc=True).order("id", desc=True).execute()).data if query else []
