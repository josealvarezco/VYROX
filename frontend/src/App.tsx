import { useEffect, useRef, useState } from 'react'

type Team = { id: number; shortName: string; crest: string }
type Goals = { home: number | null; away: number | null }
type Match = {
  id: number
  utcDate: string
  status: string
  homeTeam: Team
  awayTeam: Team
  score: { fullTime: Goals; halfTime?: Goals }
  // Detail fields come from API-Football; the sample data does not have them.
  minute?: number | null
  round?: string
  venue?: { name: string | null; city: string | null }
  referee?: string | null
}
type Competition = { id: number; name: string; emblem: string; area: { name: string }; matches: Match[] }
type MatchesResponse = { sample: boolean; competitions: Competition[] }
type Prediction =
  | { fallback: true; reasoning: string }
  | {
      fallback: false
      winner_pick: string
      probabilities: { home: number; draw: number; away: number }
      both_teams_to_score: string
      over_under_2_5: string
      confidence: string
      recommended_bet: string
      reasoning: string
    }

// Cheap: the backend answers from its cache, so polling never spends API-Football quota.
const REFRESH_MS = 60_000

// The backend picks matches by Colombia's date, so the picker uses that day too.
const TODAY = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' })

function shiftDay(day: string, offset: number) {
  const date = new Date(`${day}T12:00:00Z`)
  date.setUTCDate(date.getUTCDate() + offset)
  return date.toISOString().slice(0, 10)
}

// API-Football's free plan only serves yesterday, today and tomorrow (the backend rejects other dates).
const FIRST_DAY = shiftDay(TODAY, -1)
const LAST_DAY = shiftDay(TODAY, 1)

const LIVE = new Set(['IN_PLAY', 'PAUSED'])
const STATUS_LABEL: Record<string, string> = {
  IN_PLAY: 'En vivo',
  PAUSED: 'Descanso',
  FINISHED: 'Final',
  POSTPONED: 'Aplazado',
  SUSPENDED: 'Suspendido',
  CANCELLED: 'Cancelado',
  AWARDED: 'Adjudicado',
}

function statusText(match: Match) {
  return (
    STATUS_LABEL[match.status] ??
    new Date(match.utcDate).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
  )
}

function PredictionPanel({ prediction }: { prediction: Prediction }) {
  if (prediction.fallback) return <p className="text-amber-300">{prediction.reasoning}</p>
  const { home, draw, away } = prediction.probabilities
  const bars = [['Local', home], ['Empate', draw], ['Visitante', away]] as const
  const badges = [
    ['Apuesta Recomendada', prediction.recommended_bet],
    ['Confianza', prediction.confidence],
    ['Ambos Anotan', prediction.both_teams_to_score],
    ['Goles (2.5)', prediction.over_under_2_5],
  ] as const
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        {bars.map(([label, value]) => (
          <div key={label} className="grid grid-cols-[4.5rem_1fr_2.5rem] items-center gap-2">
            <span className="text-neutral-400">{label}</span>
            <div className="h-2 overflow-hidden rounded-full bg-neutral-800" aria-hidden="true">
              <div className="h-full rounded-full bg-violet-500" style={{ width: `${value}%` }} />
            </div>
            <span className="text-right tabular-nums">{value}%</span>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {badges.map(([label, value]) => (
          <span key={label} className="rounded-full border border-violet-500/40 bg-violet-500/10 px-2.5 py-1 text-xs">
            <span className="text-neutral-400">{label}:</span> <span className="font-semibold text-violet-200">{value}</span>
          </span>
        ))}
      </div>
      <p className="text-neutral-300">{prediction.reasoning}</p>
      <p className="text-xs text-neutral-500">Pronóstico generado por IA con fines informativos; no garantiza resultados.</p>
    </div>
  )
}

function AiPrediction({ match, league }: { match: Match; league: string }) {
  const [open, setOpen] = useState(false)
  const [prediction, setPrediction] = useState<Prediction | null>(null)
  const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle')

  const toggle = () => {
    setOpen(!open)
    if (open || prediction || state === 'loading') return
    setState('loading')
    fetch('/api/predictions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        match_id: match.id,
        home_team: match.homeTeam.shortName,
        away_team: match.awayTeam.shortName,
        league,
        date: match.utcDate,
        status: match.status,
        score: match.score.fullTime,
      }),
    })
      .then((response) => {
        if (!response.ok) throw new Error(response.statusText)
        return response.json()
      })
      .then((body: Prediction) => {
        setPrediction(body)
        setState('idle')
      })
      .catch(() => setState('error'))
  }

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        className="col-span-full justify-self-end rounded-md border border-violet-500/40 px-2 py-1 text-xs text-violet-200 hover:bg-violet-500/10 sm:col-span-1"
      >
        Pronóstico IA ✨
      </button>
      {open && (
        <div aria-live="polite" className="col-span-full mt-2 rounded-lg bg-neutral-950/60 p-3 text-sm">
          {state === 'loading' && <p className="text-neutral-400">Analizando partido con Gemini IA...</p>}
          {state === 'error' && <p className="text-red-300">No se pudo conectar con el servidor. Cierra y vuelve a intentarlo.</p>}
          {prediction && <PredictionPanel prediction={prediction} />}
        </div>
      )}
    </>
  )
}

