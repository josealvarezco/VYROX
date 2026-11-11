import { API_BASE_URL } from './api'
import { useEffect, useState, type ReactNode } from 'react'
import { Thinking } from './AiPrediction'
import { OddButton } from './BetSlip'
import { Collapse } from './Collapse'
import { ArrowLeftIcon, Chevron, DoubleChevronRightIcon, DoubleChevronUpIcon, FlameIcon, RefreshIcon, TicketSlipIcon, WandSparklesIcon } from './icons'
import { TARGETS, fetchSmartParlay, type Market } from './smartParlay'
import type { Parlay, ParlayLeg, ParlaysResponse, SmartParlay } from './types'
import type { useBetSlip } from './useBetSlip'

// Cheap: the backend answers from its cache, with the matches that still take plays.
const REFRESH_MS = 300_000
const BADGE = { segura: 'bg-orange', valor: 'bg-yellow', tendencia: 'bg-orange' } as const
const NOTE = 'rounded-2xl border border-line bg-surface px-4 py-3 text-sm text-muted'
const LEG_COUNTS = [null, 2, 3, 4, 5, 6] as const // null: VYROX IA picks how many
const MARKETS = [
  ['all', 'Mixto IA'],
  ['goals', 'Solo Goles'],
  ['1x2', 'Resultado (1X2)'],
  ['btts', 'Ambos Anotan'],
] as const

const TABS = [
  ['parlays', 'Combinadas Populares', FlameIcon],
  ['builder', 'Constructor por Cuota IA', WandSparklesIcon],
] as const

type Slip = ReturnType<typeof useBetSlip>
type Props = { slip: Slip; onSelect: (matchId: number) => void }

// Today ran out of matches: instead of an empty box, a way to plan tomorrow's.
function NextDay({ day, onDate }: { day: string; onDate: (day: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onDate(day)}
      className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-yellow px-4 py-3 text-sm font-bold text-forest transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_6px_16px_-6px_rgb(244_213_109/0.7)] active:translate-y-0"
    >
      Jornada de hoy finalizando · Ver Combinadas de Mañana
      <ArrowLeftIcon className="size-4 rotate-180" />
    </button>
  )
}

function Leg({ leg, slip, onSelect }: Props & { leg: ParlayLeg }) {
  return (
    // Every text truncates (whole on hover), so a long name never pushes the odd out of the card.
    <li className="flex w-full min-w-0 items-center justify-between gap-2 border-b border-dashed border-line py-2 last:border-0 compact:py-1.5">
      <div className="flex min-w-0 flex-1 items-start gap-2 overflow-hidden">
        <img
          src={leg.league_logo}
          alt={leg.league_name}
          title={leg.league_name}
          className="size-5 shrink-0 rounded bg-white/90 object-contain p-px compact:size-4"
        />
        <button type="button" onClick={() => onSelect(leg.match_id)} className="group min-w-0 flex-1 cursor-pointer text-left">
          <span title={leg.market_selection} className="block truncate text-xs font-bold group-hover:underline">
            {leg.market_selection}
          </span>
          <span title={`${leg.home_team} - ${leg.away_team}`} className="block truncate text-[11px] text-muted">
            {leg.home_team} - {leg.away_team}
          </span>
          {leg.live_label ? (
            <span className="block truncate font-num text-[11px] font-semibold text-win">{leg.live_label}</span>
          ) : (
            <span className="block truncate font-num text-[11px] text-muted compact:hidden">{leg.kickoff_label}</span>
          )}
        </button>
      </div>
      <div className="ml-1 flex shrink-0 flex-col items-end justify-center gap-0.5">
        <OddButton pick={leg} slip={slip} className="min-w-[48px] px-2.5 py-1 text-center text-xs compact:min-w-[46px] compact:px-2 compact:text-[11px]">
          {leg.odd.toFixed(2)}
        </OddButton>
        <span className="flex items-center gap-0.5 text-[10px] whitespace-nowrap text-muted italic compact:hidden">
          <FlameIcon className="size-3.5" />
          {leg.popularity_label}
        </span>
      </div>
    </li>
  )
}

