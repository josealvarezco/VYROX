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
    ['btts', 'Sí - Ambos anotan', 1, 1, true],
    ['btts', 'No - Ambos anotan', 2, 0, true],
    ['recommended', 'Local o Empate - Jugada VYROX IA', 2, 0, null],
  ] as const
  for (const [category, selection, home, away, expected] of cases) {
    assert.equal(legResult(leg(1, category, selection), home, away), expected, `${selection} ${home}-${away}`)
  }
})

test('one lost leg loses the ticket; legs of unfinished matches stay pending', () => {
  const open = ticket([HOME_WIN, BOTH_SCORE])

  const lost = settle([open], [match(1, 'FINISHED', 0, 1)], 'now')
  assert.equal(lost.tickets[0].status, 'lost')
  assert.equal(lost.tickets[0].settledAt, 'now')
  assert.deepEqual(lost.tickets[0].legs.map((l) => l.status), ['lost', 'pending'])
  assert.equal(lost.credit, 0)

  const half = settle([open], [match(1, 'FINISHED', 2, 0), match(2, 'IN_PLAY', 1, 1)], 'now').tickets[0]
  assert.equal(half.status, 'pending')
  assert.deepEqual(half.legs.map((l) => l.status), ['won', 'pending'])
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
