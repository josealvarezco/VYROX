import assert from 'node:assert/strict'
import { test } from 'node:test'
import { parlayMatches, toggleSlot, topLive, trackLeg } from './multiView.ts'
import type { Match, SlipLeg } from './types.ts'

const match = (id: number, status = 'IN_PLAY', extra: Partial<Match> = {}, home: number | null = 0, away: number | null = 0) =>
  ({ id, status, utcDate: `2026-11-03T${10 + id}:00:00Z`, score: { fullTime: { home, away } }, ...extra }) as Match

const leg = (market_selection: string, market_category: string): SlipLeg => ({
  match_id: 1,
  home_team: 'Millonarios',
  away_team: 'Nacional',
  kickoff_label: '3/11 20:00',
  market_selection,
  market_category,
  odd: 1.8,
})

test('a slot toggles, four is the limit, and matches of other dates give way first', () => {
  const all = () => true
  assert.deepEqual(toggleSlot([1, 2], 3, all), [1, 2, 3])
  assert.deepEqual(toggleSlot([1, 2], 2, all), [1])
  assert.deepEqual(toggleSlot([1, 2, 3, 4], 5, all), [1, 2, 3, 4])
  assert.deepEqual(toggleSlot([1, 2, 3, 4], 5, (id) => id > 2), [3, 4, 5])
})

test('my parlay: only this date, one slot per match, live first and four at most', () => {
  const matches = [match(1, 'FINISHED'), match(2, 'TIMED'), match(3), match(4, 'TIMED'), match(5, 'PAUSED'), match(6)]
  const legs = [2, 2, 1, 3, 4, 5, 99].map((match_id) => ({ match_id }))
  assert.deepEqual(parlayMatches(legs, matches), [3, 5, 2, 4])
})

test('top live: hot, then measured, then the order of the list', () => {
  const matches = [match(1), match(2, 'TIMED'), match(3, 'IN_PLAY', { home_pressure: 40 }), match(4, 'IN_PLAY', { momentum_status: 'high_voltage' }), match(5), match(6)]
  assert.deepEqual(topLive(matches), [4, 3, 1, 5])
})

test('a pick is tracked against the score right now', () => {
  const over = leg('Más de 2.5 - Goles totales', 'goals')
  const under = leg('Menos de 2.5 - Goles totales', 'goals')
  const home = leg('Millonarios - Resultado del partido', 'result')
  assert.equal(trackLeg(over, match(1, 'IN_PLAY', {}, 1, 1)), 'waiting')
  assert.equal(trackLeg(over, match(1, 'IN_PLAY', {}, 2, 1)), 'ok')
  assert.equal(trackLeg(under, match(1, 'IN_PLAY', {}, 1, 1)), 'ok')
  assert.equal(trackLeg(under, match(1, 'IN_PLAY', {}, 2, 1)), 'lost')
  assert.equal(trackLeg(home, match(1, 'IN_PLAY', {}, 0, 1)), 'waiting') // it can still turn around
  assert.equal(trackLeg(home, match(1, 'FINISHED', {}, 0, 1)), 'lost')
  assert.equal(trackLeg(home, match(1, 'TIMED', {}, null, null)), 'waiting')
  assert.equal(trackLeg(leg('Local o Empate - Jugada VYROX IA', 'recommended'), match(1, 'IN_PLAY', {}, 2, 0)), 'waiting')
  assert.equal(trackLeg({ ...home, status: 'won' }, match(1, 'IN_PLAY', {}, 0, 1)), 'ok')
})
