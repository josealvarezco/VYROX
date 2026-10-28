// "Mejores ligas" in the sidebar (API-Football ids). The backend orders the match list with its own TOP_LEAGUES.
export const TOP_LEAGUES = [
  { id: 39, name: 'Premier League' },
  { id: 239, name: 'Primera A' },
  { id: 2, name: 'Champions League' },
  { id: 140, name: 'LaLiga' },
  { id: 78, name: 'Bundesliga' },
  { id: 135, name: 'Serie A' },
  { id: 61, name: 'Ligue 1' },
  { id: 3, name: 'Europa League' },
  { id: 13, name: 'Copa Libertadores' },
  { id: 253, name: 'MLS' },
]

export const WORLD = 'World' // API-Football's country for international competitions

export function leagueLogo(id: number) {
  return `https://media.api-sports.io/football/leagues/${id}.png`
}

export function countryLabel(country: string) {
  return country === WORLD ? 'Internacional' : country
}

// Case- and accent-insensitive text for the filters, so "atletico" finds "Atlético".
export function fold(text: string) {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
}
