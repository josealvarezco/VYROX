import { useEffect, useRef, useState } from 'react'
import type { ForecastPick, ForecastsResponse } from './types'

// Cheap: the backend answers from the day's cached VYROX IA forecast and drops the matches that kicked off.
const REFRESH_MS = 300_000

// VYROX IA's forecast of the date's matches (up to 12, top leagues first): what the comparator compares.
export function useForecasts(date: string) {
  const [forecasts, setForecasts] = useState<ForecastsResponse | null>(null)
  const seen = useRef(new Map<string, ForecastPick>()) // each pick as last seen this visit

  useEffect(() => {
    let current = true // drop answers for a date the user already left
    const load = () =>
      fetch(`/api/forecasts?date=${date}`)
        .then((response) => (response.ok ? response.json() : null))
        .then((body: ForecastsResponse | null) => {
          if (!current) return
          // A pick's corner shows its last move this visit: up or down only once VYROX IA's price for it changed.
          body?.matches.forEach((match) =>
            Object.entries(match.picks).forEach(([key, pick]) => {
              const before = seen.current.get(`${match.match_id}:${key}`)
              pick.trend = before?.odd && pick.odd && pick.odd !== before.odd ? (pick.odd > before.odd ? 'up' : 'down') : before?.trend
              seen.current.set(`${match.match_id}:${key}`, pick)
            }),
          )
          setForecasts(body)
        })
        .catch(() => current && setForecasts(null))
    load()
    const id = setInterval(load, REFRESH_MS)
    return () => {
      current = false
      clearInterval(id)
    }
  }, [date])

  return forecasts
}
