// Type-only imports with their extension, so Node runs this file's test without a bundler.
import type { Match, SavedTicket, SlipLeg, TicketLeg } from './types.ts'

// Whether a pick wins with a final score; null for the free-text recommended play, which only the user can settle.
export function legResult(leg: SlipLeg, home: number, away: number): boolean | null {
  const side = leg.market_selection.slice(0, leg.market_selection.lastIndexOf(' - '))
  const goals = home + away
  if (leg.market_category === 'result') return side === 'Empate' ? home === away : side === leg.home_team ? home > away : away > home
  if (leg.market_category === 'goals') return side.startsWith('Más') ? goals > 2.5 : goals < 2.5
  if (leg.market_category === 'over_1_5') return side.startsWith('Más') ? goals > 1.5 : goals < 1.5
  if (leg.market_category === 'btts') return (side === 'Sí') === (home > 0 && away > 0)
  return null
}

// Pending tickets settled with the final scores among `matches`, and the returns their wins pay into the bank.
// Settled tickets are never touched again, so a win is paid once. Same array back when nothing changed.
// shortcut: fullTime is API-Football's "goals", extra time included, so a cup tie that goes past 90 minutes
// settles on its 120-minute score; have the backend send the 90-minute score if those ties matter.
export function settle(tickets: SavedTicket[], matches: Match[], now: string) {
  const finals = new Map(
    matches.flatMap(({ id, status, score: { fullTime } }) =>
      status === 'FINISHED' && fullTime.home !== null && fullTime.away !== null ? [[id, [fullTime.home, fullTime.away]] as const] : [],
    ),
  )
  let credit = 0
  let changed = false
  const next = tickets.map((ticket): SavedTicket => {
    if (ticket.status !== 'pending') return ticket
    const legs = ticket.legs.map((leg): TicketLeg => {
      const score = finals.get(leg.match_id)
      const won = leg.status === 'pending' && score ? legResult(leg, ...score) : null
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
