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

// "DD/MM HH:mm" in Colombia, the label the backend gives parlay legs.
export function kickoffLabel(match: Match) {
  return new Date(match.utcDate)
    .toLocaleString('es-CO', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: 'America/Bogota' })
    .replace(',', '')
}

export function statusText(match: Match) {
  return STATUS_LABEL[match.status] ?? kickoffTime(match)
}
