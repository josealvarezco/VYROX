import assert from 'node:assert/strict'
import { test } from 'node:test'
import { calculateHedge, getOppositeMarket, pickToCover, suggestedHedgeOdd } from './hedgeCalculator.ts'
import { marketOdd } from './sameGameParlay.ts'
import { legResult } from './ticketSettlement.ts'
import type { TicketLeg } from './types.ts'

const leg = (market_selection: string, market_category: string, status: TicketLeg['status'] = 'pending', kickoff_label = '03/11 20:00'): TicketLeg => ({
  match_id: 1,
  home_team: 'Millonarios',
  away_team: 'Nacional',
  kickoff_label,
  market_selection,
  market_category,
  odd: 1.88,
  status,
})

test('the opposite market wins on exactly the scores where the pick loses', () => {
  const picks = [
    ['Millonarios - Resultado del partido', 'result', 'X2 (Empate o Nacional) - Doble oportunidad'],
    ['Nacional - Resultado del partido', 'result', '1X (Millonarios o Empate) - Doble oportunidad'],
    ['Empate - Resultado del partido', 'result', '12 (Millonarios o Nacional) - Doble oportunidad'],
    ['1X (Millonarios o Empate) - Doble oportunidad', 'double_chance', 'Nacional - Resultado del partido'],
    ['12 (Millonarios o Nacional) - Doble oportunidad', 'double_chance', 'Empate - Resultado del partido'],
    ['X2 (Empate o Nacional) - Doble oportunidad', 'double_chance', 'Millonarios - Resultado del partido'],
    ['Más de 1.5 - Goles totales', 'over_1_5', 'Menos de 1.5 - Goles totales'],
    ['Menos de 2.5 - Goles totales', 'goals', 'Más de 2.5 - Goles totales'],
    ['Más de 3.5 - Goles totales', 'over_3_5', 'Menos de 3.5 - Goles totales'],
    ['Sí - Ambos anotan', 'btts', 'No - Ambos anotan'],
    ['No - Ambos anotan', 'btts', 'Sí - Ambos anotan'],
  ]
  for (const [selection, category, expected] of picks) {
    const pick = leg(selection, category)
    const opposite = getOppositeMarket(pick)
    assert.ok(opposite, selection)
    assert.equal(opposite.market_selection, expected)
    const hedge = { ...pick, ...opposite }
    for (let home = 0; home <= 6; home++) for (let away = 0; away <= 6; away++) assert.notEqual(legResult(hedge, home, away), legResult(pick, home, away), `${selection} ${home}-${away}`)
  }
  assert.equal(getOppositeMarket(leg('Local o Empate - Jugada VYROX IA', 'recommended')), null)
})

test('the suggested odd is the other side of the same two-way market, and never under 1.01', () => {
  for (const percent of [75, 60, 50, 42]) assert.ok(Math.abs(suggestedHedgeOdd(marketOdd(percent)) - marketOdd(100 - percent)) <= 0.02, `${percent}`)
  assert.equal(suggestedHedgeOdd(50), 1.01)
})

test('it covers the last match to kick off, and counts the other pending picks', () => {
  const late = leg('Sí - Ambos anotan', 'btts', 'pending', '04/11 09:00')
  const early = leg('Más de 2.5 - Goles totales', 'goals', 'pending', '30/10 20:00') // an earlier month, a later day
  assert.deepEqual(pickToCover([late, early]), { leg: late, others: 1 })
  assert.deepEqual(pickToCover([leg('Más de 2.5 - Goles totales', 'goals', 'won'), late]), { leg: late, others: 0 })
  const unpadded = leg('Sí - Ambos anotan', 'btts', 'pending', '10/11 09:00') // the app's own labels drop the zero
  assert.equal(pickToCover([unpadded, leg('Más de 2.5 - Goles totales', 'goals', 'pending', '3/11 19:30')])?.leg, unpadded)

  const free = leg('Local o Empate - Jugada VYROX IA', 'recommended')
  assert.equal(pickToCover([free]), null)
  assert.deepEqual(pickToCover([free, late]), { leg: late, others: 1 })
})

test('equal profit: both sides of the hedge pay the same', () => {
  const { equal } = calculateHedge(10_000, 40_000, 2)
  assert.deepEqual(equal, { hedgeStake: 20_000, netProfitIfParlayWins: 10_000, netProfitIfHedgeWins: 10_000, guaranteedProfit: 10_000 })

  const { hedgeStake, netProfitIfParlayWins, netProfitIfHedgeWins, guaranteedProfit } = calculateHedge(10_000, 40_000, 1.77).equal
  assert.equal(hedgeStake, 22_599)
  assert.ok(Math.abs(netProfitIfParlayWins - netProfitIfHedgeWins) <= 1)
  assert.equal(guaranteedProfit, Math.min(netProfitIfParlayWins, netProfitIfHedgeWins))

  assert.ok(calculateHedge(10_000, 15_000, 1.4).equal.guaranteedProfit < 0) // a price that does not leave a profit says so
})

test('zero risk: the stake comes back if the hedge wins, and the rest goes to the parlay', () => {
  const { zero } = calculateHedge(10_000, 40_000, 2)
  assert.deepEqual(zero, { hedgeStake: 10_000, netProfitIfParlayWins: 20_000, netProfitIfHedgeWins: 0 })

  const rounded = calculateHedge(10_000, 40_000, 2.37).zero.hedgeStake
  assert.ok(Math.abs(rounded * 2.37 - rounded - 10_000) <= 2)

  assert.deepEqual(calculateHedge(10_000, 40_000, 1.01).zero, { hedgeStake: 0, netProfitIfParlayWins: 30_000, netProfitIfHedgeWins: -10_000 })
})
