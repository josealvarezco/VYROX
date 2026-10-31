import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  betBuilderMarkets,
  calculateCorrelatedOdd,
  fitModel,
  getPresetBetBuilders,
  isCompatible,
  jointProbability,
  marketOdd,
  totalOdd,
} from './sameGameParlay.ts'
import type { SlipLeg } from './types.ts'

// A forecast of Millonarios 50 / 26 / 24 against Nacional, 55 % for more than 2.5 goals, priced like the backend.
const CHANCES = { home: 50, draw: 26, away: 24 }
const ODDS = { home: 1.88, draw: 3.45, away: 3.71, over_2_5: 1.74, under_2_5: 2.04, btts_yes: 1.82, btts_no: 1.94 }
const BASE = { match_id: 7, home_team: 'Millonarios', away_team: 'Nacional', kickoff_label: '31/10 20:00' }
const MODEL = fitModel(50, 24, 55)
const MARKETS = betBuilderMarkets(BASE, CHANCES, ODDS, MODEL)

function legs(...labels: string[]) {
  return labels.map((label) => {
    const choice = MARKETS.flatMap((market) => market.choices).find((item) => item.label === label)
    assert.ok(choice, label)
    return choice.leg
  })
}
const product = (picks: SlipLeg[]) => picks.reduce((value, leg) => value * leg.odd, 1)
const correlated = (...labels: string[]) => calculateCorrelatedOdd(legs(...labels), MODEL)

test('the two-way odds are the backend prob_to_market_odd', () => {
  assert.deepEqual([75, 70, 60, 55, 50, 42].map(marketOdd), [1.35, 1.43, 1.62, 1.74, 1.88, 2.15])
})

test('the model gives back the forecast it was fitted to', () => {
  assert.ok(Math.abs(jointProbability(MODEL, legs('Más de 2.5')) - 0.55) < 0.005)
  const [home, away] = [jointProbability(MODEL, legs('Local')), jointProbability(MODEL, legs('Visitante'))]
  assert.ok(Math.abs(home / (home + away) - 50 / 74) < 0.005)
})

test('picks that share a market or that no score wins together do not fit', () => {
  assert.equal(isCompatible(legs('Local', 'Empate')), false)
  assert.equal(isCompatible(legs('Empate', 'No', 'Más de 1.5')), false) // only 0-0 is a draw without both scoring
  assert.equal(isCompatible(legs('Local', 'Sí', 'Menos de 2.5')), false) // that win is 2-1 at least
  assert.equal(correlated('Local', 'Sí', 'Menos de 2.5'), null)
  assert.equal(isCompatible(legs('Local', 'Sí', 'Más de 2.5')), true)
})

test('a pick the others already bring only trims the price', () => {
  const [bothScore] = legs('Sí')
  const withGoals = correlated('Sí', 'Más de 1.5') ?? 0
  assert.ok(withGoals <= bothScore.odd && withGoals >= 0.9 * bothScore.odd, `${withGoals}`)

  const win = correlated('Local', 'Sí') ?? 0
  const absorbed = (correlated('Local', 'Sí', 'Más de 2.5') ?? 0) / win
  assert.ok(absorbed > 0.9 && absorbed <= 1, `${absorbed}`)
})

test('picks that go together pay less than multiplied, and those that pull apart pay more', () => {
  const favourite = (correlated('Local', 'Más de 2.5') ?? 0) / product(legs('Local', 'Más de 2.5'))
  assert.ok(favourite > 0.8 && favourite < 0.9, `${favourite}`) // a 10 to 20 % correlation discount
  assert.ok((correlated('Empate', 'Más de 2.5') ?? 0) > product(legs('Empate', 'Más de 2.5'))) // a draw with goals needs 2-2
})

test('three ready-made combos, after who is the favourite and whether goals are expected', () => {
  const names = (presets: ReturnType<typeof getPresetBetBuilders>) => presets.map((preset) => [preset.name, preset.legs.map((leg) => leg.market_selection)])
  assert.deepEqual(names(getPresetBetBuilders(MARKETS, CHANCES, MODEL)), [
    ['Combo Dominio Local', ['Millonarios - Resultado del partido', 'Más de 1.5 - Goles totales']],
    ['Combo Partido Abierto', ['Más de 2.5 - Goles totales', 'Sí - Ambos anotan']],
    ['Combo Cerrojo Táctico', ['1X (Millonarios o Empate) - Doble oportunidad', 'Menos de 3.5 - Goles totales']],
  ])

  const visitors = { home: 25, draw: 30, away: 45 }
  const closed = fitModel(25, 45, 40)
  const presets = getPresetBetBuilders(betBuilderMarkets(BASE, visitors, ODDS, closed), visitors, closed)
  assert.deepEqual(names(presets).map(([, selections]) => selections), [
    ['1X (Millonarios o Empate) - Doble oportunidad', 'Más de 1.5 - Goles totales'],
    ['Más de 2.5 - Goles totales', 'Sí - Ambos anotan'],
    ['Menos de 2.5 - Goles totales', 'No - Ambos anotan'],
  ])
  assert.ok(presets.every((preset) => preset.odd >= 1.01 && preset.probability > 0 && preset.probability < 100))
})

test("the slip prices a match's picks together when they bring its model, and multiplies the matches", () => {
  const sameMatch = legs('Local', 'Más de 2.5')
  const other: SlipLeg = { match_id: 8, home_team: 'Junior', away_team: 'Santa Fe', kickoff_label: '31/10 18:00', market_selection: 'Sí - Ambos anotan', market_category: 'btts', odd: 1.8 }

  assert.equal(totalOdd([...sameMatch, other]), Math.round((correlated('Local', 'Más de 2.5') ?? 0) * 1.8 * 100) / 100)
  const withoutModel = sameMatch.map((leg) => ({ ...leg, model: undefined }))
  assert.equal(totalOdd([...withoutModel, other]), Math.round(product(sameMatch) * 1.8 * 100) / 100)
})
