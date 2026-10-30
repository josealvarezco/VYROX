import { ActivityPulseIcon, FlameIcon } from './icons'
import type { Momentum } from './types'

// Momentum IA's split bar: the home side's share of the pressure from the left in yellow, the away side's in orange.
export function PressureBar({ home, away, className = 'h-2' }: { home: number; away: number; className?: string }) {
  const share = home + away ? (home / (home + away)) * 100 : 50
  return (
    <div aria-hidden="true" className={`flex w-full gap-px overflow-hidden rounded-full ${className}`}>
      <div className="h-full bg-yellow transition-all duration-500 ease-out" style={{ width: `${share}%` }} />
      <div className="h-full flex-1 bg-orange transition-all duration-500 ease-out" />
    </div>
  )
}

// The Termómetro de Presión of a live match, in the Match Center's summary and statistics.
export function MomentumPanel({ momentum, home, away }: { momentum: Momentum; home: string; away: string }) {
  const hot = momentum.momentum_status === 'high_voltage'
  const reading = {
    balanced: 'Partido equilibrado',
    home_domination: `${home} arrincona a ${away}`,
    away_domination: `${away} arrincona a ${home}`,
    high_voltage: 'Partido caliente',
  }[momentum.momentum_status]

  return (
    <section
      aria-label="Termómetro de Presión Momentum IA"
      className={`space-y-2.5 rounded-2xl border p-3 ${hot ? 'border-orange bg-orange/10' : 'border-line bg-surface'}`}
    >
      <h3 className="flex items-center gap-1.5 text-sm font-bold">
        <ActivityPulseIcon className="size-4 text-warn" />
        Termómetro de Presión · Momentum IA
      </h3>
      {hot && (
        <p className="flex items-center gap-1.5 rounded-full bg-forest px-3 py-1 text-xs font-extrabold tracking-wide text-yellow ring-1 ring-orange">
          <FlameIcon className="size-4" />
          MOMENTUM IA: ALERTA DE GOL INMINENTE (Próximos 15')
        </p>
      )}
      <div className="flex items-baseline justify-between gap-3 text-sm font-semibold">
        <span className="min-w-0 truncate">
          {home} <span className="font-num font-bold text-gold">{momentum.home_pressure}</span>
        </span>
        <span className="min-w-0 truncate text-right">
          <span className="font-num font-bold text-warn">{momentum.away_pressure}</span> {away}
        </span>
      </div>
      <PressureBar home={momentum.home_pressure} away={momentum.away_pressure} className="h-3" />
      <p className="flex flex-wrap justify-between gap-x-3 text-xs text-muted">
        <span className="font-semibold text-ink">{reading}</span>
        <span>
          Gol en los próximos 15': <span className="font-num font-bold text-ink">{momentum.goal_probability_next_15m}%</span>
        </span>
      </p>
      <p className="text-[11px] text-muted">
        Presión de 0 a 100 por remates, remates al arco y en el área, córners, posesión y expulsiones, con más peso en los
        últimos 15 minutos. Estimación de VYROX IA; se actualiza cada vez que se abre el partido.
      </p>
    </section>
  )
}
