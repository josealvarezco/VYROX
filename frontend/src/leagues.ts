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

// The countries that lead "Todas las ligas", in order, under API-Football's name, with their name in Spanish.
const LEAD_COUNTRIES: Record<string, string> = {
  [WORLD]: 'Internacional',
  Colombia: 'Colombia',
  England: 'Inglaterra',
  Spain: 'España',
  Italy: 'Italia',
  Germany: 'Alemania',
  France: 'Francia',
  Brazil: 'Brasil',
  Argentina: 'Argentina',
  Portugal: 'Portugal',
  Netherlands: 'Países Bajos',
  USA: 'Estados Unidos',
  Mexico: 'México',
}
const LEAD_ORDER = Object.keys(LEAD_COUNTRIES)

export function countryLabel(country: string) {
  return LEAD_COUNTRIES[country] ?? country
}

// Lead countries first in their order, the rest alphabetically.
export function byCountry(a: string, b: string) {
  const rank = (country: string) => (LEAD_ORDER.includes(country) ? LEAD_ORDER.indexOf(country) : LEAD_ORDER.length)
  return rank(a) - rank(b) || countryLabel(a).localeCompare(countryLabel(b), 'es')
}

// Case- and accent-insensitive text for the filters, so "atletico" finds "Atlético".
export function fold(text: string) {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
}
