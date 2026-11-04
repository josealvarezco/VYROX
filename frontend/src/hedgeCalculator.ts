// Imports with their extension, so Node runs this file's test without a bundler.
import { TWO_WAY_BOOK } from './sameGameParlay.ts'
import type { SlipLeg, TicketLeg } from './types.ts'

// The market that wins exactly when a pick loses; null for the free-text recommended play, which has none.
export function getOppositeMarket({ market_selection: selection, market_category: category, home_team: home, away_team: away }: SlipLeg) {
  const side = selection.slice(0, selection.lastIndexOf(' - '))
  const result = (name: string) => ({ market_selection: `${name} - Resultado del partido`, market_category: 'result' })
  const doubleChance = (name: string) => ({ market_selection: `${name} - Doble oportunidad`, market_category: 'double_chance' })
  if (category === 'result') {
    if (side === 'Empate') return doubleChance(`12 (${home} o ${away})`)
    return side === home ? doubleChance(`X2 (Empate o ${away})`) : doubleChance(`1X (${home} o Empate)`)
  }
  if (category === 'double_chance') return result(side.startsWith('1X') ? away : side.startsWith('12') ? 'Empate' : home)
  if (['over_1_5', 'goals', 'over_3_5'].includes(category)) {
    return { market_selection: side.startsWith('Más') ? selection.replace('Más', 'Menos') : selection.replace('Menos', 'Más'), market_category: category }
  }
  if (category === 'btts') return { market_selection: `${side === 'Sí' ? 'No' : 'Sí'} - Ambos anotan`, market_category: category }
  return null
}

// A pick and its opposite are the two sides of one market, so the opposite takes what the pick's price leaves of the
// book: for two-way odds this gives exactly the other side's prob_to_market_odd.
export const suggestedHedgeOdd = (odd: number) => Math.max(Math.round(100 / (TWO_WAY_BOOK - 1 / odd)) / 100, 1.01)

// The pick a hedge covers: the last match to kick off among the pending picks that have an opposite market, and how
// many other picks are still pending. Kickoff labels read "3/11 19:30", day first and not always padded.
export function pickToCover(legs: TicketLeg[]) {
  const pending = legs.filter((leg) => leg.status === 'pending')
  const when = (leg: TicketLeg) => {
    const [day, month, hour, minute] = leg.kickoff_label.split(/\D+/).map(Number)
    return month * 1e6 + day * 1e4 + hour * 100 + minute
  }
  const leg = pending
    .filter((item) => getOppositeMarket(item))
    .sort((a, b) => when(a) - when(b))
    .at(-1)
  return leg ? { leg, others: pending.length - 1 } : null
}

// The two ways to cover a play, in pesos: the same profit whichever side wins, or the stake back if the play loses.
export function calculateHedge(originalStake: number, potentialReturn: number, hedgeOdd: number) {
  const equalStake = Math.round(potentialReturn / hedgeOdd)
  const parlayWins = potentialReturn - originalStake - equalStake
  const hedgeWins = Math.round(equalStake * hedgeOdd) - originalStake - equalStake
  const zeroStake = hedgeOdd > 1.01 ? Math.round(originalStake / (hedgeOdd - 1)) : 0
  return {
    equal: { hedgeStake: equalStake, netProfitIfParlayWins: parlayWins, netProfitIfHedgeWins: hedgeWins, guaranteedProfit: Math.min(parlayWins, hedgeWins) },
    // Rounding the stake to the peso can leave a peso or two either way: the stake is back, so it counts as 0.
    zero: { hedgeStake: zeroStake, netProfitIfParlayWins: potentialReturn - originalStake - zeroStake, netProfitIfHedgeWins: zeroStake ? 0 : -originalStake },
  }
}