function MatchRow({ match, league, onSelect }: { match: Match; league: string; onSelect: () => void }) {
  const { home, away } = match.score.fullTime
  const live = LIVE.has(match.status)
  return (
    <li className="grid grid-cols-[4.75rem_minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-x-2 px-3 py-2 sm:grid-cols-[4.75rem_minmax(0,1fr)_auto_minmax(0,1fr)_auto] sm:gap-x-3 sm:px-4">
      <button
        type="button"
        onClick={onSelect}
        className="col-span-4 grid grid-cols-subgrid items-center rounded-md py-1 text-left hover:bg-neutral-800/60"
      >
        <span className={`text-xs font-medium ${live ? 'text-emerald-400' : 'text-neutral-400'}`}>
          {statusText(match)}
        </span>
        <span className="flex min-w-0 items-center justify-end gap-2">
          <span className="truncate">{match.homeTeam.shortName}</span>
          <img src={match.homeTeam.crest} alt="" className="size-5 shrink-0" />
        </span>
        <span className={`min-w-12 text-center font-semibold tabular-nums ${live ? 'text-emerald-400' : ''}`}>
          {home ?? '-'} : {away ?? '-'}
        </span>
        <span className="flex min-w-0 items-center gap-2">
          <img src={match.awayTeam.crest} alt="" className="size-5 shrink-0" />
          <span className="truncate">{match.awayTeam.shortName}</span>
        </span>
      </button>
      <AiPrediction match={match} league={league} />
    </li>
  )
}

function TeamBadge({ team }: { team: Team }) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-2">
      <img src={team.crest} alt="" className="size-14" />
      <span className="font-semibold">{team.shortName}</span>
    </div>
  )
}

