// Imports with their extension, so Node runs this file's test without a bundler.
import { totalOdd } from './sameGameParlay.ts'
import type { BookmakerOdds, MatchOdds, OddsMarket, SlipLeg } from './types.ts'

// A bookmaker's side as a bet slip pick: the labels and categories of VYROX's own picks, so the slip settles it.
export function selection(market: OddsMarket, side: string, home: string, away: string): [string, string] {
  if (market === '1x2') return [`${side === 'draw' ? 'Empate' : side === 'home' ? home : away} - Resultado del partido`, 'result']
  if (market === 'btts') return [`${side === 'yes' ? 'Sí' : 'No'} - Ambos anotan`, 'btts']
  const line = market === 'goals_2_5' ? '2.5' : '1.5'
  return [`${side === 'over' ? 'Más' : 'Menos'} de ${line} - Goles totales`, market === 'goals_2_5' ? 'goals' : 'over_1_5']
}

// Where a bet slip pick sits among a bookmaker's markets; null for the free-text recommended play.
export function slot(leg: SlipLeg): [OddsMarket, string] | null {
  const side = leg.market_selection.slice(0, leg.market_selection.lastIndexOf(' - '))
  const goals = side.startsWith('Más') ? 'over' : 'under'
  if (leg.market_category === 'result') return ['1x2', side === 'Empate' ? 'draw' : side === leg.home_team ? 'home' : 'away']
  if (leg.market_category === 'goals') return ['goals_2_5', goals]
  if (leg.market_category === 'over_1_5') return ['goals_1_5', goals]
  if (leg.market_category === 'btts') return ['btts', side === 'Sí' ? 'yes' : 'no']
  return null
}

const quote = (bookmaker: BookmakerOdds | undefined, leg: SlipLeg) => {
  const at = slot(leg)
  return (at && bookmaker?.markets[at[0]]?.[at[1]]?.odd) || 0
}

// The bookmaker that pays the most for the whole slip, among those quoting every pick: a parlay is placed at a single
// house. `missing` counts the slip's matches whose odds were not opened yet; while any is missing there is no answer.
export function bestHouse(legs: SlipLeg[], quotes: Record<number, MatchOdds>) {
  const missing = new Set(legs.filter((leg) => !quotes[leg.match_id]).map((leg) => leg.match_id)).size
  const names = [...new Set(legs.flatMap((leg) => quotes[leg.match_id]?.bookmakers.map((bookmaker) => bookmaker.name) ?? []))]
  const offers = names.flatMap((name) => {
    const odds = legs.map((leg) => quote(quotes[leg.match_id]?.bookmakers.find((bookmaker) => bookmaker.name === name), leg))
    // Priced as the slip prices it, a Crear Apuesta included.
    return odds.every(Boolean) ? [{ name, odds, total: totalOdd(legs.map((leg, index) => ({ ...leg, odd: odds[index] }))) }] : []
  })
  return { missing, best: missing || !legs.length ? null : (offers.sort((a, b) => b.total - a.total)[0] ?? null) }
}
