import { useEffect, useState } from 'react'
import { AiPrediction } from './AiPrediction'
import { MatchCenter } from './MatchCenter'
import { LIVE, statusText } from './status'
import type { Match, MatchesResponse } from './types'

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
        <MatchCenter
          key={selected.match.id}
          match={selected.match}
          competition={selected.competition}
          onClose={() => setSelectedId(null)}
        />
      )}
    </main>
  )
}
