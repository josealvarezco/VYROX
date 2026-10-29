import { useEffect, useRef } from 'react'
import type { GoalAlert } from './goals'
import { BallIcon, CrossIcon, StarIcon, TicketSlipIcon } from './icons'
import type { SavedTicket } from './types'

const NOTES = [523.25, 659.25, 783.99, 1046.5] // C5 E5 G5 C6: a rising major arpeggio
let audio: AudioContext | null = null // one context for the whole page; browsers cap how many can be open

// A short goal fanfare synthesized with the Web Audio API, so there is no sound file to download. Browsers only let
// a page play sound after the user has interacted with it once; until then the alert stays silent.
function playGoal() {
  try {
    const context = (audio ??= new AudioContext())
    void context.resume() // a context created before any click starts suspended
    NOTES.forEach((frequency, index) => {
      const at = context.currentTime + index * 0.11
      const end = at + (index === NOTES.length - 1 ? 0.7 : 0.18)
      const tone = context.createOscillator()
      const volume = context.createGain()
      tone.type = 'triangle'
      tone.frequency.value = frequency
      volume.gain.setValueAtTime(0.0001, at)
      volume.gain.exponentialRampToValueAtTime(0.3, at + 0.02)
      volume.gain.exponentialRampToValueAtTime(0.0001, end)
      tone.connect(volume).connect(context.destination)
      tone.start(at)
      tone.stop(end + 0.05)
    })
  } catch {
    // no Web Audio in this browser: the alert still shows
  }
}

// Goal alerts in the top right corner, the newest last. A popover lives in the top layer: shown again on every
// change, it stays above an open Match Center, a modal dialog that no z-index can cover.
export function GoalToasts({
  alerts,
  tickets,
  onOpen,
  onDismiss,
  isFollowed,
}: {
  alerts: GoalAlert[]
  tickets: SavedTicket[]
  onOpen: (matchId: number) => void
  onDismiss: (key: string) => void
  isFollowed: (teamId: number) => boolean
}) {
  const stack = useRef<HTMLDivElement>(null)
  const sounded = useRef(new Set<string>())

  useEffect(() => {
    const element = stack.current
    if (!element?.showPopover) return // browsers without popovers keep the stack in the page
    if (element.matches(':popover-open')) element.hidePopover()
    if (alerts.length) element.showPopover()
  }, [alerts])

  // A goal in a match of the user's plays sounds once. Any play counts, so the goal that just settled one does too;
  // muted alerts never reach this list.
  useEffect(() => {
    const fresh = alerts.filter((alert) => !sounded.current.has(alert.key))
    fresh.forEach((alert) => sounded.current.add(alert.key))
    const played = new Set(tickets.flatMap((ticket) => ticket.legs.map((leg) => leg.match_id)))
    if (fresh.some((alert) => played.has(alert.matchId))) playGoal()
  }, [alerts, tickets])

  return (
    <div
      ref={stack}
      popover="manual"
      aria-live="polite"
      className="inset-auto top-4 right-4 z-[70] m-0 w-80 max-w-[calc(100vw-2rem)] space-y-2 overflow-visible border-0 bg-transparent p-0"
    >
      {alerts.map((alert) => {
        const picks = [
          ...new Set(tickets.flatMap((ticket) => ticket.legs).filter((leg) => leg.match_id === alert.matchId).map((leg) => leg.market_selection)),
        ]
        return (
          <div
            key={alert.key}
            className={`flex animate-tab-in items-center gap-2 rounded-2xl bg-forest p-3 text-cream shadow-2xl ${
              picks.length ? 'border-2 border-yellow ring-4 ring-orange/50' : 'border border-yellow/60 ring-2 ring-orange/40'
            }`}
          >
            <button
              type="button"
              onClick={() => {
                onOpen(alert.matchId)
                onDismiss(alert.key)
              }}
              className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-left"
            >
              <BallIcon className="size-7" />
              <span className="min-w-0">
                {picks.length > 0 && (
                  <span className="mb-1 inline-flex items-center gap-1 rounded-full bg-orange px-1.5 py-px text-[10px] font-extrabold tracking-wide text-forest">
                    <TicketSlipIcon className="size-3" />
                    EN TUS JUGADAS
                  </span>
                )}
                <span className="block truncate font-extrabold tracking-tight text-yellow">¡GOL DE {alert.team.toUpperCase()}!</span>
                <span className="flex flex-wrap items-center gap-x-2 text-sm">
                  <span className="font-num font-bold">
                    {alert.score}
                    {alert.minute ? ` · ${alert.minute}'` : ''}
                  </span>
                  {isFollowed(alert.teamId) && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-yellow px-1.5 text-[10px] font-bold text-forest">
                      <StarIcon filled className="size-3" />
                      SIGUIENDO
                    </span>
                  )}
                </span>
                {picks.length > 0 && <span className="mt-0.5 block truncate text-xs text-cream/80">Llevas: {picks.join(' · ')}</span>}
              </span>
            </button>
            <button
              type="button"
              onClick={() => onDismiss(alert.key)}
              aria-label="Cerrar alerta de gol"
              className="grid size-7 shrink-0 cursor-pointer place-items-center rounded-full text-cream/70 transition-all duration-200 ease-out hover:bg-cream/10 hover:text-cream"
            >
              <CrossIcon className="size-3.5" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
