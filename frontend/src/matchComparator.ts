// Imports with their extension, so Node runs this file's test without a bundler.
import type { ForecastMatch, ForecastPick } from './types.ts'

export type ComparedSide = {
  bestPick: ForecastPick
  fav1x2Prob: number
  fav1x2Odd: number | null
  over25Prob: number
  over25Odd: number | null
  bttsProb: number
  bttsOdd: number | null
  safetyScore: number
}

const likelier = (a: ForecastPick, b: ForecastPick) => (b.probability > a.probability ? b : a)
const teams = (match: ForecastMatch) => `${match.home_team} vs ${match.away_team}`

// A pick as a phrase: "la victoria de Arsenal", "más de 2.5 goles", "que anoten ambos".
function phrase({ market_selection, market_category }: ForecastPick) {
  const side = market_selection.slice(0, market_selection.lastIndexOf(' - '))
  if (market_category === 'result') return `la victoria de ${side}`
  if (market_category === 'btts') return side === 'Sí' ? 'que anoten ambos' : 'que no anoten ambos'
  return `${side.toLowerCase()} goles`
}

// Índice de Seguridad VYROX: how clear the trend is (the pick's probability) and what its odd pays against that
// probability, 50 being a fair odd.
function safety({ probability, odd }: ForecastPick) {
  const value = Math.min(100, Math.max(0, 50 + 250 * ((probability / 100) * (odd ?? 0) - 1)))
  return Math.round(0.75 * probability + 0.25 * value)
}

function side(match: ForecastMatch): ComparedSide {
  const { favourite, over_2_5, under_2_5, btts_yes, btts_no } = match.picks
  // The strongest pick among the main markets; a tie goes to the 1X2 favourite, then to the goals.
  const bestPick = [favourite, likelier(over_2_5, under_2_5), likelier(btts_yes, btts_no)].reduce(likelier)
  return {
    bestPick,
    fav1x2Prob: favourite.probability,
    fav1x2Odd: favourite.odd,
    over25Prob: over_2_5.probability,
    over25Odd: over_2_5.odd,
    bttsProb: btts_yes.probability,
    bttsOdd: btts_yes.odd,
    safetyScore: safety(bestPick),
  }
}

// "¿A cuál le entro?": two matches of VYROX IA's forecast side by side, and the one to back in a parlay.
export function compareMatches(matchA: ForecastMatch, matchB: ForecastMatch) {
  const A = side(matchA)
  const B = side(matchB)
  const winner: 'A' | 'B' =
    B.safetyScore > A.safetyScore || (B.safetyScore === A.safetyScore && B.bestPick.probability > A.bestPick.probability) ? 'B' : 'A'
  const [best, other, bestMatch, otherMatch] = winner === 'A' ? [A, B, matchA, matchB] : [B, A, matchB, matchA]
  const explanation =
    `Entra en ${teams(bestMatch)}: ${phrase(best.bestPick)} llega al ${best.bestPick.probability}% frente al ` +
    `${other.bestPick.probability}% de la mejor jugada de ${teams(otherMatch)}, con cuota ${best.bestPick.odd?.toFixed(2)} ` +
    `y un índice de seguridad de ${best.safetyScore} contra ${other.safetyScore}.`
  return { A, B, verdict: { winner, badge: 'MEJOR OPCIÓN PARA TU PARLAY', explanation } }
}
