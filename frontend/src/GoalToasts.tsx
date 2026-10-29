import { useEffect, useRef } from 'react'
import type { GoalAlert } from './goals'
import { BallIcon, CrossIcon, StarIcon } from './icons'

// Goal alerts in the top right corner, the newest last. A popover lives in the top layer: shown again on every
// change, it stays above an open Match Center, a modal dialog that no z-index can cover.
export function GoalToasts({
  alerts,
  onOpen,
  onDismiss,
  isFollowed,
}: {
  alerts: GoalAlert[]
  onOpen: (matchId: number) => void
  onDismiss: (key: string) => void
  isFollowed: (teamId: number) => boolean
}) {
  const stack = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = stack.current
    if (!element?.showPopover) return // browsers without popovers keep the stack in the page
    if (element.matches(':popover-open')) element.hidePopover()
    if (alerts.length) element.showPopover()
  }, [alerts])

  return (
    <div
      ref={stack}
      popover="manual"
      aria-live="polite"
      className="inset-auto top-4 right-4 z-[70] m-0 w-80 max-w-[calc(100vw-2rem)] space-y-2 overflow-visible border-0 bg-transparent p-0"
    >
      {alerts.map((alert) => (
        <div
          key={alert.key}
          className="flex animate-tab-in items-center gap-2 rounded-2xl border border-yellow/60 bg-forest p-3 text-cream shadow-2xl ring-2 ring-orange/40"
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
      ))}
    </div>
  )
}
