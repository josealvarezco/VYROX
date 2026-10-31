import assert from 'node:assert/strict'
import { test } from 'node:test'
import { legResult, settle } from './ticketSettlement.ts'
import type { Match, SavedTicket, TicketLeg } from './types.ts'

const leg = (match_id: number, market_category: string, market_selection: string): TicketLeg => ({
  match_id,
  home_team: 'Millonarios',
  away_team: 'Nacional',
  kickoff_label: '29/10 20:00',
  market_selection,
  market_category,
  odd: 2,
  status: 'pending',
})

const match = (id: number, status: string, home: number | null, away: number | null) =>
  ({ id, status, score: { fullTime: { home, away } } }) as Match

const ticket = (legs: TicketLeg[], fromBank = true): SavedTicket => ({
  id: 't1',
  createdAt: '2026-10-29T12:00:00Z',
  legs,
  total_odd: 4,
  stake: 10_000,
  potential_return: 40_000,
  status: 'pending',
  settledAt: null,
  fromBank,
})

const HOME_WIN = leg(1, 'result', 'Millonarios - Resultado del partido')
const BOTH_SCORE = leg(2, 'btts', 'Sí - Ambos anotan')

test('each market against a final score', () => {
  const cases = [
    ['result', 'Millonarios - Resultado del partido', 2, 1, true],
    ['result', 'Empate - Resultado del partido', 1, 1, true],
    ['result', 'Nacional - Resultado del partido', 2, 1, false],
    ['goals', 'Más de 2.5 - Goles totales', 2, 1, true],
    ['goals', 'Menos de 2.5 - Goles totales', 2, 1, false],
    ['over_1_5', 'Más de 1.5 - Goles totales', 1, 0, false],
    ['over_1_5', 'Menos de 1.5 - Goles totales', 1, 0, true],
    ['over_3_5', 'Más de 3.5 - Goles totales', 2, 2, true],
    ['over_3_5', 'Menos de 3.5 - Goles totales', 3, 1, false],
    ['double_chance', '1X (Millonarios o Empate) - Doble oportunidad', 1, 1, true],
    ['double_chance', '1X (Millonarios o Empate) - Doble oportunidad', 0, 1, false],
    ['double_chance', '12 (Millonarios o Nacional) - Doble oportunidad', 1, 1, false],
    ['double_chance', '12 (Millonarios o Nacional) - Doble oportunidad', 0, 2, true],
    ['double_chance', 'X2 (Empate o Nacional) - Doble oportunidad', 2, 1, false],
    ['double_chance', 'X2 (Empate o Nacional) - Doble oportunidad', 0, 0, true],
    ['btts', 'Sí - Ambos anotan', 1, 1, true],
    ['btts', 'No - Ambos anotan', 2, 0, true],
    ['recommended', 'Local o Empate - Jugada VYROX IA', 2, 0, null],
  ] as const
  for (const [category, selection, home, away, expected] of cases) {
    assert.equal(legResult(leg(1, category, selection), home, away), expected, `${selection} ${home}-${away}`)
  }
})

test('live, the 3.5 line is decided once passed and a double chance waits for the final whistle', () => {
  const open = ticket([leg(1, 'over_3_5', 'Más de 3.5 - Goles totales'), leg(1, 'double_chance', '1X (Millonarios o Empate) - Doble oportunidad')])

  const live = settle([open], [match(1, 'IN_PLAY', 3, 1)], 'now')
  assert.deepEqual(live.tickets[0].legs.map((l) => l.status), ['won', 'pending'])
  assert.equal(live.tickets[0].status, 'pending')

  const final = settle(live.tickets, [match(1, 'FINISHED', 3, 1)], 'later')
  assert.deepEqual(final.tickets[0].legs.map((l) => l.status), ['won', 'won'])
  assert.equal(final.tickets[0].status, 'won')
})

test('one lost leg loses the ticket; legs of unfinished matches stay pending', () => {
  const open = ticket([HOME_WIN, BOTH_SCORE])

  const lost = settle([open], [match(1, 'FINISHED', 0, 1)], 'now')
  assert.equal(lost.tickets[0].status, 'lost')
  assert.equal(lost.tickets[0].settledAt, 'now')
  assert.deepEqual(lost.tickets[0].legs.map((l) => l.status), ['lost', 'pending'])
  assert.equal(lost.credit, 0)

  const half = settle([open], [match(1, 'FINISHED', 2, 0), match(2, 'IN_PLAY', 1, 0)], 'now').tickets[0]
  assert.equal(half.status, 'pending')
  assert.deepEqual(half.legs.map((l) => l.status), ['won', 'pending'])
})

test('a live score settles a pick as soon as its market cannot change', () => {
  const cases = [
    ['goals', 'Más de 2.5 - Goles totales', 2, 1, 'won'],
    ['goals', 'Menos de 2.5 - Goles totales', 2, 1, 'lost'],
    ['goals', 'Más de 2.5 - Goles totales', 1, 1, 'pending'],
    ['over_1_5', 'Más de 1.5 - Goles totales', 1, 1, 'won'],
    ['over_1_5', 'Menos de 1.5 - Goles totales', 2, 0, 'lost'],
    ['btts', 'Sí - Ambos anotan', 1, 1, 'won'],
    ['btts', 'No - Ambos anotan', 1, 1, 'lost'],
    ['btts', 'No - Ambos anotan', 3, 0, 'pending'],
    ['result', 'Millonarios - Resultado del partido', 3, 0, 'pending'], // a result waits for the final whistle
  ] as const
  for (const [category, selection, home, away, expected] of cases) {
    const [settled] = settle([ticket([leg(1, category, selection)])], [match(1, 'IN_PLAY', home, away)], 'now').tickets
    assert.equal(settled.legs[0].status, expected, `${selection} ${home}-${away}`)
  }
})

test('a pick lost live loses the whole ticket at once, before its other matches end', () => {
  const live = settle([ticket([leg(1, 'goals', 'Menos de 2.5 - Goles totales'), BOTH_SCORE])], [match(1, 'PAUSED', 2, 1)], 'now')
  assert.equal(live.tickets[0].status, 'lost')
  assert.deepEqual(live.tickets[0].legs.map((l) => l.status), ['lost', 'pending'])
  assert.equal(live.credit, 0)
})

test('a won ticket pays its return into the bank once, and only if the stake came from it', () => {
  const finals = [match(1, 'FINISHED', 2, 1), match(2, 'FINISHED', 1, 1)]

  const first = settle([ticket([HOME_WIN, BOTH_SCORE])], finals, 'now')
  assert.equal(first.tickets[0].status, 'won')
  assert.equal(first.credit, 40_000)

  const again = settle(first.tickets, finals, 'later')
  assert.equal(again.credit, 0)
  assert.equal(again.tickets, first.tickets) // nothing changed: same array, so React skips the update

  assert.equal(settle([ticket([HOME_WIN], false)], finals, 'now').credit, 0)
})

test('the recommended play waits for a manual settlement', () => {
  const pending = [ticket([leg(1, 'recommended', 'Local o Empate - Jugada VYROX IA')])]
  assert.equal(settle(pending, [match(1, 'FINISHED', 2, 0)], 'now').tickets, pending)
})
