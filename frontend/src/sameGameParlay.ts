// Imports with their extension, so Node runs this file's test without a bundler.
import { legResult } from './ticketSettlement.ts'
import type { SlipLeg } from './types.ts'

// Crear Apuesta: picks of one match priced together. An independent Poisson model of the final score (each side's
// expected goals), fitted to VYROX IA's forecast, gives the chance that the picks all win at once, which a plain
// product of their odds gets wrong whenever they depend on each other.
export type Model = [home: number, away: number]
export type Choice = { label: string; leg: SlipLeg }

const MAX_GOALS = 10 // scores up to 10-10, as the slip's compatibility check
const SCORES = Array.from({ length: (MAX_GOALS + 1) ** 2 }, (_, i) => [Math.floor(i / (MAX_GOALS + 1)), i % (MAX_GOALS + 1)] as const)

function goalChances(mean: number) {
  const chances = [Math.exp(-mean)]
  for (let goals = 1; goals <= MAX_GOALS; goals++) chances.push((chances[goals - 1] * mean) / goals)
  return chances
}

// The chance that every pick wins: the scores up to 10-10 that win them all.
export function jointProbability([home, away]: Model, legs: SlipLeg[]) {
  const [ofHome, ofAway] = [goalChances(home), goalChances(away)]
  return SCORES.reduce((sum, [h, a]) => (legs.every((leg) => legResult(leg, h, a)) ? sum + ofHome[h] * ofAway[a] : sum), 0)
}

// Picks of one match fit together if each takes a market of its own and some score up to 10-10 wins them all: never
// Empate + "No" ambos anotan + Más de 1.5 (only 0-0 is a draw without both scoring), nor a win + both scoring +
// Menos de 2.5 (that win is 2-1 at least).
export const isCompatible = (legs: SlipLeg[]) =>
  legs.length < 2 ||
  (new Set(legs.map((leg) => leg.market_category)).size === legs.length &&
    SCORES.some(([home, away]) => legs.every((leg) => legResult(leg, home, away))))

// Bisection: where an increasing function reaches the target between low and high.
function solve(f: (x: number) => number, target: number, low: number, high: number) {
  for (let step = 0; step < 40; step++) {
    const middle = (low + high) / 2
    if (f(middle) < target) low = middle
    else high = middle
  }
  return (low + high) / 2
}

// The home side's share of the decisive results.
function homeShare(model: Model) {
  const [ofHome, ofAway] = model.map(goalChances)
  const [wins, losses] = SCORES.reduce(
    ([w, l], [h, a]) => (h > a ? [w + ofHome[h] * ofAway[a], l] : a > h ? [w, l + ofHome[h] * ofAway[a]] : [w, l]),
    [0, 0],
  )
  return wins / (wins + losses)
}

// The model of VYROX IA's forecast, in percentages: the total goals that give its chance of more than 2.5, split so
// the home side takes the share of the decisive results its home and away chances give it.
export function fitModel(home: number, away: number, over25: number): Model {
  const total = solve((mean) => 1 - Math.exp(-mean) * (1 + mean + mean ** 2 / 2), over25 / 100, 0.2, 8)
  const share = solve((part) => homeShare([total * part, total * (1 - part)]), home + away ? home / (home + away) : 0.5, 0.02, 0.98)
  return [total * share, total * (1 - share)]
}

// The backend's prob_to_market_odd (backend/app/odds.py): a 6.5 % two-way margin, the chance pulled 17 % toward 50 %.
export const marketOdd = (percent: number) => Math.round(100 / (1.065 / 2 + 0.83 * (percent / 100 - 0.5))) / 100

// A Crear Apuesta's odd: what its picks pay at their own odds, for the chance of winning them all at once instead of
// one by one. Inside one bet no pick pays above its fair chance, so a pick the others already bring (Más de 1.5 next
// to both scoring, Más de 2.5 next to a win with both scoring) only trims the price by its margin. null when no
// score wins them all.
export function calculateCorrelatedOdd(legs: SlipLeg[], model: Model) {
  const joint = jointProbability(model, legs)
  if (!isCompatible(legs) || !joint) return null
  if (legs.length === 1) return legs[0].odd
  const paid = legs.reduce((product, leg) => product * Math.min(leg.odd * jointProbability(model, [leg]), 1), 1)
  return Math.max(Math.round((paid / joint) * 100) / 100, 1.01)
}

// The slip's picks by match, in the order their matches came in.
export const byMatch = (legs: SlipLeg[]) => [
  ...legs.reduce((groups, leg) => groups.set(leg.match_id, [...(groups.get(leg.match_id) ?? []), leg]), new Map<number, SlipLeg[]>()).values(),
]

