import { useEffect, useState } from 'react'
import type { ForecastsResponse } from './types'

// Cheap: the backend answers from the day's cached VYROX IA forecast and drops the matches that kicked off.
const REFRESH_MS = 300_000

// VYROX IA's forecast of the date's matches (up to 12, top leagues first): what the comparator compares.
export function useForecasts(date: string) {
  const [forecasts, setForecasts] = useState<ForecastsResponse | null>(null)

  useEffect(() => {
    let current = true // drop answers for a date the user already left
    const load = () =>
      fetch(`/api/forecasts?date=${date}`)
        .then((response) => (response.ok ? response.json() : null))
        .then((body: ForecastsResponse | null) => current && setForecasts(body))
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
