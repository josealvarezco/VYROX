export type Side = 'home' | 'away'
export type Team = { id: number; shortName: string; crest: string }
export type Goals = { home: number | null; away: number | null }
export type League = {
  league_id: number
  league_name: string
  country: string // "World" for international competitions
  league_logo: string
  country_flag: string | null
}
export type Match = {
  id: number
  utcDate: string
  status: string
  league: League
  homeTeam: Team
  awayTeam: Team
  score: { fullTime: Goals; halfTime?: Goals }
  // Detail fields come from API-Football; the sample data does not have them.
  minute?: number | null
  round?: string
  venue?: { name: string | null; city: string | null }
  referee?: string | null
}
export type Competition = League & { matches: Match[] }
export type MatchesResponse = { sample: boolean; competitions: Competition[] }
export type Prediction =
  | { fallback: true; reasoning: string }
  | {
      fallback: false
      winner_pick: string
      probabilities: { home: number; draw: number; away: number }
      both_teams_to_score: string
      over_under_2_5: string
      confidence: string
      recommended_bet: string
      reasoning: string
    }

// GET /api/matches/{id}/details
export type MatchEvent = { minute: string; team: Side } & (
  | { type: 'goal'; player: string; assist: string | null; detail: string | null }
  | { type: 'yellow' | 'red'; player: string }
  | { type: 'subst'; player_in: string; player_out: string }
)
export type Player = {
  id: number | null
  name: string
  number: number
  pos: string
  goals: number
  yellow: boolean
  red: boolean
  subbed_in: string | null
  subbed_out: string | null
}
export type Starter = Player & { row: number; col: number }
export type Lineup = { formation: string; coach: string | null; starters: Starter[]; substitutes: Player[] }
export type Meeting = { id: number; date: string; league: string; home: string; away: string; home_goals: number; away_goals: number }
export type MatchDetails = {
  sample: boolean
  simulated: ('statistics' | 'lineups')[]
  events: MatchEvent[]
  statistics: { label: string; home: number; away: number }[]
  lineups: Record<Side, Lineup> | null
  h2h: { matches: Meeting[]; avg_goals: number | null; btts: number; over_2_5: number } | null
}
