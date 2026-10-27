import { useEffect, useState } from 'react'

type Team = { id: number; shortName: string; crest: string }
type Match = {
  id: number
  utcDate: string
  status: string
  homeTeam: Team
  awayTeam: Team
  score: { fullTime: { home: number | null; away: number | null } }
}
type Competition = { id: number; name: string; emblem: string; area: { name: string }; matches: Match[] }
type MatchesResponse = { sample: boolean; competitions: Competition[] }

// Cheap: the backend answers from its cache, so polling never spends API-Football quota.
const REFRESH_MS = 60_000

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

function MatchRow({ match }: { match: Match }) {
  const { home, away } = match.score.fullTime
  const live = LIVE.has(match.status)
  return (
    <li className="grid grid-cols-[4.75rem_minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 px-3 py-3 sm:gap-3 sm:px-4">
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
    </li>
  )
}

export default function App() {
  const [data, setData] = useState<MatchesResponse | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    const load = () =>
      fetch('/api/matches')
        .then((response) => {
          if (!response.ok) throw new Error(response.statusText)
          return response.json()
        })
        .then((body: MatchesResponse) => {
          setData(body)
          setError(false)
        })
        .catch(() => setError(true))
    load()
    const id = setInterval(load, REFRESH_MS)
    return () => clearInterval(id)
  }, [])

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold tracking-wide">VYROX</h1>

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
      {data?.competitions.length === 0 && <p className="text-neutral-400">No hay partidos hoy.</p>}

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
                <MatchRow key={match.id} match={match} />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  )
}
