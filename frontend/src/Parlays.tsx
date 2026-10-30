import { useEffect, useState, type ReactNode } from 'react'
import { Thinking } from './AiPrediction'
import { OddButton } from './BetSlip'
import { Collapse } from './Collapse'
import { Chevron, DoubleChevronRightIcon, DoubleChevronUpIcon, FlameIcon, RefreshIcon, TicketSlipIcon, WandSparklesIcon } from './icons'
import { TARGETS, fetchSmartParlay, type Market } from './smartParlay'
import type { Parlay, ParlayLeg, ParlaysResponse, SmartParlay } from './types'
import type { useBetSlip } from './useBetSlip'

// Cheap: the backend answers from its cache and drops the legs of matches that kicked off.
const REFRESH_MS = 300_000
const RIBBON = { segura: 'bg-orange', valor: 'bg-yellow', tendencia: 'bg-orange' } as const
const NOTE = 'rounded-2xl border border-line bg-surface px-4 py-3 text-sm text-muted'
const LEG_COUNTS = [null, 2, 3, 4, 5, 6] as const // null: VYROX IA picks how many
const MARKETS = [
  ['all', 'Mixto IA'],
  ['goals', 'Solo Goles'],
  ['1x2', 'Resultado (1X2)'],
  ['btts', 'Ambos Anotan'],
] as const

type Slip = ReturnType<typeof useBetSlip>
type Props = { slip: Slip; onSelect: (matchId: number) => void }

function Leg({ leg, slip, onSelect }: Props & { leg: ParlayLeg }) {
  return (
    <li className="flex items-center gap-3 border-b border-dashed border-line py-3 last:border-0">
      <img
        src={leg.league_logo}
        alt={leg.league_name}
        title={leg.league_name}
        className="size-5 shrink-0 rounded bg-white/90 object-contain p-px"
      />
      <button type="button" onClick={() => onSelect(leg.match_id)} className="group min-w-0 flex-1 cursor-pointer text-left">
        <span className="block text-sm leading-snug font-bold group-hover:underline">{leg.market_selection}</span>
        <span className="block text-xs text-muted">
          {leg.home_team} - {leg.away_team}
        </span>
        <span className="block font-num text-xs text-muted">{leg.kickoff_label}</span>
      </button>
      <div className="flex shrink-0 flex-col items-center gap-1">
        <OddButton pick={leg} slip={slip} className="min-w-14 px-2 py-1.5 text-sm">
          {leg.odd.toFixed(2)}
        </OddButton>
        <span className="flex items-center gap-0.5 text-[11px] whitespace-nowrap text-muted italic">
          <FlameIcon className="size-3.5" />
          {leg.popularity_label}
        </span>
      </div>
    </li>
  )
}

function ParlayCard({ parlay, slip, onSelect }: Props & { parlay: Parlay }) {
  return (
    // overflow-clip, not hidden: the ribbon overhangs the corner, and a hidden overflow can still be scrolled sideways by focus or find.
    <article className="relative flex flex-col overflow-clip rounded-2xl border border-line bg-surface p-3.5">
      <span
        className={`absolute top-[19px] -right-9 w-32 rotate-45 py-0.5 text-center font-num text-[11px] font-bold text-forest shadow-sm ${RIBBON[parlay.key]}`}
      >
        {parlay.badge}
      </span>
      <h3 className="flex items-center gap-1.5 pr-12 font-bold">
        {parlay.title}
        <DoubleChevronUpIcon className="size-4 text-orange" />
      </h3>
      <ul className="mt-1 flex-1">
        {parlay.legs.map((leg) => (
          <Leg key={leg.match_id} leg={leg} slip={slip} onSelect={onSelect} />
        ))}
      </ul>
      <p className="mt-2 text-xs text-muted">
        Probabilidad de acierto: <span className="font-num font-semibold text-ink">{parlay.probability}%</span>
      </p>
      <button
        type="button"
        onClick={() => slip.add(parlay.legs)}
        className="mt-2 flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl bg-chip px-3 py-2.5 text-left text-[11px] font-bold whitespace-nowrap text-cream 2xl:text-xs transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_6px_16px_-6px_rgb(13_51_30/0.5)] active:translate-y-0"
      >
        <span className="flex items-center gap-1">
          AGREGAR AL CUPÓN
          <DoubleChevronRightIcon className="size-3.5 text-yellow" />
        </span>
        <span className="font-num text-base text-yellow">{parlay.total_odd.toFixed(2)}</span>
      </button>
    </article>
  )
}

