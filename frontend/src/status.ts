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

export function statusText(match: Match) {
  return (
    STATUS_LABEL[match.status] ??
    new Date(match.utcDate).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
  )
}
