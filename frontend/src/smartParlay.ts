import type { SmartParlay } from './types'

// One-tap target odds of the Constructor Inteligente VYROX IA.
export const TARGETS = [
  [2, 'Duplicador'],
  [3, 'Segura'],
  [5, 'Media'],
  [10, 'Alta'],
  [20, 'Soñadora'],
] as const

export type Market = 'all' | '1x2' | 'goals' | 'btts'

// The slip nearest a target odd. The backend builds it from the day's cached forecast: no API-Football request.
export async function fetchSmartParlay(date: string, target: number, legs: number | null, market: Market, variant: number): Promise<SmartParlay> {
  const params = new URLSearchParams({ date, target_odd: String(target), market_filter: market, variant: String(variant) })
  if (legs) params.set('legs', String(legs)) // left out, VYROX IA picks how many
  const response = await fetch(`/api/parlays/builder?${params}`)
  if (!response.ok) throw new Error(response.statusText)
  return response.json()
}