// Remounted per date (key), so the previous date's slips never show while the new ones load.
function ParlayGrid({ date, slip, onSelect }: Props & { date: string }) {
  const [data, setData] = useState<ParlaysResponse | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let current = true
    const load = () =>
      fetch(`/api/parlays?date=${date}`)
        .then((response) => {
          if (!response.ok) throw new Error(response.statusText)
          return response.json()
        })
        .then((body: ParlaysResponse) => {
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
      <div aria-live="polite" className="pt-3 text-sm">
        {error ? (
          <p className={NOTE}>No se pudieron cargar las combinadas. Se reintentará en unos minutos.</p>
        ) : (
          <Thinking>VYROX IA está armando las combinadas...</Thinking>
        )}
      </div>
    )
  }
  if (data.message) return <p className={`mt-3 ${NOTE}`}>{data.message}</p>
  return (
    <div className="space-y-3 pt-3">
      {data.simulated && <Simulated />}
      {/* On desktop the three slips always share one row; where the center column is too narrow for three cards of 220px, the row scrolls sideways. */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[repeat(3,minmax(13.75rem,1fr))] lg:overflow-x-auto">
        {data.parlays.map((parlay) => (
          <ParlayCard key={parlay.key} parlay={parlay} slip={slip} onSelect={onSelect} />
        ))}
      </div>
    </div>
  )
}

function Simulated() {
  return (
    <p className="inline-flex rounded-full border border-orange/50 bg-orange/10 px-2.5 py-0.5 text-xs font-semibold text-warn">
      Datos simulados · VYROX IA no está disponible en este momento
    </p>
  )
}

const choice = (active: boolean) =>
  `cursor-pointer rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-200 ease-out hover:scale-[1.02] active:scale-[0.98] ${
    active ? 'border-yellow bg-yellow text-forest' : 'border-line bg-surface text-ink hover:bg-surface-2'
  }`

function Choices({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap items-center gap-1.5">
      <span className="w-full text-xs font-semibold text-muted sm:w-28">{label}</span>
      {children}
    </div>
  )
}

// Constructor Inteligente VYROX IA: the slip nearest a target odd, built from the forecast the parlays already read.
function SmartBuilder({ date, slip, onSelect }: Props & { date: string }) {
  const [target, setTarget] = useState(5)
  const [free, setFree] = useState('')
  const [legs, setLegs] = useState<number | null>(null)
  const [market, setMarket] = useState<Market>('all')
  const [variant, setVariant] = useState(0)
  const [built, setBuilt] = useState<SmartParlay | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let current = true // drop answers for settings the user already changed
    fetchSmartParlay(date, target, legs, market, variant)
      .then((body) => {
        if (!current) return
        setBuilt(body)
        setError(false)
      })
      .catch(() => current && setError(true))
    return () => {
      current = false
    }
  }, [date, target, legs, market, variant])

  // A new target starts again from the best combination.
  const aim = (value: number) => {
    setTarget(value)
    setVariant(0)
  }

  return (
    <section aria-label="Constructor Inteligente VYROX IA" className="mt-3 overflow-hidden rounded-2xl border border-line bg-surface">
      <header className="hero flex items-center gap-3 px-4 py-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-yellow text-forest">
          <WandSparklesIcon className="size-5" />
        </span>
        <div>
          <h3 className="font-bold">Constructor Inteligente VYROX IA</h3>
          <p className="text-xs text-cream/70">Arma tu parlay por cuota objetivo</p>
        </div>
      </header>

      <div className="space-y-3 p-4 text-sm">
        <Choices label="Cuota objetivo">
          {TARGETS.map(([value, name]) => (
            <button
              key={value}
              type="button"
              aria-pressed={!free && target === value}
              onClick={() => {
                setFree('')
                aim(value)
              }}
              className={choice(!free && target === value)}
            >
              <span className="font-num font-bold">x{value.toFixed(1)}</span> {name}
            </button>
          ))}
          <label className="flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1 text-xs">
            <span className="font-semibold text-muted">Cuota libre</span>
            <input
              type="number"
              min={1.5}
              max={50}
              step={0.5}
              inputMode="decimal"
              value={free}
              placeholder="7.5"
              aria-label="Cuota objetivo libre, de 1.5 a 50"
              onChange={(event) => {
                setFree(event.target.value)
                const value = Number(event.target.value)
                if (value >= 1.5 && value <= 50) aim(value)
              }}
              className="w-12 bg-transparent font-num font-semibold text-ink outline-none"
            />
          </label>
        </Choices>
        <Choices label="Partidos">
          {LEG_COUNTS.map((count) => (
            <button
              key={count ?? 'auto'}
              type="button"
              aria-pressed={legs === count}
              onClick={() => {
                setLegs(count)
                setVariant(0)
              }}
              className={`${choice(legs === count)} ${count ? 'font-num' : ''}`}
            >
              {count ?? 'Auto'}
            </button>
          ))}
        </Choices>
        <Choices label="Mercado">
          {MARKETS.map(([value, name]) => (
            <button
              key={value}
              type="button"
              aria-pressed={market === value}
              onClick={() => {
                setMarket(value)
                setVariant(0)
              }}
              className={choice(market === value)}
            >
              {name}
            </button>
          ))}
        </Choices>

        <div aria-live="polite" className="space-y-3">
          {error ? (
            <p className={NOTE}>VYROX IA no pudo armar la combinada. Intenta de nuevo en un momento.</p>
          ) : !built ? (
            <Thinking>VYROX IA está armando tu combinada...</Thinking>
          ) : built.message ? (
            <p className={NOTE}>{built.message}</p>
          ) : (
            <>
              {built.simulated && <Simulated />}
              {built.played && <p className="text-xs text-muted">Estos partidos ya se jugaron: la combinada queda solo como referencia.</p>}
              <ul className="rounded-2xl border border-line px-3">
                {built.legs.map((leg) => (
                  <Leg key={leg.match_id} leg={leg} slip={slip} onSelect={onSelect} />
                ))}
              </ul>
              <p className="text-xs text-muted">
                {built.legs_count} selecciones, una por partido · Probabilidad conjunta VYROX IA:{' '}
                <span className="font-num font-semibold text-ink">{built.probability}%</span>
                {legs && built.legs_count < legs && ' · no hay más partidos con este mercado'}
                {!built.on_target && ` · la más cercana a x${target} con los partidos de esta fecha`}
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => slip.replace(built.legs)}
                  disabled={built.played}
                  className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-yellow px-4 py-2.5 font-bold whitespace-nowrap text-forest transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_6px_16px_-6px_rgb(244_213_109/0.7)] active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                >
                  <TicketSlipIcon className="size-4" />
                  Cargar en mi Cupón
                  <DoubleChevronRightIcon className="size-3.5" />
                  <span className="font-num text-base">{built.total_odd.toFixed(2)}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVariant(variant + 1)}
                  className="flex cursor-pointer items-center justify-center gap-1.5 rounded-full border border-line px-4 py-2.5 font-semibold whitespace-nowrap transition-all duration-200 ease-out hover:bg-surface-2 active:scale-[0.98]"
                >
                  <RefreshIcon />
                  Otra combinación
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

export function Parlays({ date, slip, onSelect, open, onToggle }: Props & { date: string; open: boolean; onToggle: () => void }) {
  return (
    <section>
      <h2>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className="flex w-full cursor-pointer items-center gap-2 rounded-2xl border border-line bg-surface px-4 py-3 text-left text-sm font-extrabold tracking-wide transition-all duration-200 ease-out hover:bg-surface-2/60"
        >
          <FlameIcon className="size-5" />
          COMBINADAS POPULARES
          <span className="hidden text-xs font-semibold tracking-normal text-muted @xl:inline">VYROX IA · cuotas estimadas de mercado</span>
          <Chevron direction={open ? 'up' : 'down'} className="ml-auto text-muted" />
        </button>
      </h2>
      <Collapse open={open}>
        <ParlayGrid key={date} date={date} slip={slip} onSelect={onSelect} />
        <SmartBuilder key={`builder-${date}`} date={date} slip={slip} onSelect={onSelect} />
      </Collapse>
    </section>
  )
}
