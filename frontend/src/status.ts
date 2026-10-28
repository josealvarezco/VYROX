import type { Match } from './types'

export const LIVE = new Set(['IN_PLAY', 'PAUSED'])
const STATUS_LABEL: Record<string, string> = {
  IN_PLAY: 'En vivo',
  PAUSED: 'Descanso',
  FINISHED: 'Final',
  POSTPONED: 'Aplazado',
  SUSPENDED: 'Suspendido',
  CANCELLED: 'Cancelado',
  AWARDED: 'Adjudicado',
}

export function kickoffTime(match: Match) {
  return new Date(match.utcDate).toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit', timeZone: 'America/Bogota' })
}

export function statusText(match: Match) {
  return STATUS_LABEL[match.status] ?? kickoffTime(match)
}
