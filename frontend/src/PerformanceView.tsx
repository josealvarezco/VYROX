import { Activity, ChartArea, Check, Percent, Target, TrendingDown, TrendingUp } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { API_BASE_URL } from './api'
import type { Performance } from './types'

const units = (value: number) => `${value > 0 ? '+' : ''}${value.toFixed(2)} u`

// Rendimiento IA: VYROX IA's real record of the last 30 days, from its Radar IA picks saved before kickoff and settled
// with the final scores, charted as the running net profit at one unit per pick.
export function PerformanceView() {
  const [data, setData] = useState<Performance | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/performance`)
      .then((response) => {
        if (!response.ok) throw new Error(response.statusText)
        return response.json()
      })
      .then(setData)
      .catch(() => setFailed(true))
  }, [])

  if (failed) return <p className="rounded-2xl border border-line bg-surface px-4 py-3 text-sm text-muted">No se pudo cargar el historial de VYROX IA. Intenta de nuevo en un momento.</p>
  if (!data) return <p className="rounded-2xl border border-line bg-surface px-4 py-3 text-sm text-muted">Cargando el historial de VYROX IA…</p>

  const { kpis, daily, recent_hits } = data
  const up = (kpis?.profit ?? 0) >= 0
  const line = up ? '#22C55E' : '#EF4444'
  const fill = up ? '#F4D56D' : '#EE761B'
  const metrics = kpis
    ? [
        ['% ACIERTOS', `${kpis.win_rate}%`, Target],
        ['CUOTA MEDIA', kpis.avg_odd.toFixed(2), Activity],
        ['ROI', kpis.roi, Percent],
      ] as const
    : []

  return (
    <section aria-label="Rendimiento IA" className="overflow-hidden rounded-3xl border border-yellow/20 bg-forest text-cream shadow-[0_30px_80px_-40px_rgb(244_213_109/0.35)]">
      <header className="flex flex-wrap items-start gap-4 px-6 pt-6">
        <div>
          <p className="flex items-center gap-2 text-xs font-bold tracking-[0.16em] text-cream/60">
            <ChartArea className="size-4 text-yellow" aria-hidden="true" />
            RENDIMIENTO IA · ÚLTIMOS 30 DÍAS
          </p>
          <p className="mt-3 text-sm text-cream/70">Ganancia / Pérdida neta</p>
          <p className={`flex items-center gap-2 font-num text-5xl leading-none font-bold sm:text-6xl ${kpis ? (up ? 'text-win' : 'text-loss') : 'text-cream/40'}`}>
            {kpis && (up ? <TrendingUp className="size-9" aria-hidden="true" /> : <TrendingDown className="size-9" aria-hidden="true" />)}
            {units(kpis?.profit ?? 0)}
          </p>
          <p className="mt-2 text-xs text-cream/60">
            A 1 unidad por pronóstico
            {kpis && (
              <>
                {' '}· <span className="font-num font-semibold text-cream">{kpis.picks}</span> pronósticos del Radar IA ya resueltos
              </>
            )}
          </p>
        </div>
      </header>

      {!kpis ? (
        <p className="px-6 pt-4 pb-6 text-sm text-cream/70">
          Aún no hay pronósticos resueltos. El historial se arma solo con los pronósticos del Radar IA de cada día, guardados
          antes del partido y verificados con el marcador final.
        </p>
      ) : (
        <>
          <div className="mt-4 h-72 px-2 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={daily} margin={{ top: 10, right: 16, bottom: 0, left: 16 }}>
                <defs>
                  <linearGradient id="profit-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={fill} stopOpacity={0.45} />
                    <stop offset="100%" stopColor={fill} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#F7F5EB" strokeOpacity={0.06} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'rgb(247 245 235 / 0.5)' }} minTickGap={24} />
                <YAxis hide domain={['auto', 'auto']} />
                <ReferenceLine y={0} stroke="#444" strokeDasharray="4 4" />
                {/* The library's default tooltip is a white box: this one keeps VYROX's dark card. */}
                <Tooltip
                  cursor={{ stroke: 'rgb(247 245 235 / 0.25)' }}
                  content={({ active, payload }) => {
                    const point = active ? (payload?.[0]?.payload as Performance['daily'][number] | undefined) : undefined
                    return point ? (
                      <div className="rounded-xl border border-yellow/30 bg-forest px-3 py-2 text-sm text-cream shadow-xl">
                        <p className="font-semibold">
                          {point.day} {point.date}
                        </p>
                        <p className={`font-num text-base font-bold ${point.profit >= 0 ? 'text-win' : 'text-loss'}`}>{units(point.profit)}</p>
                        <p className="text-xs text-cream/70">
                          <span className="font-num">{point.won}</span> aciertos · <span className="font-num">{point.lost}</span> fallos ese día
                        </p>
                      </div>
                    ) : null
                  }}
                />
                <Area type="monotone" dataKey="profit" stroke={line} strokeWidth={2.5} fill="url(#profit-fill)" dot={false} activeDot={{ r: 5, fill: line, stroke: '#0D331E', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <dl className="mt-2 grid grid-cols-3 divide-x divide-cream/10 border-t border-cream/10">
            {metrics.map(([label, value, Icon]) => (
              <div key={label} className="px-6 py-5">
                <dt className="flex items-center gap-1.5 text-[11px] font-bold tracking-[0.14em] text-cream/55">
                  <Icon className="size-3.5" aria-hidden="true" />
                  {label}
                </dt>
                <dd className={`mt-1 font-num text-2xl font-bold sm:text-3xl ${label === '% ACIERTOS' ? 'text-yellow' : 'text-cream'}`}>{value}</dd>
              </div>
            ))}
          </dl>

          {recent_hits.length > 0 && (
            <div className="border-t border-cream/10 px-6 py-5">
              <h3 className="text-[11px] font-bold tracking-[0.14em] text-cream/55">ÚLTIMOS ACIERTOS</h3>
              <ul className="mt-3 space-y-2">
                {recent_hits.map((hit) => (
                  <li key={`${hit.date}-${hit.match}-${hit.market}`} className="flex items-center gap-3 text-sm">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-win/20 text-win">
                      <Check className="size-3.5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1 truncate">
                      {hit.match} <span className="text-cream/60">· {hit.market}</span>
                    </span>
                    <span className="font-num text-xs text-cream/60">{hit.date}</span>
                    <span className="font-num font-bold text-yellow">{hit.odd.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </section>
  )
}
