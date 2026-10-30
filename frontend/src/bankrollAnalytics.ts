// Imports with their extension, so Node runs this file's test without a bundler.
import type { SavedTicket } from './types.ts'

// The bet slip's categories by market family; the recommended play is free text and settles by hand.
const FAMILY: Record<string, string> = {
  result: 'Resultado (1X2)',
  goals: 'Más/Menos Goles',
  over_1_5: 'Más/Menos Goles',
  btts: 'Ambos Anotan',
}
const FAMILIES = ['Resultado (1X2)', 'Más/Menos Goles', 'Ambos Anotan']

export type BankrollPoint = {
  label: string // the day the play settled, "29/10", or "Inicio"
  odd: number | null // the play's total odd; null at the start
  delta: number // the play's net result in COP
  profit: number // cumulative net profit
  bank: number // the bank after the play
}

type Settled = SavedTicket & { status: 'won' | 'lost' }

const net = (ticket: Settled) => (ticket.status === 'won' ? ticket.potential_return - ticket.stake : -ticket.stake)
const day = (iso: string) => new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', timeZone: 'America/Bogota' })

// What "Mis Jugadas" charts, from the plays the browser already keeps: the cumulative profit and the bank after each
// settled play, the hit rate per market family, the best family, the current streak and the highest odd won.
export function bankrollAnalytics(tickets: SavedTicket[], bank: number) {
  const settled = tickets
    .filter((ticket): ticket is Settled => ticket.status !== 'pending')
    .sort(
      (a, b) => Date.parse(a.settledAt ?? a.createdAt) - Date.parse(b.settledAt ?? b.createdAt) || Date.parse(a.createdAt) - Date.parse(b.createdAt),
    )

  // Only plays staked from the bank moved it, so its curve starts at today's bank without their results.
  let profit = 0
  let balance = settled.reduce((sum, ticket) => sum - (ticket.fromBank ? net(ticket) : 0), bank)
  const points: BankrollPoint[] = [{ label: 'Inicio', odd: null, delta: 0, profit, bank: balance }]
  for (const ticket of settled) {
    const delta = net(ticket)
    profit += delta
    if (ticket.fromBank) balance += delta
    points.push({ label: day(ticket.settledAt ?? ticket.createdAt), odd: ticket.total_odd, delta, profit, bank: balance })
  }

  // Every decided pick counts, also those of plays still open.
  const legs = tickets.flatMap((ticket) => ticket.legs).filter((leg) => leg.status !== 'pending')
  const marketBreakdown = FAMILIES.map((name) => {
    const family = legs.filter((leg) => FAMILY[leg.market_category] === name)
    const won = family.filter((leg) => leg.status === 'won').length
    return { name, total: family.length, won, lost: family.length - won, winRate: family.length ? Math.round((won / family.length) * 100) : 0 }
  })
  const bestMarket = marketBreakdown.filter((market) => market.total).sort((a, b) => b.winRate - a.winRate || b.total - a.total)[0] ?? null

  const latest = settled.at(-1)
  const currentStreak = latest
    ? { type: latest.status, count: settled.length - 1 - settled.findLastIndex((ticket) => ticket.status !== latest.status) }
    : null
  const highestWonOdd = settled.reduce<number | null>((best, ticket) => (ticket.status === 'won' && ticket.total_odd > (best ?? 0) ? ticket.total_odd : best), null)

  return { points, marketBreakdown, bestMarket, currentStreak, highestWonOdd }
}
