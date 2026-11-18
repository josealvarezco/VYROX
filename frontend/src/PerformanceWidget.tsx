import { useEffect, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import { API_BASE_URL } from './api'
import { ChartLineUpIcon, CheckIcon } from './icons'
import type { Performance } from './types'

// Rendimiento IA: a week of demo numbers, labeled as such. VYROX keeps no history, so VYROX IA's real record cannot
// be measured, and these numbers must never read as it.
export function PerformanceWidget() {
  const [data, setData] = useState<Performance | null>(null)

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/performance`)
      .then((response) => (response.ok ? response.json() : null))
      .then(setData)
      .catch(() => setData(null))
  }, [])

  if (!data) return null
  const { kpis, daily_trend, recent_hits } = data
  const stats = [
    ['Win Rate', `${kpis.win_rate}%`, 'text-yellow'],
    ['Cuota media', kpis.avg_odd.toFixed(2), 'text-cream'],
    ['ROI', kpis.roi, kpis.roi.startsWith('-') ? 'text-orange' : 'text-cream'],
  ]

  return (
    <section aria-label="Rendimiento IA de los últimos 7 días" className="rounded-2xl border border-yellow/20 bg-forest p-5 text-cream">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <h2 className="flex items-center gap-2 text-xs font-bold tracking-[0.14em] text-cream/70">
          <ChartLineUpIcon className="size-4 text-yellow" />
          RENDIMIENTO IA - ÚLTIMOS 7 DÍAS
        </h2>
        {data.simulated && (
          <span className="ml-auto rounded-full border border-orange/60 bg-orange/15 px-2.5 py-0.5 text-[11px] font-semibold text-peach">
            Datos de demostración · no es el historial real de VYROX IA
          </span>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <dl className="grid grid-cols-3 gap-3">
            {stats.map(([label, value, color]) => (
              <div key={label}>
                <dt className="text-xs text-cream/60">{label}</dt>
                <dd className={`font-num text-3xl font-bold ${color}`}>{value}</dd>
              </div>
            ))}
          </dl>
          <ul className="mt-4 space-y-2">
            {recent_hits.map((hit) => (
              <li key={`${hit.date}-${hit.match}-${hit.market}`} className="flex items-center gap-2.5 text-sm">
                <span className="grid size-5 shrink-0 place-items-center rounded-full bg-win/20 text-win">
                  <CheckIcon className="size-3" />
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

        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={daily_trend} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} strokeOpacity={0.1} />
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
            {/* The library's default tooltip is a white box: this one keeps VYROX's dark card. */}
            <Tooltip
              cursor={{ fill: 'rgb(247 245 235 / 0.06)' }}
              content={({ active, payload, label }) =>
                active && payload?.length ? (
                  <div className="rounded-xl border border-yellow/30 bg-forest p-2 text-sm text-cream shadow-xl">
                    <p className="font-bold">{label}</p>
                    <p>
                      Aciertos: <span className="font-num font-bold text-yellow">{payload.find((item) => item.dataKey === 'won')?.value}</span>
                    </p>
                    <p>
                      Fallos: <span className="font-num font-bold">{payload.find((item) => item.dataKey === 'lost')?.value}</span>
                    </p>
                  </div>
                ) : null
              }
            />
            <Bar dataKey="won" name="Aciertos" fill="#F4D56D" radius={[4, 4, 0, 0]} />
            <Bar dataKey="lost" name="Fallos" fill="#F7F5EB" fillOpacity={0.2} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