// One match's picks: a Crear Apuesta's odd when a model of the match came with any of them, their product otherwise.
export function matchOdd(legs: SlipLeg[]) {
  const model = legs.find((leg) => leg.model)?.model
  return (model && calculateCorrelatedOdd(legs, model)) || legs.reduce((product, leg) => product * leg.odd, 1)
}

// The slip's total: its matches' odds multiplied. Same rounding as the backend's total_odd.
export const totalOdd = (legs: SlipLeg[]) => Math.round(byMatch(legs).reduce((product, group) => product * matchOdd(group), 1) * 100) / 100

type Base = Pick<SlipLeg, 'match_id' | 'home_team' | 'away_team' | 'kickoff_label'>
type Chances = { home: number; draw: number; away: number }
type Odds = Record<'home' | 'draw' | 'away' | 'over_2_5' | 'under_2_5' | 'btts_yes' | 'btts_no', number | null>

// A match's Crear Apuesta markets at VYROX IA's estimated market odds: 1X2, the 2.5 line and both scoring as the
// forecast prices them, the double chance from its 1X2 chances, and the 1.5 and 3.5 lines from the model.
export function betBuilderMarkets(base: Base, chances: Chances, odds: Odds, model: Model) {
  const choice = (label: string, market_selection: string, market_category: string, odd: number | null): Choice[] =>
    odd ? [{ label, leg: { ...base, market_selection, market_category, odd, model } }] : []
  const line = (value: number, category: string, over: number | null = null, under: number | null = null) => {
    const chance = 100 * jointProbability(model, [{ ...base, market_selection: `Más de ${value} - Goles totales`, market_category: category, odd: 1 }])
    return [
      ...choice(`Más de ${value}`, `Más de ${value} - Goles totales`, category, over ?? marketOdd(chance)),
      ...choice(`Menos de ${value}`, `Menos de ${value} - Goles totales`, category, under ?? marketOdd(100 - chance)),
    ]
  }
  const { home_team: home, away_team: away } = base
  return [
    {
      name: 'Resultado / Doble oportunidad',
      choices: [
        ...choice('Local', `${home} - Resultado del partido`, 'result', odds.home),
        ...choice('Empate', 'Empate - Resultado del partido', 'result', odds.draw),
        ...choice('Visitante', `${away} - Resultado del partido`, 'result', odds.away),
        ...choice('1X', `1X (${home} o Empate) - Doble oportunidad`, 'double_chance', marketOdd(chances.home + chances.draw)),
        ...choice('12', `12 (${home} o ${away}) - Doble oportunidad`, 'double_chance', marketOdd(chances.home + chances.away)),
        ...choice('X2', `X2 (Empate o ${away}) - Doble oportunidad`, 'double_chance', marketOdd(chances.draw + chances.away)),
      ],
    },
    { name: 'Goles totales', choices: [...line(1.5, 'over_1_5'), ...line(2.5, 'goals', odds.over_2_5, odds.under_2_5), ...line(3.5, 'over_3_5')] },
    { name: 'Ambos anotan', choices: [...choice('Sí', 'Sí - Ambos anotan', 'btts', odds.btts_yes), ...choice('No', 'No - Ambos anotan', 'btts', odds.btts_no)] },
  ]
}

// Three ready-made Crear Apuesta: the home side's grip (its win with Más de 1.5, or 1X when the visitors are the
// favourites), an open match, and a locked one (when VYROX IA expects goals, the favourite's double chance and
// Menos de 3.5 instead).
export function getPresetBetBuilders(markets: ReturnType<typeof betBuilderMarkets>, chances: Chances, model: Model) {
  const choices = markets.flatMap((market) => market.choices)
  const homeFavourite = chances.home >= chances.away
  const goals = jointProbability(model, choices.filter((choice) => choice.label === 'Más de 2.5').map((choice) => choice.leg)) > 0.5
  const presets: [string, string[]][] = [
    ['Combo Dominio Local', [homeFavourite ? 'Local' : '1X', 'Más de 1.5']],
    ['Combo Partido Abierto', ['Sí', 'Más de 2.5']],
    ['Combo Cerrojo Táctico', goals ? [homeFavourite ? '1X' : 'X2', 'Menos de 3.5'] : ['Menos de 2.5', 'No']],
  ]
  return presets.flatMap(([name, labels]) => {
    const legs = choices.filter((choice) => labels.includes(choice.label)).map((choice) => choice.leg)
    const odd = legs.length === labels.length ? calculateCorrelatedOdd(legs, model) : null
    return odd ? [{ name, legs, odd, probability: Math.round(100 * jointProbability(model, legs)) }] : []
  })
}
