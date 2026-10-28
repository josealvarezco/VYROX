import { useEffect, useState, type ReactNode } from 'react'
import { Chevron, FilterIcon, Flag } from './icons'
import { TOP_LEAGUES, countryLabel, fold } from './leagues'
import { MatchCard } from './MatchList'
import { MatchCenter } from './MatchCenter'
import { Sidebar } from './Sidebar'
import { LIVE } from './status'
import type { Match, MatchesResponse, Team } from './types'
import { useFollowed } from './useFollowed'

// Cheap: the backend answers from its cache, so polling never spends API-Football quota.
const REFRESH_MS = 60_000

// The backend picks matches by Colombia's date, so the date bar uses that day too.
const TODAY = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' })

function shiftDay(day: string, offset: number) {
  const date = new Date(`${day}T12:00:00Z`)
  date.setUTCDate(date.getUTCDate() + offset)
  return date.toISOString().slice(0, 10)
}

// API-Football's free plan only serves yesterday, today and tomorrow (the backend rejects other dates).
const DAYS = { [shiftDay(TODAY, -1)]: 'Ayer', [TODAY]: 'Hoy', [shiftDay(TODAY, 1)]: 'Mañana' }
const FILTERS = ['Todos', 'En vivo', 'Por horario'] as const

function Message({ children, alert = false }: { children: ReactNode; alert?: boolean }) {
  return (
    <p
      role={alert ? 'alert' : undefined}
      className={`rounded-xl border px-4 py-3 text-sm ${
        alert ? 'border-red-500/40 bg-red-500/10 text-red-300' : 'border-neutral-800 bg-neutral-900 text-neutral-400'
      }`}
    >
      {children}
    </p>
  )
}

