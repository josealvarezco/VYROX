import assert from 'node:assert/strict'
import { test } from 'node:test'
import { bestHouse, selection, slot } from './bookmakers.ts'
import type { BookmakerOdds, MatchOdds, SlipLeg } from './types.ts'

const leg = (match_id: number, market_selection: string, market_category: string): SlipLeg => ({
  match_id,
  home_team: 'Millonarios',
  away_team: 'Nacional',
  kickoff_label: '30/10 20:00',
  market_selection,
  market_category,
  odd: 1.8,
})

const book = (name: string, markets: Record<string, Record<string, number>>): BookmakerOdds => ({
  name,
  markets: Object.fromEntries(Object.entries(markets).map(([market, sides]) => [market, Object.fromEntries(Object.entries(sides).map(([side, odd]) => [side, { odd, trend: 'stable' }]))])),
})

const odds = (...bookmakers: BookmakerOdds[]): MatchOdds => ({ bookmakers, updated: '2026-10-29T00:00:31+00:00' })

test('a bookmaker side becomes the pick VYROX would name, and back', () => {
  const cases = [
    ['1x2', 'home', 'Millonarios - Resultado del partido', 'result'],
    ['1x2', 'draw', 'Empate - Resultado del partido', 'result'],
    ['1x2', 'away', 'Nacional - Resultado del partido', 'result'],
    ['goals_2_5', 'over', 'Más de 2.5 - Goles totales', 'goals'],
    ['goals_1_5', 'under', 'Menos de 1.5 - Goles totales', 'over_1_5'],
    ['btts', 'no', 'No - Ambos anotan', 'btts'],
  ] as const
  for (const [market, side, label, category] of cases) {
    assert.deepEqual(selection(market, side, 'Millonarios', 'Nacional'), [label, category])
    assert.deepEqual(slot(leg(1, label, category)), [market, side])
  }
  assert.equal(slot(leg(1, 'Local o Empate - Jugada VYROX IA', 'recommended')), null)
})

test('the best house quotes every pick and pays the most for the whole slip', () => {
  const slip = [leg(1, 'Millonarios - Resultado del partido', 'result'), leg(2, 'Sí - Ambos anotan', 'btts')]
  const quotes = {
    1: odds(book('Betano', { '1x2': { home: 1.9 } }), book('Pinnacle', { '1x2': { home: 2.05 } }), book('Bet365', { '1x2': { home: 1.95 } })),
    2: odds(book('Betano', { btts: { yes: 1.7 } }), book('Bet365', { btts: { yes: 1.72 } })), // Pinnacle has no both-score market
  }

  assert.deepEqual(bestHouse(slip, quotes), { missing: 0, best: { name: 'Bet365', odds: [1.95, 1.72], total: 3.35 } })
})

test('no answer while a match of the slip has no odds opened, or for the recommended play', () => {
  const slip = [leg(1, 'Millonarios - Resultado del partido', 'result'), leg(2, 'Sí - Ambos anotan', 'btts')]
  const quotes = { 1: odds(book('Betano', { '1x2': { home: 1.9 } })) }

  assert.deepEqual(bestHouse(slip, quotes), { missing: 1, best: null })
  assert.deepEqual(bestHouse([leg(1, 'Local o Empate - Jugada VYROX IA', 'recommended')], quotes), { missing: 0, best: null })
  assert.deepEqual(bestHouse([], quotes), { missing: 0, best: null })
})
