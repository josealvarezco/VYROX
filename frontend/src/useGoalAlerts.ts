import { useCallback, useRef, useState } from 'react'
import { newGoals, type GoalAlert, type Score } from './goals'
import { LIVE } from './status'
import type { Match } from './types'

const KEY = 'vyrox_goal_alerts'
const TOAST_MS = 7000
const GLOW_MS = 8000
const MAX_TOASTS = 3

function storedOn() {
  try {
    return localStorage.getItem(KEY) !== 'off'
  } catch {
    return true // storage blocked: alerts on
  }
}

// Visual goal alerts for live matches, read from the lists the page already polls: no extra request.
export function useGoalAlerts() {
  const [on, setOn] = useState(storedOn)
  const [alerts, setAlerts] = useState<GoalAlert[]>([])
  const [glow, setGlow] = useState<Record<number, string>>({}) // match id -> key of its latest goal
  const seen = useRef<Record<number, Score>>({})
  const enabled = useRef(on) // read by the stable check below

  const dismiss = useCallback((key: string) => setAlerts((current) => current.filter((alert) => alert.key !== key)), [])

  // Stable, so the page's loading effect can call it with every list without refetching.
  const check = useCallback(
    (matches: Match[]) => {
      const goals = newGoals(seen.current, matches)
      if (!enabled.current || !goals.length) return
      setAlerts((current) => [...current, ...goals].slice(-MAX_TOASTS))
      setGlow((current) => ({ ...current, ...Object.fromEntries(goals.map((goal) => [goal.matchId, goal.key])) }))
      for (const goal of goals) {
        setTimeout(() => dismiss(goal.key), TOAST_MS)
        // Only the match's latest goal clears its glow, so a second goal keeps its own 8 seconds.
        setTimeout(
          () =>
            setGlow((current) =>
              current[goal.matchId] === goal.key
                ? Object.fromEntries(Object.entries(current).filter(([id]) => Number(id) !== goal.matchId))
                : current,
            ),
          GLOW_MS,
        )
      }
    },
    [dismiss],
  )

  const toggle = () => {
    enabled.current = !on
    setOn(!on)
    if (on) {
      setAlerts([])
      setGlow({})
    }
    try {
      localStorage.setItem(KEY, on ? 'off' : 'on')
    } catch {
      // storage blocked: the choice lasts until the page reloads
    }
  }

  return {
    on,
    toggle,
    alerts,
    dismiss,
    check,
    glowing: (matchId: number) => matchId in glow,
    // Development only: the list again with one more home goal than last seen in a live match (or the first one).
    simulate: (matches: Match[]) => {
      const target = matches.find((match) => LIVE.has(match.status)) ?? matches[0]
      if (!target) return
      const last = seen.current[target.id] ?? { home: 0, away: 0 }
      const scored = { status: LIVE.has(target.status) ? target.status : 'IN_PLAY', score: { ...target.score, fullTime: { ...last, home: last.home + 1 } } }
      check(matches.map((match) => (match === target ? { ...match, ...scored } : match)))
    },
    // Another date: its scores are a new baseline, never goals scored while it was not on screen.
    reset: () => {
      seen.current = {}
    },
  }
}
