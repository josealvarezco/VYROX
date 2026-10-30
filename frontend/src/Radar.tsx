import { useEffect, useState } from 'react'
import { Thinking } from './AiPrediction'
import { OddButton } from './BetSlip'
import { RadarIcon, TicketSlipIcon } from './icons'
import type { RadarCategory, RadarItem, RadarResponse } from './types'
import type { useBetSlip } from './useBetSlip'

// Cheap: the backend answers from the parlays' cached forecast and drops the matches that kicked off.
const REFRESH_MS = 300_000
const MARKETS: [RadarCategory['key'], string][] = [
  ['bankers_1x2', 'Fijos del Día (1X2)'],
  ['over_2_5', 'Tendencia +2.5 Goles'],
  ['btts_yes', 'Ambos Anotan (Sí)'],
  ['under_2_5', 'Menos de 2.5 Goles'],
]
const NOTE = 'rounded-2xl border border-line bg-surface px-4 py-3 text-sm text-muted'

type Market = RadarCategory['key']
type Props = { slip: ReturnType<typeof useBetSlip>; onSelect: (matchId: number) => void }

function Card({ item, played, slip, onSelect }: Props & { item: RadarItem; played: boolean }) {
  const odd = (
    <>
      <TicketSlipIcon />
      {item.fair_odd.toFixed(2)}
    </>
  )
  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4">
      <div className="flex items-center gap-2 text-xs text-muted">
        <img
          src={item.league_logo}
          alt={item.league_name}
          title={item.league_name}
          className="size-5 shrink-0 rounded bg-white/90 object-contain p-px"
        />
        <span className="shrink-0 font-num">{item.kickoff_label}</span>
        <span
          className={`ml-auto shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide whitespace-nowrap ${
            item.confidence_badge === 'ALTA' ? 'bg-yellow text-forest' : 'bg-chip text-cream'
          }`}
        >
          CONFIANZA {item.confidence_badge} · <span className="font-num">{item.probability}%</span>
        </span>
      </div>
      <button
        type="button"
        onClick={() => onSelect(item.match_id)}
        className="group flex min-w-0 cursor-pointer items-center gap-2 text-left text-sm font-semibold"
      >
        <img src={item.home_logo} alt="" className="size-6 shrink-0 object-contain" />
        <span className="truncate group-hover:underline">{item.home_team}</span>
        <span className="shrink-0 text-xs font-normal text-muted">vs</span>
        <span className="truncate group-hover:underline">{item.away_team}</span>
        <img src={item.away_logo} alt="" className="size-6 shrink-0 object-contain" />
      </button>
      <div>
        <p className="font-bold">{item.market_selection}</p>
        <p className="mt-0.5 text-sm text-muted">{item.insight}</p>
      </div>
      <div className="mt-auto flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-chip" aria-hidden="true">
          <div className="h-full origin-left animate-grow rounded-full bg-yellow" style={{ width: `${item.probability}%` }} />
        </div>
        {played ? (
          <span className="flex items-center gap-1.5 font-num text-sm font-bold text-muted">{odd}</span>
        ) : (
          <OddButton pick={{ ...item, odd: item.fair_odd }} slip={slip} className="flex items-center gap-1.5 px-3 py-1.5 text-sm">
            {odd}
          </OddButton>
        )}
      </div>
    </article>
  )
}

// Remounted per date (key), so the previous date's picks never show while the new ones load.
function RadarGrid({ date, market, slip, onSelect }: Props & { date: string; market: Market }) {
  const [data, setData] = useState<RadarResponse | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let current = true
    const load = () =>
      fetch(`/api/radar?date=${date}`)
        .then((response) => {
          if (!response.ok) throw new Error(response.statusText)
          return response.json()
        })
        .then((body: RadarResponse) => {
          if (!current) return
          setData(body)
          setError(false)
        })
        .catch(() => current && setError(true))
    load()
    const id = setInterval(load, REFRESH_MS)
    return () => {
      current = false
      clearInterval(id)
    }
  }, [date])

  if (!data) {
    return (
      <div aria-live="polite" className="text-sm">
        {error ? (
          <p className={NOTE}>No se pudo cargar el radar. Se reintentará en unos minutos.</p>
        ) : (
          <Thinking>VYROX IA está escaneando los partidos...</Thinking>
        )}
      </div>
    )
  }
  if (data.message) return <p className={NOTE}>{data.message}</p>
  const category = data.categories.find(({ key }) => key === market)
  return (
    <div className="space-y-3">
      {data.simulated && (
        <p className="inline-flex rounded-full border border-orange/50 bg-orange/10 px-2.5 py-0.5 text-xs font-semibold text-warn">
          Datos simulados · VYROX IA no está disponible en este momento
        </p>
      )}
      {data.played && (
        <p className={NOTE}>Esta fecha ya no tiene partidos por jugar: el radar muestra sus lecturas como referencia y no admite jugadas.</p>
      )}
      {category?.items.length ? (
        <>
          <h3 className="text-sm font-bold">{category.title}</h3>
          {/* Two cards only from a 672px center column: narrower ones leave no room for the confidence badge. */}
          <div className="grid grid-cols-1 gap-3.5 @2xl:grid-cols-2">
            {category.items.map((item) => (
              <Card key={item.match_id} item={item} played={data.played} slip={slip} onSelect={onSelect} />
            ))}
          </div>
        </>
      ) : (
        <p className={NOTE}>VYROX IA no encontró partidos con al menos 55% en este mercado.</p>
      )}
    </div>
  )
}

export function Radar({ date, slip, onSelect }: Props & { date: string }) {
  const [market, setMarket] = useState<Market>('bankers_1x2')
  return (
    <section className="space-y-4">
      <div className="hero rounded-3xl px-5 py-4">
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <RadarIcon className="size-5 text-yellow" />
          Radar de Tendencias VYROX IA
        </h2>
        <p className="mt-0.5 text-sm text-cream/70">Escaneo de probabilidades por mercado</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {MARKETS.map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setMarket(key)}
            aria-pressed={market === key}
            className={`cursor-pointer rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-all duration-200 ease-out hover:scale-[1.02] active:scale-[0.98] ${
              market === key ? 'border-yellow bg-yellow text-forest' : 'border-line bg-surface text-ink hover:bg-surface-2'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <RadarGrid key={date} date={date} market={market} slip={slip} onSelect={onSelect} />
    </section>
  )
}
