import { useCallback, useEffect, useRef, useState } from 'react'
import { newGoals, type GoalAlert, type Score } from './goals'
import type { Match } from './types'

const KEY = 'vyrox_goal_alert_mode'
const TOAST_MS = 7000
const GLOW_MS = 8000
const MAX_TOASTS = 3

// Which goals get a toast, a glowing row and the goal sound: the option in the menu and the short label on the bell.
export const ALERT_MODES = {
  all: { name: 'Todos los partidos', short: 'Todos' },
  my_parlays: { name: 'Solo mis parlays', short: 'Mis parlays' },
  off: { name: 'Silenciadas', short: 'Silenciadas' },
}
export type AlertMode = keyof typeof ALERT_MODES

function storedMode(): AlertMode {
  try {
    const value = localStorage.getItem(KEY) ?? ''
    return Object.hasOwn(ALERT_MODES, value) ? (value as AlertMode) : 'all'
  } catch {
    return 'all' // storage blocked: every goal alerts
  }
}

// Goal alerts for live matches, read from the lists the page already polls: no extra request. `mine` holds the
// matches of the user's slip and open plays, the only ones that alert in "my_parlays" mode.
export function useGoalAlerts(mine: Set<number>) {
  const [mode, setModeState] = useState(storedMode)
  const [alerts, setAlerts] = useState<GoalAlert[]>([])
  const [glow, setGlow] = useState<Record<number, string>>({}) // match id -> key of its latest goal
  const seen = useRef<Record<number, Score>>({})
  const latest = useRef({ mode, mine }) // read by the stable check below
  useEffect(() => {
    latest.current = { mode, mine }
  })

  const dismiss = useCallback((key: string) => setAlerts((current) => current.filter((alert) => alert.key !== key)), [])

  // Stable, so the page's loading effect can call it with every list without refetching.
  const check = useCallback(
    (matches: Match[]) => {
      const now = latest.current
      // Every list moves the baseline, muted or not, so a goal scored meanwhile never alerts later.
      const goals = newGoals(seen.current, matches).filter(
        (goal) => now.mode === 'all' || (now.mode === 'my_parlays' && now.mine.has(goal.matchId)),
      )
      if (!goals.length) return
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

  const setMode = (next: AlertMode) => {
    setModeState(next)
    if (next === 'off') {
      setAlerts([])
      setGlow({})
    }
    try {
      localStorage.setItem(KEY, next)
    } catch {
      // storage blocked: the choice lasts until the page reloads
    }
  }

  return {
    mode,
    setMode,
    alerts,
    dismiss,
    check,
    glowing: (matchId: number) => matchId in glow,
    // Another date: its scores are a new baseline, never goals scored while it was not on screen.
    reset: () => {
      seen.current = {}
    },
  }
}
