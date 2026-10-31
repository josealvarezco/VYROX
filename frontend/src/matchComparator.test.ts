import assert from 'node:assert/strict'
import { test } from 'node:test'
import { compareMatches } from './matchComparator.ts'
import type { ForecastMatch } from './types.ts'

const pick = (market_selection: string, market_category: string, probability: number, odd: number) => ({ market_selection, market_category, probability, odd })

const forecast = (match_id: number, home_team: string, away_team: string, picks: ForecastMatch['picks']): ForecastMatch => ({
  match_id,
  league_name: 'Premier League',
  league_logo: '',
  home_team,
  away_team,
  home_logo: '',
  away_logo: '',
  kickoff_label: '30/10 09:00',
  picks,
})

// The radar's forecast of the parlays' fixture: Arsenal 80 / 12 / 8, Liverpool a 45 % favourite.
const ARSENAL = forecast(3, 'Arsenal', 'Chelsea', {
  favourite: pick('Arsenal - Resultado del partido', 'result', 80, 1.45),
  home: pick('Arsenal - Resultado del partido', 'result', 80, 1.45),
  draw: pick('Empate - Resultado del partido', 'result', 12, 3.6),
  away: pick('Chelsea - Resultado del partido', 'result', 8, 9.3),
  over_2_5: pick('Más de 2.5 - Goles totales', 'goals', 62, 1.58),
  under_2_5: pick('Menos de 2.5 - Goles totales', 'goals', 38, 2.31),
  btts_yes: pick('Sí - Ambos anotan', 'btts', 50, 1.88),
  btts_no: pick('No - Ambos anotan', 'btts', 50, 1.88),
})
const LIVERPOOL = forecast(6, 'Liverpool', 'City', {
  favourite: pick('Liverpool - Resultado del partido', 'result', 45, 2.07),
  home: pick('Liverpool - Resultado del partido', 'result', 45, 2.07),
  draw: pick('Empate - Resultado del partido', 'result', 27, 3.45),
  away: pick('City - Resultado del partido', 'result', 28, 3.32),
  over_2_5: pick('Más de 2.5 - Goles totales', 'goals', 60, 1.62),
  under_2_5: pick('Menos de 2.5 - Goles totales', 'goals', 40, 2.22),
  btts_yes: pick('Sí - Ambos anotan', 'btts', 63, 1.56),
  btts_no: pick('No - Ambos anotan', 'btts', 37, 2.44),
})

test('each side: the strongest pick of its main markets and the four metrics', () => {
  const { A, B } = compareMatches(ARSENAL, LIVERPOOL)

  assert.equal(A.bestPick.market_selection, 'Arsenal - Resultado del partido')
  assert.equal(B.bestPick.market_selection, 'Sí - Ambos anotan') // 63 % beats over 2.5 at 60 % and the 45 % favourite
  assert.deepEqual(
    [A.fav1x2Prob, A.fav1x2Odd, A.over25Prob, A.over25Odd, A.bttsProb, A.bttsOdd],
    [80, 1.45, 62, 1.58, 50, 1.88],
  )
})

test('the safety index weighs the trend and what the odd pays for it', () => {
  const { A, B } = compareMatches(ARSENAL, LIVERPOOL)
  assert.equal(A.safetyScore, 83) // 80 % paying 1.45: clear and well paid
  assert.equal(B.safetyScore, 59) // 63 % paying 1.56: a shade under a fair odd
})

test('the verdict backs the safer match and says why, whichever side it is on', () => {
  const ahead = compareMatches(ARSENAL, LIVERPOOL).verdict
  const behind = compareMatches(LIVERPOOL, ARSENAL).verdict

  assert.deepEqual([ahead.winner, behind.winner], ['A', 'B'])
  assert.equal(ahead.badge, 'MEJOR OPCIÓN PARA TU PARLAY')
  assert.equal(
    ahead.explanation,
    'Entra en Arsenal vs Chelsea: la victoria de Arsenal llega al 80% frente al 63% de la mejor jugada de Liverpool vs City, ' +
      'con cuota 1.45 y un índice de seguridad de 83 contra 59.',
  )
  assert.equal(behind.explanation, ahead.explanation)
})

test('a tie stays with the first match', () => {
  assert.equal(compareMatches(ARSENAL, ARSENAL).verdict.winner, 'A')
})
