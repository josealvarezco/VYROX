import { useState } from 'react'
import type { ParlayLeg } from './types'

const same = (a: ParlayLeg, b: ParlayLeg) => a.match_id === b.match_id && a.market_selection === b.market_selection

// One pick per match, the newest: picks from one match are not independent, so their odds cannot be multiplied.
const merge = (legs: ParlayLeg[], picks: ParlayLeg[]) => [
  ...legs.filter((leg) => !picks.some((pick) => pick.match_id === leg.match_id)),
  ...picks,
]

// The simulated bet slip lives in memory only: it empties when the page reloads.
export function useBetSlip() {
  const [legs, setLegs] = useState<ParlayLeg[]>([])
  const [open, setOpen] = useState(false)

  const add = (picks: ParlayLeg[]) => {
    setLegs((current) => merge(current, picks))
    setOpen(true)
  }
  const remove = (matchId: number) => setLegs((current) => current.filter((leg) => leg.match_id !== matchId))
  const has = (pick: ParlayLeg) => legs.some((leg) => same(leg, pick))
  // A single pick only updates the slip; it opens for whole parlays, so tapping odds never covers the cards.
  const toggle = (pick: ParlayLeg) =>
    setLegs((current) => (current.some((leg) => same(leg, pick)) ? current.filter((leg) => !same(leg, pick)) : merge(current, [pick])))

  return { legs, open, setOpen, add, remove, has, toggle, clear: () => setLegs([]) }
}