export default function App() {
  const [date, setDate] = useState(TODAY)
  const [data, setData] = useState<MatchesResponse | null>(null)
  const [error, setError] = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('Todos')
  const [query, setQuery] = useState('')
  const [league, setLeague] = useState<number | null>(null)
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set())
  const [showSidebar, setShowSidebar] = useState(false)
  const followed = useFollowed()

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

  const changeDay = (offset: number) => {
    const next = shiftDay(date, offset)
    if (!(next in DAYS)) return
    setDate(next)
    setData(null)
    setError(false)
    setSelectedId(null)
  }

  const pickLeague = (id: number | null) => {
    setLeague(id)
    setShowSidebar(false)
    window.scrollTo({ top: 0 })
  }

  const pickTeam = (team: Team) => {
    setQuery(team.shortName)
    setLeague(null)
    setShowSidebar(false)
  }

  const toggleCollapsed = (id: number) =>
    setCollapsed((current) => {
      const next = new Set(current)
      if (!next.delete(id)) next.add(id)
      return next
    })

  const allGroups = data?.competitions ?? []
  const search = fold(query.trim())
  const groups = allGroups
    .filter((group) => league === null || group.league_id === league)
    .map((group) => ({
      ...group,
      matches: group.matches.filter(
        (match) =>
          (filter !== 'En vivo' || LIVE.has(match.status)) &&
          (!search ||
            fold(`${match.homeTeam.shortName} ${match.awayTeam.shortName} ${group.league_name} ${countryLabel(group.country)}`).includes(search)),
      ),
    }))
    .filter((group) => group.matches.length)
  const shown = groups.flatMap((group) => group.matches)
  const following = shown.filter((match) => followed.isFollowed(match.homeTeam.id) || followed.isFollowed(match.awayTeam.id))
  const liveCount = allGroups.reduce((count, group) => count + group.matches.filter((match) => LIVE.has(match.status)).length, 0)
  const leagueName =
    allGroups.find((group) => group.league_id === league)?.league_name ?? TOP_LEAGUES.find(({ id }) => id === league)?.name
  const selected = allGroups
    .flatMap((competition) => competition.matches.map((match) => ({ match, competition })))
    .find(({ match }) => match.id === selectedId)
  const open = (match: Match) => setSelectedId(match.id)

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <header className="mb-5 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-wide">VYROX</h1>
        <button
          type="button"
          onClick={() => setShowSidebar(!showSidebar)}
          aria-expanded={showSidebar}
          className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm text-neutral-200 hover:bg-neutral-800 md:hidden"
        >
          Ligas y equipos
        </button>
      </header>

      <div className="md:grid md:grid-cols-[280px_minmax(0,1fr)] md:items-start md:gap-6">
        <aside
          className={`${showSidebar ? 'mb-5 block' : 'hidden'} md:sticky md:top-6 md:block md:max-h-[calc(100vh-3rem)] md:overflow-y-auto`}
        >
          <Sidebar
            groups={allGroups}
            league={league}
            onLeague={pickLeague}
            followed={followed.teams}
            onUnfollow={followed.toggle}
            onTeam={pickTeam}
          />
        </aside>

        <main className="min-w-0 space-y-4">
          <div className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900 p-2">
            <button
              type="button"
              onClick={() => changeDay(-1)}
              disabled={!(shiftDay(date, -1) in DAYS)}
              aria-label="Día anterior"
              className="rounded-md p-2 hover:bg-neutral-800 disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <Chevron direction="left" className="size-5" />
            </button>
            <p className="text-center">
              <span className="block font-semibold">{DAYS[date]}</span>
              <span className="block text-xs text-neutral-400">
                {new Date(`${date}T12:00:00`).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
              </span>
            </p>
            <button
              type="button"
              onClick={() => changeDay(1)}
              disabled={!(shiftDay(date, 1) in DAYS)}
              aria-label="Día siguiente"
              className="rounded-md p-2 hover:bg-neutral-800 disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <Chevron direction="right" className="size-5" />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {FILTERS.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => setFilter(name)}
                aria-pressed={filter === name}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm ${
                  filter === name ? 'border-violet-400 bg-violet-500/15 text-white' : 'border-neutral-700 text-neutral-300 hover:bg-neutral-800'
                }`}
              >
                {name === 'En vivo' && <span aria-hidden="true" className="size-2 animate-pulse rounded-full bg-red-500" />}
                {name}
                {name === 'En vivo' && liveCount > 0 && <span className="text-neutral-400">{liveCount}</span>}
              </button>
            ))}
            <label className="flex w-full min-w-0 items-center gap-2 rounded-full border border-neutral-700 bg-neutral-900 px-3 py-1 text-sm sm:ml-auto sm:w-auto sm:max-w-64 sm:flex-1">
              <FilterIcon />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Filtro"
                aria-label="Buscar equipo o liga"
                className="w-full min-w-0 bg-transparent outline-none placeholder:text-neutral-500"
              />
            </label>
          </div>

          {league !== null && (
            <p className="flex items-center gap-2 text-sm text-neutral-400">
              Mostrando <span className="font-semibold text-neutral-100">{leagueName}</span>
              <button type="button" onClick={() => pickLeague(null)} className="text-violet-300 hover:underline">
                Ver todas
              </button>
            </p>
          )}

          {data?.sample && <Message>Mostrando datos de ejemplo: falta configurar API_FOOTBALL_KEY en el backend.</Message>}
          {error && <Message alert>No se pudieron cargar los partidos. Se reintentará en un minuto.</Message>}
          {!data && !error && <Message>Cargando partidos…</Message>}
          {data && allGroups.length === 0 && <Message>No hay partidos en esta fecha.</Message>}
          {data && allGroups.length > 0 && shown.length === 0 && (
            <Message>
              {league !== null && !search && filter !== 'En vivo'
                ? `No hay partidos de ${leagueName} en esta fecha.`
                : 'Ningún partido coincide con los filtros.'}
            </Message>
          )}

          {following.length > 0 && (
            <MatchCard title={<span className="text-amber-300">★ Siguiendo</span>} matches={following} onSelect={open} showLeague />
          )}

          {filter === 'Por horario'
            ? shown.length > 0 && (
                <MatchCard
                  title="Por horario"
                  matches={[...shown].sort((a, b) => Date.parse(a.utcDate) - Date.parse(b.utcDate))}
                  onSelect={open}
                  showLeague
                />
              )
            : groups.map((group) => (
                <MatchCard
                  key={group.league_id}
                  title={
                    <>
                      <Flag country={group.country} flag={group.country_flag} />
                      <span className="truncate">
                        {countryLabel(group.country)} - {group.league_name}
                      </span>
                    </>
                  }
                  matches={group.matches}
                  onSelect={open}
                  collapsed={collapsed.has(group.league_id)}
                  onToggle={() => toggleCollapsed(group.league_id)}
                />
              ))}
        </main>
      </div>

      {selected && (
        <MatchCenter
          key={selected.match.id}
          match={selected.match}
          competition={selected.competition}
          isFollowed={followed.isFollowed}
          onFollow={followed.toggle}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  )
}
