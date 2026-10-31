// Imports with their extension, so Node runs this file's test without a bundler.
import { LIVE } from './status.ts'
import type { Match, SavedTicket, SlipLeg, TicketLeg } from './types.ts'

// Whether a pick wins with a final score; null for the free-text recommended play, which only the user can settle.
export function legResult(leg: SlipLeg, home: number, away: number): boolean | null {
  const side = leg.market_selection.slice(0, leg.market_selection.lastIndexOf(' - '))
  const goals = home + away
  if (leg.market_category === 'result') return side === 'Empate' ? home === away : side === leg.home_team ? home > away : away > home
  // "1X (Millonarios o Empate)", "12 (Millonarios o Nacional)" or "X2 (Empate o Nacional)": two of the three results.
  if (leg.market_category === 'double_chance') return side.startsWith('1X') ? home >= away : side.startsWith('12') ? home !== away : away >= home
  if (leg.market_category === 'goals') return side.startsWith('Más') ? goals > 2.5 : goals < 2.5
  if (leg.market_category === 'over_1_5') return side.startsWith('Más') ? goals > 1.5 : goals < 1.5
  if (leg.market_category === 'over_3_5') return side.startsWith('Más') ? goals > 3.5 : goals < 3.5
  if (leg.market_category === 'btts') return (side === 'Sí') === (home > 0 && away > 0)
  return null
}

// Goals only add up, so once a live score passes a line or both teams have scored, these markets cannot change:
// "Más de 2.5" is won and "Menos de 2.5" lost, both teams scoring wins "Sí" and loses "No". A double chance waits
// for the final whistle.
const DECIDED: Record<string, (home: number, away: number) => boolean> = {
  goals: (home, away) => home + away > 2.5,
  over_1_5: (home, away) => home + away > 1.5,
  over_3_5: (home, away) => home + away > 3.5,
  btts: (home, away) => home > 0 && away > 0,
}

// A pick's outcome with a live score, only once it can no longer change; null while it is still open.
export function liveResult(leg: SlipLeg, home: number, away: number): boolean | null {
  return DECIDED[leg.market_category]?.(home, away) ? legResult(leg, home, away) : null
}

// Pending tickets settled with the scores among `matches`: each pick at the final whistle, or live as soon as its
// market cannot change. One lost pick loses the ticket at once; all picks won win it, and its return goes into the
// bank. Settled tickets are never touched again, so a win is paid once. Same array back when nothing changed.
// shortcut: fullTime is API-Football's "goals", extra time included, so a cup tie that goes past 90 minutes
// settles on its 120-minute score; have the backend send the 90-minute score if those ties matter.
// shortcut: a goal that VAR takes back after a pick settled live leaves the pick settled; re-check settled picks
// at the final whistle if that matters.
export function settle(tickets: SavedTicket[], matches: Match[], now: string) {
  const scores = new Map(
    matches.flatMap(({ id, status, score: { fullTime } }) =>
      (status === 'FINISHED' || LIVE.has(status)) && fullTime.home !== null && fullTime.away !== null
        ? [[id, { final: status === 'FINISHED', home: fullTime.home, away: fullTime.away }] as const]
        : [],
    ),
  )
  let credit = 0
  let changed = false
  const next = tickets.map((ticket): SavedTicket => {
    if (ticket.status !== 'pending') return ticket
    const legs = ticket.legs.map((leg): TicketLeg => {
      const score = scores.get(leg.match_id)
      const won = leg.status === 'pending' && score ? (score.final ? legResult : liveResult)(leg, score.home, score.away) : null
      return won === null ? leg : { ...leg, status: won ? 'won' : 'lost' }
    })
    if (legs.every((leg, index) => leg === ticket.legs[index])) return ticket
    changed = true
    const status = legs.some((leg) => leg.status === 'lost') ? 'lost' : legs.every((leg) => leg.status === 'won') ? 'won' : 'pending'
    if (status === 'won' && ticket.fromBank) credit += ticket.potential_return // only a stake that left the bank comes back
    return { ...ticket, legs, status, settledAt: status === 'pending' ? null : now }
  })
  return { tickets: changed ? next : tickets, credit }
}
