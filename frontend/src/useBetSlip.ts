import { useEffect, useState } from 'react'
import type { SlipLeg } from './types'

const KEY = 'vyrox:bet-slip'

// The exact pick: the parlays and the Match Center can price one market differently.
const same = (a: SlipLeg, b: SlipLeg) => a.match_id === b.match_id && a.market_selection === b.market_selection && a.odd === b.odd

// One pick per match, the newest: picks from one match are not independent, so their odds cannot be multiplied.
const merge = (legs: SlipLeg[], picks: SlipLeg[]) => [
  ...legs.filter((leg) => !picks.some((pick) => pick.match_id === leg.match_id)),
  ...picks,
]

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
            ['home_team', 'away_team', 'kickoff_label', 'market_selection'].every((field) => typeof leg[field] === 'string'),
        )
      : []
  } catch {
    return [] // storage blocked or a corrupted value
  }
}

// The simulated bet slip lives only in this browser, like the followed teams.
export function useBetSlip() {
  const [legs, setLegs] = useState<SlipLeg[]>(stored)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(legs))
    } catch {
      // storage blocked: the slip still works until the page reloads
    }
  }, [legs])

  const add = (picks: SlipLeg[]) => {
    setLegs((current) => merge(current, picks))
    setOpen(true)
  }
  const remove = (matchId: number) => setLegs((current) => current.filter((leg) => leg.match_id !== matchId))
  const has = (pick: SlipLeg) => legs.some((leg) => same(leg, pick))
  // A single pick only updates the slip; it opens for whole parlays, so tapping odds never covers the cards.
  const toggle = (pick: SlipLeg) =>
    setLegs((current) => (current.some((leg) => same(leg, pick)) ? current.filter((leg) => !same(leg, pick)) : merge(current, [pick])))

  return { legs, open, setOpen, add, remove, has, toggle, clear: () => setLegs([]) }
}
