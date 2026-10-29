import { useEffect, useState } from 'react'
import type { SlipLeg } from './types'

const KEY = 'vyrox:bet-slip'
const BANK_KEY = 'vyrox_user_bank'

// One item per match and market: another side of the same market replaces it, other markets add up.
export const slipKey = (leg: SlipLeg) => `${leg.match_id}:${leg.market_category}`

// The exact pick: the parlays and the Match Center can price one market differently.
const same = (a: SlipLeg, b: SlipLeg) => slipKey(a) === slipKey(b) && a.market_selection === b.market_selection && a.odd === b.odd

// Whether a pick wins with a final score. The recommended play is free text, so it never combines.
function wins(leg: SlipLeg, home: number, away: number) {
  const side = leg.market_selection.slice(0, leg.market_selection.lastIndexOf(' - '))
  if (leg.market_category === 'result') return side === 'Empate' ? home === away : side === leg.home_team ? home > away : away > home
  if (leg.market_category === 'goals') return side.startsWith('Más') ? home + away > 2.5 : home + away < 2.5
  if (leg.market_category === 'over_1_5') return home + away > 1.5
  if (leg.market_category === 'btts') return (side === 'Sí') === (home > 0 && away > 0)
  return false
}

const SCORES = Array.from({ length: 121 }, (_, i) => [Math.floor(i / 11), i % 11])
// Picks of one match can share the slip only if some final score up to 10-10 wins them all.
const compatible = (legs: SlipLeg[]) => legs.length < 2 || SCORES.some(([home, away]) => legs.every((leg) => wins(leg, home, away)))

// A pick that can never win with the rest of its match (Empate + Más de 2.5 + "No" ambos anotan) replaces them all.
const merge = (legs: SlipLeg[], picks: SlipLeg[]) =>
  picks.reduce((current, pick) => {
    const others = current.filter((leg) => slipKey(leg) !== slipKey(pick))
    const rest = others.filter((leg) => leg.match_id === pick.match_id)
    return [...(compatible([...rest, pick]) ? others : others.filter((leg) => leg.match_id !== pick.match_id)), pick]
  }, legs)

// Same rounding as the backend's total_odd.
export const totalOdd = (legs: SlipLeg[]) => Math.round(legs.reduce((product, leg) => product * leg.odd, 1) * 100) / 100

function stored(): SlipLeg[] {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    // The slip renders every one of these fields, so a corrupted or edited value must not reach it.
    return Array.isArray(value)
      ? value.filter(
          (leg) =>
            typeof leg?.match_id === 'number' &&
            typeof leg.odd === 'number' &&
            leg.odd > 0 &&
            ['home_team', 'away_team', 'kickoff_label', 'market_selection', 'market_category'].every(
              (field) => typeof leg[field] === 'string',
            ),
        )
      : []
  } catch {
    return [] // storage blocked or a corrupted value
  }
}

function storedBank() {
  try {
    const value = Number(localStorage.getItem(BANK_KEY))
    return value > 0 ? value : 0
  } catch {
    return 0
  }
}

const save = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value)
  } catch {
    // storage blocked: the slip still works until the page reloads
  }
}

// The simulated bet slip and the user's bank live only in this browser, like the followed teams.
export function useBetSlip() {
  const [legs, setLegs] = useState<SlipLeg[]>(stored)
  const [open, setOpen] = useState(false)
  const [bank, setBank] = useState(storedBank)

  useEffect(() => save(KEY, JSON.stringify(legs)), [legs])
  useEffect(() => save(BANK_KEY, String(bank)), [bank])

  const add = (picks: SlipLeg[]) => {
    setLegs((current) => merge(current, picks))
    setOpen(true)
  }
  const remove = (pick: SlipLeg) => setLegs((current) => current.filter((leg) => slipKey(leg) !== slipKey(pick)))
  const has = (pick: SlipLeg) => legs.some((leg) => same(leg, pick))
  // A single pick only updates the slip; it opens for whole parlays, so tapping odds never covers the cards.
  const toggle = (pick: SlipLeg) =>
    setLegs((current) => (current.some((leg) => same(leg, pick)) ? current.filter((leg) => !same(leg, pick)) : merge(current, [pick])))

  return { legs, open, setOpen, add, remove, has, toggle, clear: () => setLegs([]), bank, setBank }
}
