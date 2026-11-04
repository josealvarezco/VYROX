// Imports with their extension, so Node runs this file's test without a bundler.
import { LIVE } from './status.ts'
import { legResult, liveResult } from './ticketSettlement.ts'
import type { Match, SlipLeg, TicketLeg } from './types.ts'

export const SLOTS = 4

// Adds a match or takes it out. A full grid first lets go of the matches of other dates, which it is not showing;
// with four on screen it stays as it is.
export function toggleSlot(ids: number[], id: number, listed: (id: number) => boolean) {
  if (ids.includes(id)) return ids.filter((other) => other !== id)
  const room = ids.length < SLOTS ? ids : ids.filter(listed)
  return room.length < SLOTS ? [...room, id] : ids
}

// Live first, then the next to start, and what already ended last.
const stage = (match: Match) => (LIVE.has(match.status) ? 0 : match.status === 'TIMED' ? 1 : 2)

// Up to four matches of the date among the user's picks.
export function parlayMatches(legs: Pick<SlipLeg, 'match_id'>[], matches: Match[]) {
  const mine = new Set(legs.map((leg) => leg.match_id))
  return matches
    .filter((match) => mine.has(match.id))
    .sort((a, b) => stage(a) - stage(b) || Date.parse(a.utcDate) - Date.parse(b.utcDate))
    .slice(0, SLOTS)
    .map((match) => match.id)
}

// The four most notable live matches: hot ones, then those Momentum IA measured; the list's order (best leagues
// first) settles the rest, because sort is stable.
export function topLive(matches: Match[]) {
  const rank = (match: Match) => (match.momentum_status === 'high_voltage' ? 0 : match.home_pressure !== undefined ? 1 : 2)
  return matches
    .filter((match) => LIVE.has(match.status))
    .sort((a, b) => rank(a) - rank(b))
    .slice(0, SLOTS)
    .map((match) => match.id)
}

export type Track = 'ok' | 'waiting' | 'lost'

// How a pick stands with the match's score right now: 'ok' while that score would win it, 'lost' once it can no
// longer win, 'waiting' otherwise (not started, not winning yet, or the free-text play nobody can read from a score).
export function trackLeg(leg: SlipLeg & Partial<Pick<TicketLeg, 'status'>>, match: Match): Track {
  if (leg.status === 'won') return 'ok'
  if (leg.status === 'lost') return 'lost'
  const { home, away } = match.score.fullTime
  if (home === null || away === null || (match.status !== 'FINISHED' && !LIVE.has(match.status))) return 'waiting'
  const now = legResult(leg, home, away)
  if (now) return 'ok'
  return now === false && (match.status === 'FINISHED' || liveResult(leg, home, away) === false) ? 'lost' : 'waiting'
}
