// Runtime import with its extension, so Node runs this file's test without a bundler.
import { LIVE } from './status.ts'
import type { Match } from './types.ts'

export type Score = { home: number; away: number }
export type GoalAlert = { key: string; matchId: number; teamId: number; team: string; score: string; minute: number | null }

// The goals since the previous list: a live (or just finished) match whose score went up, one alert per side that
// scored. Records every score in `seen`, so a match seen for the first time only sets its baseline; one not started
// counts as 0-0, so the first goal after kickoff is caught too.
export function newGoals(seen: Record<number, Score>, matches: Match[]): GoalAlert[] {
  const goals: GoalAlert[] = []
  for (const match of matches) {
    const score = { home: match.score.fullTime.home ?? 0, away: match.score.fullTime.away ?? 0 }
    const before = seen[match.id]
    seen[match.id] = score
    // A goal in stoppage time can arrive together with the final whistle.
    if (!before || !(LIVE.has(match.status) || match.status === 'FINISHED')) continue
    for (const side of ['home', 'away'] as const) {
      if (score[side] <= before[side]) continue // equal, or taken back by VAR
      const team = side === 'home' ? match.homeTeam : match.awayTeam
      goals.push({
        key: `${match.id}-${score.home}-${score.away}-${side}`,
        matchId: match.id,
        teamId: team.id,
        team: team.shortName,
        score: `${score.home} - ${score.away}`,
        minute: match.minute ?? null,
      })
    }
  }
  return goals
}
