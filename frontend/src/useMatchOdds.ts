import { useState } from 'react'
import type { MatchOdds } from './types'

// One match's bookmaker odds, asked only when its "Cuotas" tab opens: each request spends API-Football quota.
export function useMatchOdds(matchId: number, onOdds: (matchId: number, odds: MatchOdds) => void) {
  const [odds, setOdds] = useState<MatchOdds | null>(null)
  const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle')

  const load = () => {
    if (odds || state === 'loading') return
    setState('loading')
    fetch(`/api/matches/${matchId}/odds`)
      .then((response) => {
        if (!response.ok) throw new Error(response.statusText)
        return response.json()
      })
      .then((body: MatchOdds) => {
        setOdds(body)
        setState('idle')
        onOdds(matchId, body) // the bet slip compares the houses with them
      })
      .catch(() => setState('error'))
  }

  return { odds, state, load }
}
