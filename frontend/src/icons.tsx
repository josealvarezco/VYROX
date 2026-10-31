import { WORLD } from './leagues'

// VYROX icon set: flat, bold, rounded shapes in the brand palette, in place of text emojis.
type IconProps = { className?: string; label?: string }

// Decorative by default; a label makes the icon an image for screen readers.
const a11y = (label?: string) => (label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })

const FOREST = '#0D331E'
const CREAM = '#F7F5EB'
const RED = '#D93829'
const ORANGE = '#EE761B'
const YELLOW = '#F4D56D'
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

const CARD = { yellow: YELLOW, red: RED }

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

// Concentric rings, a sweep and a blip: VYROX IA scanning the day's markets.
export function RadarIcon({ className = 'size-4', label }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" {...stroked} className={`shrink-0 ${className}`} {...a11y(label)}>
      <circle cx="10" cy="10" r="7.75" />
      <circle cx="10" cy="10" r="4.25" />
      <path d="M10 10 15.5 4.5" />
      <circle cx="13.25" cy="12.75" r="1.5" fill="currentColor" stroke="none" />
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

export function FlameIcon({ className = 'size-4', label }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" className={`shrink-0 ${className}`} {...a11y(label)}>
      <path
        fill={ORANGE}
        d="M10 1.5c.6 2.6 2.4 4 3.8 5.6 1.5 1.7 2.7 3.5 2.7 5.9a6.5 6.5 0 0 1-13 0c0-2.3 1-4.1 2.4-5.4.2 1.3.8 2.3 1.8 2.9C7.3 7.6 8.2 4.2 10 1.5Z"
      />
      <path fill={YELLOW} d="M10 9.5c.3 1.3 1.2 2 1.9 2.8.7.8 1.1 1.6 1.1 2.7a3 3 0 0 1-6 0c0-1 .4-1.8 1-2.4.2.6.5 1 1 1.3-.2-1.6.2-3.2 1-4.4Z" />
    </svg>
  )
}

export function DoubleChevronUpIcon({ className = 'size-4', label }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" {...stroked} strokeWidth={2} className={`shrink-0 ${className}`} {...a11y(label)}>
      <path d="m5 10 5-5 5 5M5 15.5l5-5 5 5" />
    </svg>
  )
}

export function DoubleChevronRightIcon({ className = 'size-4', label }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" {...stroked} strokeWidth={2} className={`shrink-0 ${className}`} {...a11y(label)}>
      <path d="m4.5 5 5 5-5 5M10.5 5l5 5-5 5" />
    </svg>
  )
}

export function TicketSlipIcon({ className = 'size-4', label }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" {...stroked} strokeWidth={1.5} className={`shrink-0 ${className}`} {...a11y(label)}>
      <path d="M3 4.5A1.5 1.5 0 0 1 4.5 3h11A1.5 1.5 0 0 1 17 4.5V8a2 2 0 0 0 0 4v3.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 3 15.5V12a2 2 0 0 0 0-4Z" />
      <path d="M7.5 7h5M7.5 10h5M7.5 13h3" />
    </svg>
  )
}

export function TrashIcon({ className = 'size-4', label }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" {...stroked} className={`shrink-0 ${className}`} {...a11y(label)}>
      <path d="M3.5 5.5h13M8 5.5v-2h4v2M5 5.5l.8 11h8.4l.8-11M8.5 9v4.5M11.5 9v4.5" />
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

export function ShareIcon({ className = 'size-4', label }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" {...stroked} className={`shrink-0 ${className}`} {...a11y(label)}>
      <circle cx="14.5" cy="4.75" r="2.25" />
      <circle cx="5.5" cy="10" r="2.25" />
      <circle cx="14.5" cy="15.25" r="2.25" />
      <path d="m7.5 8.9 5-2.9m-5 5.1 5 2.9" />
    </svg>
  )
}

export function DownloadIcon({ className = 'size-4', label }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" {...stroked} strokeWidth={2} className={`shrink-0 ${className}`} {...a11y(label)}>
      <path d="M10 3v9.5m-4-4 4 4 4-4M4 15.5v1h12v-1" />
    </svg>
  )
}

export function CopyIcon({ className = 'size-4', label }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" {...stroked} className={`shrink-0 ${className}`} {...a11y(label)}>
      <rect x="7" y="7" width="9.5" height="9.5" rx="2" />
      <path d="M13 4.5V4a1.5 1.5 0 0 0-1.5-1.5h-7A1.5 1.5 0 0 0 3 4v7a1.5 1.5 0 0 0 1.5 1.5H5" />
    </svg>
  )
}

