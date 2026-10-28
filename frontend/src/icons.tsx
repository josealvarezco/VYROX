import { WORLD } from './leagues'

export function Flag({ country, flag }: { country: string; flag: string | null }) {
  if (country === WORLD || !flag)
    return (
      <span aria-hidden="true" className="grid size-5 shrink-0 place-items-center text-sm">
        🌐
      </span>
    )
  return <img src={flag} alt="" className="size-5 shrink-0 rounded-full object-cover ring-1 ring-line" />
}

const ROTATION = { down: '', up: 'rotate-180', left: 'rotate-90', right: '-rotate-90' } as const

export function Chevron({ direction = 'down', className = '' }: { direction?: keyof typeof ROTATION; className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className={`size-4 shrink-0 transition-transform duration-200 ease-out ${ROTATION[direction]} ${className}`}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
      />
    </svg>
  )
}

export function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" className="size-4">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  )
}

export function MoonIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-4"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

export function FilterIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="size-4 shrink-0 text-muted">
      <path d="M3 4.75A.75.75 0 0 1 3.75 4h12.5a.75.75 0 0 1 .53 1.28L12 10.06v4.19a.75.75 0 0 1-.33.62l-2.5 1.67A.75.75 0 0 1 8 15.92v-5.86L3.22 5.28A.75.75 0 0 1 3 4.75Z" />
    </svg>
  )
}
