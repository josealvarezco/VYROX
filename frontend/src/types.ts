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
export type MomentumStatus = 'balanced' | 'home_domination' | 'away_domination' | 'high_voltage'
// Momentum IA of a live match, measured from its statistics each time its Match Center loads
export type Momentum = {
  home_pressure: number // 0 to 100
  away_pressure: number
  momentum_status: MomentumStatus // high_voltage: a hot match
  goal_probability_next_15m: number // %
}
// A live match measured in the last 10 minutes carries its momentum
export type Match = Partial<Momentum> & {
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
      recommended_bet_probability: number
      reasoning: string
      // Estimated market odds: VYROX IA's probability with a bookmaker's margin; null when the probability is 0
      market_odds: Record<'recommended' | 'home' | 'draw' | 'away' | 'over_2_5' | 'under_2_5' | 'btts_yes' | 'btts_no', number | null>
    }

// GET /api/parlays: odds are estimated market odds (VYROX IA's probability with a bookmaker's margin), never a bookmaker's
export type ParlayLeg = {
  match_id: number
  league_name: string
  league_logo: string
  country_flag: string | null
  home_team: string
  away_team: string
  kickoff_label: string // "28/10 20:05", Colombia time
  market_selection: string
  market_category: string // result, over_1_5, goals (2.5) or btts; "recommended" for the Match Center's play
  probability: number
  odd: number
  popularity_label: string
}
export type Parlay = {
  key: 'segura' | 'valor' | 'tendencia'
  title: string
  badge: string
  legs: ParlayLeg[]
  total_odd: number
  probability: number
}
// GET /api/parlays/builder: the slip nearest a target odd, built from the day's cached VYROX IA forecast
export type SmartParlay = {
  legs: ParlayLeg[]
  total_odd: number
  probability: number // joint chance of every leg, in %
  legs_count: number
  on_target: boolean // within 20 % of the target
  simulated: boolean
  played: boolean // a day already played: a reference that takes no plays
  message: string | null
}
// GET /api/forecasts: VYROX IA's forecast per match of the date (up to 12), priced like the radar, for the comparator
export type ForecastPick = { market_selection: string; market_category: string; probability: number; odd: number | null }
export type ForecastMatch = {
  match_id: number
  league_name: string
  league_logo: string
  home_team: string
  away_team: string
  home_logo: string
  away_logo: string
  kickoff_label: string
  picks: Record<'favourite' | 'over_2_5' | 'under_2_5' | 'btts_yes' | 'btts_no', ForecastPick>
}
export type ForecastsResponse = { matches: ForecastMatch[]; simulated: boolean; played: boolean }
// GET /api/matches/{id}/odds: real bookmaker odds from API-Football; a trend is a move VYROX saw since its last look
export type Quote = { odd: number; trend: 'up' | 'down' | 'stable' }
export type OddsMarket = '1x2' | 'goals_2_5' | 'goals_1_5' | 'btts'
export type BookmakerOdds = { name: string; markets: Partial<Record<OddsMarket, Record<string, Quote>>> }
export type MatchOdds = { bookmakers: BookmakerOdds[]; updated: string | null }
// A bet slip pick: a parlay leg, or an odd picked in the Match Center, with the bookmaker it was taken from, if any
export type SlipLeg = Pick<
  ParlayLeg,
  'match_id' | 'home_team' | 'away_team' | 'kickoff_label' | 'market_selection' | 'market_category' | 'odd'
> & { bookmaker?: string }
export type TicketStatus = 'pending' | 'won' | 'lost'
export type TicketLeg = SlipLeg & { status: TicketStatus }
// A registered play ("Mis Jugadas"), kept in localStorage and settled with the final scores the page loads
export type SavedTicket = {
  id: string
  createdAt: string
  legs: TicketLeg[]
  total_odd: number
  stake: number
  potential_return: number
  status: TicketStatus
  settledAt: string | null
  fromBank: boolean // the stake left the user's bank, so a win pays the return back into it
}
// simulated: VYROX IA was unavailable, so the slips are stable demo data
export type ParlaysResponse = { parlays: Parlay[]; simulated: boolean; message: string | null }

// GET /api/radar: the date's strongest picks per market, from the parlays' VYROX IA forecast
export type RadarItem = Omit<ParlayLeg, 'odd' | 'popularity_label'> & {
  league_id: number
  home_logo: string
  away_logo: string
  market_odd: number // the parlays' odd for the same pick
  confidence_badge: 'ALTA' | 'MEDIA'
  insight: string
}
export type RadarCategory = { key: 'bankers_1x2' | 'over_2_5' | 'btts_yes' | 'under_2_5'; title: string; items: RadarItem[] }
// played: the date has no match left to play, so its picks are a reference that takes no plays
export type RadarResponse = { categories: RadarCategory[]; simulated: boolean; played: boolean; message: string | null }

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
  momentum: Momentum | null // live matches with real statistics only
}
