import assert from 'node:assert/strict'
import { test } from 'node:test'
import { bankrollAnalytics } from './bankrollAnalytics.ts'
import type { SavedTicket, TicketLeg } from './types.ts'

const leg = (market_category: string, status: TicketLeg['status']): TicketLeg => ({
  match_id: 1,
  home_team: 'Millonarios',
  away_team: 'Nacional',
  kickoff_label: '29/10 20:00',
  market_selection: 'Millonarios - Resultado del partido',
  market_category,
  odd: 2,
  status,
})

const ticket = (status: SavedTicket['status'], settledAt: string | null, legs: TicketLeg[] = [], fromBank = true, total_odd = 4): SavedTicket => ({
  id: `${status}-${settledAt}`,
  createdAt: '2026-10-20T12:00:00Z',
  legs,
  total_odd,
  stake: 10_000,
  potential_return: 10_000 * total_odd,
  status,
  settledAt,
  fromBank,
})

test('no plays: the starting point alone and nothing to highlight', () => {
  const empty = bankrollAnalytics([], 50_000)
  assert.deepEqual(empty.points, [{ label: 'Inicio', odd: null, delta: 0, profit: 0, bank: 50_000 }])
  assert.deepEqual(
    empty.marketBreakdown.map(({ name, total, winRate }) => [name, total, winRate]),
    [['Resultado (1X2)', 0, 0], ['Más/Menos Goles', 0, 0], ['Ambos Anotan', 0, 0]],
  )
  assert.equal(empty.bestMarket, null)
  assert.equal(empty.currentStreak, null)
  assert.equal(empty.highestWonOdd, null)
})

test('settled plays in settling order: cumulative profit, and a bank curve that ends at today\'s bank', () => {
  // Stored newest first, as the bet slip keeps them; the pending play adds no point.
  const tickets = [ticket('pending', null), ticket('lost', '2026-10-22T12:00:00Z'), ticket('won', '2026-10-21T12:00:00Z')]
  const { points } = bankrollAnalytics(tickets, 120_000)
  assert.deepEqual(
    points.map(({ label, odd, delta, profit, bank }) => [label, odd, delta, profit, bank]),
    [
      ['Inicio', null, 0, 0, 100_000],
      ['21/10', 4, 30_000, 30_000, 130_000],
      ['22/10', 4, -10_000, 20_000, 120_000],
    ],
  )
})

test('a play staked without a bank moves the profit but not the bank', () => {
  const { points } = bankrollAnalytics([ticket('won', '2026-10-21T12:00:00Z', [], false)], 80_000)
  assert.deepEqual(points.map(({ profit, bank }) => [profit, bank]), [[0, 80_000], [30_000, 80_000]])
})

test('hit rate per market family from every decided pick, open plays included', () => {
  const tickets = [
    ticket('pending', null, [leg('result', 'won'), leg('btts', 'pending')]),
    ticket('lost', '2026-10-21T12:00:00Z', [leg('result', 'lost'), leg('goals', 'won'), leg('btts', 'lost')]),
    ticket('won', '2026-10-22T12:00:00Z', [leg('over_1_5', 'won'), leg('recommended', 'pending')]),
  ]
  const { marketBreakdown, bestMarket } = bankrollAnalytics(tickets, 0)
  assert.deepEqual(
    marketBreakdown.map(({ name, total, won, lost, winRate }) => [name, total, won, lost, winRate]),
    [
      ['Resultado (1X2)', 2, 1, 1, 50],
      ['Más/Menos Goles', 2, 2, 0, 100],
      ['Ambos Anotan', 1, 0, 1, 0],
    ],
  )
  assert.equal(bestMarket?.name, 'Más/Menos Goles')
})

test('the current streak counts back from the latest play, and the highest odd won stands out', () => {
  const tickets = [
    ticket('won', '2026-10-23T12:00:00Z', [], true, 2.5),
    ticket('won', '2026-10-22T12:00:00Z', [], true, 6.1),
    ticket('lost', '2026-10-21T12:00:00Z', [], true, 9.8),
  ]
  const { currentStreak, highestWonOdd } = bankrollAnalytics(tickets, 0)
  assert.deepEqual(currentStreak, { type: 'won', count: 2 })
  assert.equal(highestWonOdd, 6.1) // the lost 9.80 does not count
  assert.deepEqual(bankrollAnalytics(tickets.slice(2), 0).currentStreak, { type: 'lost', count: 1 })
})