function MatchDetail({ match, competition, onClose }: { match: Match; competition: Competition; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => dialog.current?.showModal(), [])

  const { home, away } = match.score.fullTime
  const halfTime = match.score.halfTime
  const live = LIVE.has(match.status)
  const facts: [string, string | null | undefined][] = [
    ['Fecha', new Date(match.utcDate).toLocaleString('es-CO', { dateStyle: 'full', timeStyle: 'short' })],
    ['Jornada', match.round],
    ['Estadio', [match.venue?.name, match.venue?.city].filter(Boolean).join(', ')],
    ['Árbitro', match.referee],
    ['Medio tiempo', halfTime?.home != null ? `${halfTime.home} : ${halfTime.away}` : null],
  ]

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      aria-label={`${match.homeTeam.shortName} vs ${match.awayTeam.shortName}`}
      className="m-auto max-h-[90vh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-xl border border-neutral-800 bg-neutral-900 p-5 text-neutral-100 backdrop:bg-black/70"
    >
      <div className="flex items-center justify-between gap-3 text-sm text-neutral-400">
        <span className="flex min-w-0 items-center gap-2">
          <img src={competition.emblem} alt="" className="size-5" />
          <span className="truncate">
            {competition.name} · {competition.area.name}
          </span>
        </span>
        <button
          type="button"
          onClick={() => dialog.current?.close()}
          className="rounded-md px-2 py-1 text-neutral-300 hover:bg-neutral-800"
        >
          Cerrar ✕
        </button>
      </div>

      <div className="mt-6 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4 text-center">
        <TeamBadge team={match.homeTeam} />
        <div>
          <p className={`text-4xl font-bold tabular-nums ${live ? 'text-emerald-400' : ''}`}>
            {home ?? '-'} : {away ?? '-'}
          </p>
          <p className={`mt-1 text-sm ${live ? 'text-emerald-400' : 'text-neutral-400'}`}>
            {statusText(match)}
            {live && match.minute ? ` · ${match.minute}'` : ''}
          </p>
        </div>
        <TeamBadge team={match.awayTeam} />
      </div>

      <dl className="mt-6 grid gap-3 border-t border-neutral-800 pt-4 text-sm sm:grid-cols-2">
        {facts
          .filter(([, value]) => value)
          .map(([label, value]) => (
            <div key={label}>
              <dt className="text-neutral-400">{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
      </dl>

      <div className="mt-6 border-t border-neutral-800 pt-4">
        <AiPrediction match={match} league={competition.name} />
      </div>
    </dialog>
  )
}

export default function App() {
  const [date, setDate] = useState(TODAY)
  const [data, setData] = useState<MatchesResponse | null>(null)
  const [error, setError] = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(null)

  useEffect(() => {
    let current = true // drop answers for a date the user already left
    const load = () =>
      fetch(`/api/matches?date=${date}`)
        .then((response) => {
          if (!response.ok) throw new Error(response.statusText)
          return response.json()
        })
        .then((body: MatchesResponse) => {
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

  const changeDate = (value: string) => {
    if (!value || value < FIRST_DAY || value > LAST_DAY) return // the field can be cleared or typed past min/max
    setDate(value)
    setData(null)
    setError(false)
    setSelectedId(null)
  }

  const selected = data?.competitions
    .flatMap((competition) => competition.matches.map((match) => ({ match, competition })))
    .find(({ match }) => match.id === selectedId)

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-wide">VYROX</h1>
        <label className="flex items-center gap-2 text-sm text-neutral-400">
          Fecha
          <input
            type="date"
            value={date}
            min={FIRST_DAY}
            max={LAST_DAY}
            onChange={(event) => changeDate(event.target.value)}
            className="rounded-md border border-neutral-700 bg-neutral-900 px-2 py-1 text-neutral-100"
          />
        </label>
      </header>

      {data?.sample && (
        <p className="mb-4 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-sm text-amber-300">
          Mostrando datos de ejemplo: falta configurar API_FOOTBALL_KEY en el backend.
        </p>
      )}
      {error && (
        <p role="alert" className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-300">
          No se pudieron cargar los partidos. Se reintentará en un minuto.
        </p>
      )}
      {!data && !error && <p className="text-neutral-400">Cargando partidos…</p>}
      {data?.competitions.length === 0 && <p className="text-neutral-400">No hay partidos en esta fecha.</p>}

      <div className="space-y-6">
        {data?.competitions.map((competition) => (
          <section key={competition.id} className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900">
            <h2 className="flex items-center gap-2 border-b border-neutral-800 px-4 py-3 text-sm font-semibold">
              <img src={competition.emblem} alt="" className="size-5" />
              {competition.name}
              <span className="font-normal text-neutral-400">· {competition.area.name}</span>
            </h2>
            <ul className="divide-y divide-neutral-800">
              {competition.matches.map((match) => (
                <MatchRow
                  key={match.id}
                  match={match}
                  league={competition.name}
                  onSelect={() => setSelectedId(match.id)}
                />
              ))}
            </ul>
          </section>
        ))}
      </div>

      {selected && (
        <MatchDetail match={selected.match} competition={selected.competition} onClose={() => setSelectedId(null)} />
      )}
    </main>
  )
}
