import { WORLD } from './leagues'

export function Flag({ country, flag }: { country: string; flag: string | null }) {
  if (country === WORLD || !flag)
    return (
      <span aria-hidden="true" className="grid size-5 shrink-0 place-items-center text-sm">
        🌐
      </span>
    )
  return <img src={flag} alt="" className="size-5 shrink-0 rounded-full object-cover ring-1 ring-white/10" />
}

const ROTATION = { down: '', up: 'rotate-180', left: 'rotate-90', right: '-rotate-90' } as const

export function Chevron({ direction = 'down', className = '' }: { direction?: keyof typeof ROTATION; className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className={`size-4 shrink-0 ${ROTATION[direction]} ${className}`}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
      />
    </svg>
  )
}

export function FilterIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="size-4 shrink-0 text-neutral-400">
      <path d="M3 4.75A.75.75 0 0 1 3.75 4h12.5a.75.75 0 0 1 .53 1.28L12 10.06v4.19a.75.75 0 0 1-.33.62l-2.5 1.67A.75.75 0 0 1 8 15.92v-5.86L3.22 5.28A.75.75 0 0 1 3 4.75Z" />
    </svg>
  )
}
