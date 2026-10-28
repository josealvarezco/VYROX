import { useRef, useState } from 'react'
import type { Match, Prediction } from './types'

export function usePrediction(match: Match, league: string) {
  const [prediction, setPrediction] = useState<Prediction | null>(null)
  const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle')
  // A ref, not state: two quick calls must not ask Gemini twice for the same match.
  const requested = useRef(false)

  const load = () => {
    if (requested.current) return
    requested.current = true
    setState('loading')
    fetch('/api/predictions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        match_id: match.id,
        home_team: match.homeTeam.shortName,
        away_team: match.awayTeam.shortName,
        league,
        date: match.utcDate,
        status: match.status,
        score: match.score.fullTime,
      }),
    })
      .then((response) => {
        if (!response.ok) throw new Error(response.statusText)
        return response.json()
      })
      .then((body: Prediction) => {
        setPrediction(body)
        setState('idle')
      })
      .catch(() => {
        requested.current = false // let the next attempt try again
        setState('error')
      })
  }

  return { prediction, state, load }
}
