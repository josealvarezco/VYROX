import { useState, type ReactNode } from 'react'
import { bankrollAnalytics, type BankrollPoint } from './bankrollAnalytics'
import { Collapse } from './Collapse'
import { AwardBadgeIcon, ChartLineUpIcon, Chevron } from './icons'
import { pesos, signed } from './money'
import type { SavedTicket } from './types'

type Mode = 'profit' | 'bank'

// The chart's own units; the SVG scales to the slip's width.
const W = 280
const H = 120
const PAD = 10
const MODES = [
  ['profit', 'Profit Acumulado'],
  ['bank', 'Curva de Bank'],
] as const

function Chart({ points, mode }: { points: BankrollPoint[]; mode: Mode }) {
  const [active, setActive] = useState<number | null>(null)
  const values = points.map((point) => point[mode])
  const base = values[0] // the dashed line: $0 of profit, or the bank before these plays
  const low = Math.min(...values)
  const high = Math.max(...values)
  const x = (index: number) => PAD + (index / (points.length - 1)) * (W - 2 * PAD)
  const y = (value: number) => PAD + ((high - value) / (high - low || 1)) * (H - 2 * PAD)
  const up = values[values.length - 1] >= base
  const line = values.map((value, index) => `${x(index)},${y(value)}`).join(' ')
  const tip = active === null ? null : points[active]

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Evolución de ${points.length - 1} jugadas liquidadas`} className="w-full overflow-visible">
        <defs>
          <linearGradient id="bankroll-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={up ? '#F4D56D' : '#EE761B'} stopOpacity="0.45" />
            <stop offset="1" stopColor={up ? '#F4D56D' : '#EE761B'} stopOpacity="0" />
          </linearGradient>
        </defs>
        <line x1={PAD} x2={W - PAD} y1={y(base)} y2={y(base)} strokeDasharray="4 4" className="stroke-muted opacity-60" />
        <polygon points={`${x(0)},${H} ${line} ${x(points.length - 1)},${H}`} fill="url(#bankroll-fill)" />
        <polyline points={line} fill="none" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" className={up ? 'stroke-win' : 'stroke-loss'} />
        {points.map((point, index) => (
          <g key={index}>
            <circle cx={x(index)} cy={y(values[index])} r={active === index ? 5 : 3.5} strokeWidth={2} className={`fill-surface ${up ? 'stroke-win' : 'stroke-loss'}`} />
            {/* A wider invisible target, for fingers as much as for the mouse. */}
            <circle
              cx={x(index)}
              cy={y(values[index])}
              r={11}
              fill="transparent"
              tabIndex={0}
              role="button"
              aria-label={`${point.label}${point.odd ? `, cuota ${point.odd.toFixed(2)}, ${signed(point.delta)} COP` : ''}, ${mode === 'profit' ? `acumulado ${signed(point.profit)}` : `bank ${pesos(point.bank)}`} COP`}
              onMouseEnter={() => setActive(index)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(index)}
              onBlur={() => setActive(null)}
              onClick={() => setActive(active === index ? null : index)}
              className="cursor-pointer outline-none"
            />
          </g>
        ))}
      </svg>
      {tip && active !== null && (
        <div
          aria-hidden="true"
          style={{ left: `${Math.min(80, Math.max(20, (x(active) / W) * 100))}%`, top: `${(y(values[active]) / H) * 100}%` }}
          className={`pointer-events-none absolute z-10 -translate-x-1/2 rounded-xl bg-forest px-2.5 py-1.5 font-num text-[11px] whitespace-nowrap text-cream shadow-lg ${
            y(values[active]) < H / 2 ? 'translate-y-3' : '-translate-y-[calc(100%+12px)]'
          }`}
        >
          <p className="font-bold">
            {tip.label}
            {tip.odd && ` · cuota ${tip.odd.toFixed(2)}`}
          </p>
          {tip.odd && <p className={tip.delta < 0 ? 'text-orange' : 'text-yellow'}>{signed(tip.delta)} COP</p>}
          <p className="text-cream/70">{mode === 'profit' ? `Acumulado ${signed(tip.profit)}` : `Bank ${pesos(tip.bank)}`} COP</p>
        </div>
      )}
    </div>
  )
}

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-yellow px-2 py-0.5 text-[11px] font-bold text-forest">
      <AwardBadgeIcon className="size-3.5" />
      {children}
    </span>
  )
}

// "Evolución y Analítica IA" in "Mis Jugadas": the bankroll's path, the hit rate per market and the user's records,
// computed on the spot from the plays this browser keeps.
export function BankrollAnalytics({ tickets, bank }: { tickets: SavedTicket[]; bank: number }) {
  const [open, setOpen] = useState(tickets.length > 0)
  const [mode, setMode] = useState<Mode>('profit')
  const { points, marketBreakdown, bestMarket, currentStreak, highestWonOdd } = bankrollAnalytics(tickets, bank)
  const shown = bank > 0 ? mode : 'profit' // without a bank there is no bank curve to draw
  const now = points[points.length - 1]
  const up = now[shown] >= points[0][shown]

  return (
    <section className="rounded-2xl border border-line bg-surface">
      <h3>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          className="flex w-full cursor-pointer items-center gap-2 px-3 py-2.5 text-left font-bold transition-all duration-200 ease-out hover:bg-surface-2/60"
        >
          <ChartLineUpIcon className="size-4 text-gold" />
          Evolución y Analítica IA
          <Chevron direction={open ? 'up' : 'down'} className="ml-auto text-muted" />
        </button>
      </h3>
      <Collapse open={open}>
        <div className="space-y-3 px-3 pb-3">
          {/* The switch sits beside the total when it fits, and on its own line at the right in the narrow column. */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs whitespace-nowrap text-muted">
              {shown === 'profit' ? 'Profit acumulado' : 'Bank'}
              <span className={`block font-num text-base font-bold ${up ? 'text-win' : 'text-loss'}`}>
                {shown === 'profit' ? signed(now.profit) : pesos(now.bank)} COP
              </span>
            </p>
            {bank > 0 && (
              <div role="group" aria-label="Qué muestra la gráfica" className="ml-auto flex shrink-0 rounded-full bg-surface-2 p-0.5 text-[11px] font-semibold">
                {MODES.map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={mode === value}
                    onClick={() => setMode(value)}
                    className={`cursor-pointer rounded-full px-2.5 py-1 transition-all duration-200 ease-out ${
                      mode === value ? 'bg-yellow text-forest' : 'text-muted hover:text-ink'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {points.length < 3 ? (
            <div className="space-y-1">
              <svg viewBox={`0 0 ${W} 40`} aria-hidden="true" className="w-full">
                <line x1={PAD} x2={W - PAD} y1={20} y2={20} strokeDasharray="4 4" className="stroke-muted opacity-60" />
              </svg>
              <p className="text-xs text-muted">
                Con dos jugadas liquidadas aparece tu curva: se traza sola a medida que tus jugadas en curso se deciden, o
                cuando marcas una como ganada o perdida.
              </p>
            </div>
          ) : (
            <div>
              <Chart points={points} mode={shown} />
              <p className="mt-1 flex justify-between gap-2 font-num text-[10px] text-muted">
                <span>Inicio</span>
                <span>Punteada: {shown === 'profit' ? '$0' : `bank inicial ${pesos(points[0].bank)}`} COP</span>
                <span>{now.label}</span>
              </p>
            </div>
          )}

          <ul aria-label="Efectividad por mercado" className="space-y-2">
            {marketBreakdown.map((market) => (
              <li key={market.name}>
                <div className="flex items-baseline justify-between gap-2 text-xs">
                  <span className="font-semibold">{market.name}</span>
                  <span className="font-num text-muted">
                    <span className="font-bold text-ink">{market.total ? `${market.winRate}%` : '—'}</span> · {market.won}G - {market.lost}P
                  </span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-2">
                  <div
                    className={`h-full rounded-full ${market.name === bestMarket?.name ? 'bg-yellow' : 'bg-muted'}`}
                    style={{ width: `${market.winRate}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>

          {(bestMarket || currentStreak || highestWonOdd) && (
            <div className="flex flex-wrap gap-1.5">
              {bestMarket && (
                <Badge>
                  Mejor mercado: {bestMarket.name} <span className="font-num">{bestMarket.winRate}%</span>
                </Badge>
              )}
              {currentStreak && (
                <Badge>
                  Racha: <span className="font-num">{currentStreak.count}</span>{' '}
                  {currentStreak.type === 'won' ? (currentStreak.count === 1 ? 'ganada' : 'ganadas') : currentStreak.count === 1 ? 'perdida' : 'perdidas'}
                </Badge>
              )}
              {highestWonOdd && (
                <Badge>
                  Mayor cuota acertada: <span className="font-num">{highestWonOdd.toFixed(2)}</span>
                </Badge>
              )}
            </div>
          )}
        </div>
      </Collapse>
    </section>
  )
}