// A bell ringing with alert waves; crossed out while the alerts are muted.
export function BellRingIcon({ muted = false, className = 'size-4', label }: IconProps & { muted?: boolean }) {
  return (
    <svg viewBox="0 0 20 20" {...stroked} className={`shrink-0 ${className}`} {...a11y(label)}>
      <path d="M5.5 13.5V9a4.5 4.5 0 0 1 9 0v4.5l1.25 1.5H4.25Z" />
      <path d="M8.5 17.25h3" />
      {muted ? <path d="m3 3 14 14" /> : <path d="M2.75 7.75a7.5 7.5 0 0 1 2-4.25m12.5 4.25a7.5 7.5 0 0 0-2-4.25" />}
    </svg>
  )
}

// A magic wand with sparkles: the smart parlay builder.
export function WandSparklesIcon({ className = 'size-4', label }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" {...stroked} className={`shrink-0 ${className}`} {...a11y(label)}>
      <path d="m3.5 16.5 8.5-8.5m-1.5-1.5 3 3" />
      <path d="M14.5 2v3M13 3.5h3M17 9v2m-1-1h2M8 2.5v2m-1-1h2" />
    </svg>
  )
}

// Two arrows chasing each other round: another combination.
export function RefreshIcon({ className = 'size-4', label }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" {...stroked} className={`shrink-0 ${className}`} {...a11y(label)}>
      <path d="M3.5 10a6.5 6.5 0 0 1 11.5-4M15 2.5V6h-3.5M16.5 10a6.5 6.5 0 0 1-11.5 4M5 17.5V14h3.5" />
    </svg>
  )
}

// A line chart rising through its points: the bankroll's evolution.
export function ChartLineUpIcon({ className = 'size-4', label }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" {...stroked} className={`shrink-0 ${className}`} {...a11y(label)}>
      <path d="M3 3v14h14M6 13l3.5-3.5 2.5 2 4-5" />
      <g fill="currentColor" stroke="none">
        <circle cx="6" cy="13" r="1.4" />
        <circle cx="9.5" cy="9.5" r="1.4" />
        <circle cx="12" cy="11.5" r="1.4" />
        <circle cx="16" cy="6.5" r="1.4" />
      </g>
    </svg>
  )
}

// A rosette with two ribbons: the user's best market and records.
export function AwardBadgeIcon({ className = 'size-4', label }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" {...stroked} className={`shrink-0 ${className}`} {...a11y(label)}>
      <circle cx="10" cy="7.5" r="4.75" />
      <path d="m7 11.75-1.5 5.75 4.5-2 4.5 2-1.5-5.75" />
    </svg>
  )
}

// A pulse line: the live pressure thermometer.
export function ActivityPulseIcon({ className = 'size-4', label }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" {...stroked} strokeWidth={2} className={`shrink-0 ${className}`} {...a11y(label)}>
      <path d="M2 10h3.5l2-5 3.5 10 2-5H18" />
    </svg>
  )
}

// A balance scale: the head-to-head match comparator.
export function ScaleCompareIcon({ className = 'size-4', label }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" {...stroked} className={`shrink-0 ${className}`} {...a11y(label)}>
      <path d="M10 3v14m-4 0h8M3.5 6h13" />
      <path d="M3.5 6 1.5 11a2 2 0 0 0 4 0Zm13 0-2 5a2 2 0 0 0 4 0Z" />
    </svg>
  )
}

// A bookmaker's odd that went up since VYROX's previous look.
export function TrendUpArrowIcon({ className = 'size-4', label }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" {...stroked} strokeWidth={2.5} className={`shrink-0 ${className}`} {...a11y(label)}>
      <path d="M10 16V4M5 9l5-5 5 5" />
    </svg>
  )
}

// A bookmaker's odd that went down since VYROX's previous look.
export function TrendDownArrowIcon({ className = 'size-4', label }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" {...stroked} strokeWidth={2.5} className={`shrink-0 ${className}`} {...a11y(label)}>
      <path d="M10 4v12m-5-5 5 5 5-5" />
    </svg>
  )
}

export function ArrowLeftIcon({ className = 'size-4', label }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" {...stroked} strokeWidth={2} className={`shrink-0 ${className}`} {...a11y(label)}>
      <path d="M16 10H4m5-5-5 5 5 5" />
    </svg>
  )
}

// Contraer todo: between a top and a bottom bar, two arrows close in on the middle.
export function CollapseAllIcon({ className = 'size-4', label }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" {...stroked} strokeWidth={2} className={`shrink-0 ${className}`} {...a11y(label)}>
      <path d="M4 2h12M4 18h12M10 5v3.5M7.5 6 10 8.5 12.5 6M10 15v-3.5M7.5 14l2.5-2.5 2.5 2.5" />
    </svg>
  )
}

// Expandir todo: the same bars, with the arrows parting from the middle toward them.
export function ExpandAllIcon({ className = 'size-4', label }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" {...stroked} strokeWidth={2} className={`shrink-0 ${className}`} {...a11y(label)}>
      <path d="M4 2h12M4 18h12M10 8.5V5M7.5 7.5 10 5l2.5 2.5M10 11.5V15m-2.5-2.5L10 15l2.5-2.5" />
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