function ParlayCard({ parlay, slip, onSelect }: Props & { parlay: Parlay }) {
  return (
    // On desktop the cards share their rows (subgrid), so titles, picks and totals line up across the three. Their one
    // column is minmax(0, 1fr), not auto: an auto column would grow to fit the longest team name and cut the odds off.
    <article className="box-border flex w-full max-w-full min-w-0 flex-col justify-between overflow-hidden rounded-2xl border border-line bg-surface p-3.5 compact:p-2.5 lg:row-span-5 lg:grid lg:grid-cols-1 lg:grid-rows-subgrid lg:gap-y-0">
      <h3 className="flex min-w-0 items-center gap-1.5 text-sm font-bold">
        <span className="min-w-0">{parlay.title}</span>
        <DoubleChevronUpIcon className="size-4 shrink-0 text-orange" />
        <span className={`ml-auto shrink-0 rounded-full px-2 py-0.5 text-[10px] font-extrabold tracking-wide whitespace-nowrap text-forest ${BADGE[parlay.key]}`}>
          {parlay.badge}
        </span>
      </h3>
      <ul className="mt-1 min-w-0 flex-1 lg:row-span-3 lg:grid lg:grid-cols-1 lg:grid-rows-subgrid lg:gap-y-0">
        {parlay.legs.map((leg) => (
          <Leg key={leg.match_id} leg={leg} slip={slip} onSelect={onSelect} />
        ))}
      </ul>
      <div>
        <p className="mt-1 text-xs text-muted">
          Probabilidad de acierto: <span className="font-num font-semibold text-ink">{parlay.probability}%</span>
        </p>
        <button
          type="button"
          onClick={() => slip.add(parlay.legs)}
          className="mt-1.5 box-border flex w-full min-w-0 cursor-pointer items-center justify-between gap-2 rounded-xl bg-chip px-3.5 py-2.5 text-left text-cream compact:mt-1 compact:py-1.5 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_6px_16px_-6px_rgb(13_51_30/0.5)] active:translate-y-0"
        >
          <span className="flex min-w-0 items-center gap-1">
            <span className="truncate text-xs font-bold">AGREGAR AL CUPÓN</span>
            <DoubleChevronRightIcon className="size-3.5 shrink-0 text-yellow" />
          </span>
          <span className="shrink-0 font-num text-sm font-bold text-yellow">{parlay.total_odd.toFixed(2)}</span>
        </button>
      </div>
    </article>
  )
}

// Remounted per date (key), so the previous date's slips never show while the new ones load.
function ParlayGrid({ date, slip, onSelect, onDate }: Props & { date: string; onDate: (day: string) => void }) {
  const [data, setData] = useState<ParlaysResponse | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let current = true
    const load = () =>
      fetch(`${API_BASE_URL}/api/parlays?date=${date}`)
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
  if (data.next_date) return <div className="pt-3"><NextDay day={data.next_date} onDate={onDate} /></div>
  if (data.message) return <p className={`mt-3 ${NOTE}`}>{data.message}</p>
  return (
    <div className="space-y-3 pt-3">
      {data.simulated && <Simulated />}
      {/* On desktop the three slips always share one row; where the center column is too narrow for three cards of 208px, the row scrolls sideways. */}
      <div className="grid w-full grid-cols-1 gap-3.5 lg:grid-cols-[repeat(3,minmax(13rem,1fr))] lg:gap-y-0 lg:overflow-x-auto">
        {data.parlays.map((parlay) => (
          <ParlayCard key={parlay.key} parlay={parlay} slip={slip} onSelect={onSelect} />
        ))}
      </div>
    </div>
  )
}

export function Simulated() {
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
function SmartBuilder({ date, slip, onSelect, onDate }: Props & { date: string; onDate: (day: string) => void }) {
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
    <section aria-label="Constructor Inteligente VYROX IA" className="space-y-3 pt-3 text-sm compact:space-y-2">
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
        ) : built.next_date ? (
          <NextDay day={built.next_date} onDate={onDate} />
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
    </section>
  )
}

// One box with two tabs. Both stay mounted, so the constructor keeps its settings when the user comes back to it.
export function Parlays({ date, slip, onSelect, open, onToggle, onDate }: Props & { date: string; open: boolean; onToggle: () => void; onDate: (day: string) => void }) {
  const [tab, setTab] = useState<(typeof TABS)[number][0]>('parlays')
  return (
    <section className="rounded-2xl border border-line bg-surface p-3 compact:p-2">
      <div className="flex flex-wrap items-center gap-1.5">
        {TABS.map(([key, name, Icon]) => (
          <button
            key={key}
            type="button"
            aria-pressed={tab === key}
            onClick={() => {
              setTab(key)
              if (!open) onToggle()
            }}
            className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-bold transition-all duration-200 ease-out hover:scale-[1.02] active:scale-[0.98] compact:py-1 compact:text-xs ${
              tab === key ? 'border-yellow bg-yellow text-forest' : 'border-line bg-surface text-ink hover:bg-surface-2'
            }`}
          >
            <Icon className="size-4" />
            {name}
          </button>
        ))}
        <span className="ml-auto hidden text-xs font-semibold text-muted @3xl:inline">VYROX IA · cuotas estimadas de mercado</span>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-label={open ? 'Cerrar combinadas y constructor' : 'Abrir combinadas y constructor'}
          title={open ? 'Cerrar combinadas y constructor' : 'Abrir combinadas y constructor'}
          className="ml-auto grid size-7 shrink-0 cursor-pointer place-items-center rounded-full text-muted transition-all duration-200 ease-out hover:bg-surface-2 hover:text-ink @3xl:ml-0"
        >
          <Chevron direction={open ? 'up' : 'down'} />
        </button>
      </div>
      <Collapse open={open}>
        <div hidden={tab !== 'parlays'}>
          <ParlayGrid key={date} date={date} slip={slip} onSelect={onSelect} onDate={onDate} />
        </div>
        <div hidden={tab !== 'builder'}>
          <SmartBuilder key={`builder-${date}`} date={date} slip={slip} onSelect={onSelect} onDate={onDate} />
        </div>
      </Collapse>
    </section>
  )
}
