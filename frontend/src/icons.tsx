import { WORLD } from './leagues'

// VYROX icon set: flat, bold, rounded shapes in the brand palette, in place of text emojis.
type IconProps = { className?: string; label?: string }

// Decorative by default; a label makes the icon an image for screen readers.
const a11y = (label?: string) => (label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })

const FOREST = '#0D331E'
const CREAM = '#F7F5EB'
const RED = '#D93829'
const stroked = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

export function BallIcon({ own = false, className = 'size-4', label }: IconProps & { own?: boolean }) {
  const ink = own ? RED : FOREST // own goals in red
  return (
    <svg viewBox="0 0 20 20" className={`shrink-0 ${className}`} {...a11y(label)}>
      <circle cx="10" cy="10" r="8.5" fill={CREAM} stroke={ink} strokeWidth="1.5" />
      <path d="M10 6.8 13 9l-1.1 3.6H8.1L7 9Z" fill={ink} />
      <path d="M10 6.8V1.5M13 9l5.1-1.6M11.9 12.6l3.1 4.3M8.1 12.6 5 16.9M7 9 1.9 7.4" fill="none" stroke={ink} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

const CARD = { yellow: '#F4D56D', red: RED }

export function CardIcon({ variant, className = 'size-4', label }: IconProps & { variant: 'yellow' | 'red' | 'second-yellow' }) {
  const edge = { stroke: FOREST, strokeOpacity: 0.25 }
  return (
    <svg viewBox="0 0 20 20" className={`shrink-0 ${className}`} {...a11y(label)}>
      {variant === 'second-yellow' ? (
        <>
          <rect x="3" y="2.5" width="9" height="13" rx="2" fill={CARD.yellow} {...edge} />
          <rect x="8" y="4.5" width="9" height="13" rx="2" fill={CARD.red} {...edge} />
        </>
      ) : (
        <rect x="5.5" y="2.5" width="9" height="15" rx="2" fill={CARD[variant]} {...edge} />
      )}
    </svg>
  )
}

export function SubIcon({ className = 'size-4', label }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 ${className}`} {...a11y(label)}>
      <circle cx="10" cy="10" r="9" fill={FOREST} stroke={CREAM} strokeOpacity="0.3" strokeWidth="1" />
      <path d="M7.5 14V6M5 8.5 7.5 6 10 8.5" stroke="#22C55E" />
      <path d="M12.5 6v8M10 11.5l2.5 2.5 2.5-2.5" stroke="#EF4444" />
    </svg>
  )
}

export function WhistleIcon({ className = 'size-4', label }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={`shrink-0 ${className}`} {...a11y(label)}>
      <path
        fillRule="evenodd"
        d="M8 6.5h8.5A1.5 1.5 0 0 1 18 8v1a1.5 1.5 0 0 1-1.5 1.5h-3.3A5.5 5.5 0 1 1 8 6.5Zm0 3.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"
      />
    </svg>
  )
}

export function PitchIcon({ className = 'size-4', label }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" {...stroked} className={`shrink-0 ${className}`} {...a11y(label)}>
      <rect x="2" y="4" width="16" height="12" rx="2" />
      <path d="M10 4v12" />
      <circle cx="10" cy="10" r="2.5" />
    </svg>
  )
}

export function JerseyIcon({ className = 'size-4', label }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={`shrink-0 ${className}`} {...a11y(label)}>
      <path d="M7 2.5 4 4 1.5 7.5l2.5 2 1.5-1.2v9.2h9V8.3l1.5 1.2 2.5-2L16 4l-3-1.5c-.4 1.2-1.6 2-3 2s-2.6-.8-3-2Z" />
    </svg>
  )
}

export function StopwatchIcon({ className = 'size-4', label }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" {...stroked} className={`shrink-0 ${className}`} {...a11y(label)}>
      <circle cx="10" cy="11" r="6.5" />
      <path d="M10 11V7.5M8 2h4M10 2v2.5M15.5 5.5l-1.1 1.1" />
    </svg>
  )
}

export function CalendarIcon({ className = 'size-4', label }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" {...stroked} className={`shrink-0 ${className}`} {...a11y(label)}>
      <rect x="3" y="4.5" width="14" height="12.5" rx="2.5" />
      <path d="M3 8.5h14M7 2.5V6M13 2.5V6" />
    </svg>
  )
}

export function StarIcon({ filled = false, className = 'size-4', label }: IconProps & { filled?: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
      {...a11y(label)}
    >
      <path d="M10 2.5l2.3 4.7 5.2.8-3.8 3.6.9 5.2L10 14.4l-4.6 2.4.9-5.2-3.8-3.6 5.2-.8Z" />
    </svg>
  )
}

export function SparklesIcon({ className = 'size-4', label }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={`shrink-0 ${className}`} {...a11y(label)}>
      <path d="M8 3.5Q8 10 14.5 10 8 10 8 16.5 8 10 1.5 10 8 10 8 3.5Z" />
      <path d="M15 1.5Q15 4.5 18 4.5 15 4.5 15 7.5 15 4.5 12 4.5 15 4.5 15 1.5Z" />
    </svg>
  )
}

export function TrendUpIcon({ className = 'size-4', label }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" {...stroked} strokeWidth={2} className={`shrink-0 ${className}`} {...a11y(label)}>
      <path d="M2.5 14.5 8 9l3.5 3.5 6-6M13 6.5h4.5V11" />
    </svg>
  )
}

export function CheckIcon({ className = 'size-4', label }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" {...stroked} strokeWidth={2.25} className={`shrink-0 ${className}`} {...a11y(label)}>
      <path d="m4.5 10.5 3.5 3.5 7.5-8" />
    </svg>
  )
}

export function CrossIcon({ className = 'size-4', label }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" {...stroked} strokeWidth={2.25} className={`shrink-0 ${className}`} {...a11y(label)}>
      <path d="m5.5 5.5 9 9m0-9-9 9" />
    </svg>
  )
}

function GlobeIcon({ className = 'size-4', label }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" {...stroked} strokeWidth={1.5} className={`shrink-0 ${className}`} {...a11y(label)}>
      <circle cx="10" cy="10" r="7.5" />
      <path d="M2.5 10h15M10 2.5c2.1 2.2 3.1 4.7 3.1 7.5s-1 5.3-3.1 7.5c-2.1-2.2-3.1-4.7-3.1-7.5s1-5.3 3.1-7.5Z" />
    </svg>
  )
}

export function Flag({ country, flag }: { country: string; flag: string | null }) {
  if (country === WORLD || !flag) return <GlobeIcon className="size-5 text-muted" />
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
