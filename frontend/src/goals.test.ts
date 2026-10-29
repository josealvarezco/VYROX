import assert from 'node:assert/strict'
import { test } from 'node:test'
import { newGoals, type Score } from './goals.ts'
import type { Match } from './types.ts'

const match = (status: string, home: number | null, away: number | null, minute: number | null = 68) =>
  ({
    id: 7,
    status,
    minute,
    homeTeam: { id: 1125, shortName: 'Millonarios', crest: '' },
    awayTeam: { id: 1137, shortName: 'Nacional', crest: '' },
    score: { fullTime: { home, away } },
  }) as Match

const goals = (seen: Record<number, Score>, ...list: Match[]) => newGoals(seen, list).map((goal) => `${goal.team} ${goal.score}`)

test('the first sighting only sets the baseline', () => {
  const seen = {}
  assert.deepEqual(goals(seen, match('IN_PLAY', 2, 1)), [])
  assert.deepEqual(seen, { 7: { home: 2, away: 1 } })
})

test('a live score going up is a goal of the side that scored', () => {
  const seen = {}
  goals(seen, match('IN_PLAY', 1, 0))
  const [goal] = newGoals(seen, [match('IN_PLAY', 2, 0)])
  assert.deepEqual(goal, { key: '7-2-0-home', matchId: 7, teamId: 1125, team: 'Millonarios', score: '2 - 0', minute: 68 })
  assert.deepEqual(goals(seen, match('IN_PLAY', 3, 1)), ['Millonarios 3 - 1', 'Nacional 3 - 1']) // one each between two lists
})

test('a goal taken back is no alert, and the next one is', () => {
  const seen = {}
  goals(seen, match('IN_PLAY', 2, 0))
  assert.deepEqual(goals(seen, match('IN_PLAY', 1, 0)), [])
  assert.deepEqual(goals(seen, match('IN_PLAY', 2, 0)), ['Millonarios 2 - 0'])
})

test('kickoff counts as 0-0, the final whistle still counts, and other states never alert', () => {
  const seen = {}
  goals(seen, match('TIMED', null, null))
  assert.deepEqual(goals(seen, match('IN_PLAY', 0, 1)), ['Nacional 0 - 1'])
  assert.deepEqual(goals(seen, match('FINISHED', 1, 1)), ['Millonarios 1 - 1'])
  assert.deepEqual(goals(seen, match('AWARDED', 3, 0)), [])
})
