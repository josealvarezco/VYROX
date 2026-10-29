import { useEffect, useState, type MouseEvent, type ReactNode } from 'react'
import { BetSlip } from './BetSlip'
import { CalendarIcon, Chevron, FilterIcon, Flag, StarIcon } from './icons'
import { TOP_LEAGUES, countryLabel, fold } from './leagues'
import { MatchCard } from './MatchList'
import { MatchCenter } from './MatchCenter'
import { Parlays } from './Parlays'
import { Sidebar } from './Sidebar'
import { LIVE } from './status'
import { ThemeToggle } from './ThemeToggle'
import type { Match, MatchesResponse, Team } from './types'
import { useBetSlip } from './useBetSlip'
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

const longDate = (day: string) =>
  new Date(`${day}T12:00:00`).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })
const shortWeekday = (day: string) =>
  new Date(`${day}T12:00:00`).toLocaleDateString('es-CO', { weekday: 'short' }).replace('.', '')

function Message({ children, alert = false }: { children: ReactNode; alert?: boolean }) {
  return (
    <p
      role={alert ? 'alert' : undefined}
      className={`rounded-2xl border px-4 py-3 text-sm ${
        alert ? 'border-orange/50 bg-orange/10 text-ink' : 'border-line bg-surface text-muted'
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
  const [sidebarKey, setSidebarKey] = useState(0)
  const [parlaysOpen, setParlaysOpen] = useState(true)
  const followed = useFollowed()
  const slip = useBetSlip()
  const { track } = slip

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
          track(body.competitions.flatMap((group) => group.matches)) // settles registered plays with these scores
        })
        .catch(() => current && setError(true))
    load()
    const id = setInterval(load, REFRESH_MS)
    return () => {
      current = false
      clearInterval(id)
    }
  }, [date, track])

  const goTo = (day: string) => {
    if (!(day in DAYS) || day === date) return
    setDate(day)
    setData(null)
    setError(false)
    setSelectedId(null)
  }

  // The logo is a home link: a plain click resets the screen in place, a modified click still opens a new tab.
  const resetAll = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    goTo(TODAY)
    setSelectedId(null)
    setLeague(null)
    setQuery('')
    setFilter('Todos')
    setCollapsed(new Set())
    setParlaysOpen(true)
    setShowSidebar(false)
    setSidebarKey((key) => key + 1) // remounting the sidebar clears its filter and closes its countries
    window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
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
      <header className="hero mb-5 flex items-center justify-between gap-3 rounded-3xl px-5 py-5 sm:px-7">
        <a
          href="/"
          onClick={resetAll}
          aria-label="VYROX: volver al inicio"
          className="cursor-pointer rounded-xl transition-all duration-200 hover:opacity-90 active:scale-[0.99]"
        >
          <h1 className="text-2xl leading-none font-extrabold sm:text-3xl">
            VYRO<span className="text-yellow">X</span>
          </h1>
          <p className="mt-1.5 hidden text-sm text-cream/70 sm:block">Analítica de fútbol en tiempo real</p>
        </a>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowSidebar(!showSidebar)}
            aria-expanded={showSidebar}
            className="cursor-pointer rounded-full border border-cream/25 px-3 py-1.5 text-sm font-semibold whitespace-nowrap transition-all duration-200 ease-out hover:bg-cream/10 active:scale-[0.98] md:hidden"
          >
            Ligas y equipos
          </button>
          <ThemeToggle />
        </div>
      </header>

      <div className="md:grid md:grid-cols-[280px_minmax(0,1fr)] md:items-start md:gap-6">
        <aside
          className={`${showSidebar ? 'mb-5 block' : 'hidden'} md:sticky md:top-6 md:block md:max-h-[calc(100vh-3rem)] md:overflow-y-auto`}
        >
          <Sidebar
            key={sidebarKey}
            groups={allGroups}
            league={league}
            onLeague={pickLeague}
            followed={followed.teams}
            onUnfollow={followed.toggle}
            onTeam={pickTeam}
          />
        </aside>

        <main className="min-w-0 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-line bg-surface p-4">
            <p>
              <span className="flex items-center gap-1.5 text-lg leading-tight font-bold tracking-tight">
                <CalendarIcon className="size-5 text-muted" />
                {DAYS[date]}
              </span>
              <span className="block text-sm text-muted">{longDate(date)}</span>
            </p>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => goTo(shiftDay(date, -1))}
                disabled={!(shiftDay(date, -1) in DAYS)}
                aria-label="Día anterior"
                className="grid size-9 cursor-pointer place-items-center rounded-full transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-surface-2 active:translate-y-0 disabled:cursor-default disabled:opacity-30 disabled:hover:translate-y-0 disabled:hover:bg-transparent"
              >
                <Chevron direction="left" className="size-5" />
              </button>
              {Object.entries(DAYS).map(([day, label]) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => goTo(day)}
                  aria-pressed={day === date}
                  aria-label={`${label}, ${longDate(day)}`}
                  className={`flex w-14 cursor-pointer flex-col items-center rounded-2xl py-2 transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 ${
                    day === date ? 'bg-yellow text-forest' : 'bg-chip text-cream hover:opacity-85'
                  }`}
                >
                  <span className="font-num text-2xl leading-none font-bold">{day.slice(8)}</span>
                  <span className="mt-1 text-[11px] font-bold uppercase">{shortWeekday(day)}</span>
                </button>
              ))}
              <button
                type="button"
                onClick={() => goTo(shiftDay(date, 1))}
                disabled={!(shiftDay(date, 1) in DAYS)}
                aria-label="Día siguiente"
                className="grid size-9 cursor-pointer place-items-center rounded-full transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-surface-2 active:translate-y-0 disabled:cursor-default disabled:opacity-30 disabled:hover:translate-y-0 disabled:hover:bg-transparent"
              >
                <Chevron direction="right" className="size-5" />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {FILTERS.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => setFilter(name)}
                aria-pressed={filter === name}
                className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-all duration-200 ease-out hover:scale-[1.02] active:scale-[0.98] ${
                  filter === name ? 'border-yellow bg-yellow text-forest' : 'border-line bg-surface text-ink hover:bg-surface-2'
                }`}
              >
                {name === 'En vivo' && <span aria-hidden="true" className="size-2 animate-pulse rounded-full bg-orange" />}
                {name}
                {name === 'En vivo' && liveCount > 0 && <span className="font-num opacity-70">{liveCount}</span>}
              </button>
            ))}
            <label className="flex w-full min-w-0 items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm sm:ml-auto sm:w-auto sm:max-w-64 sm:flex-1">
              <FilterIcon />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Filtro"
                aria-label="Buscar equipo o liga"
                className="w-full min-w-0 bg-transparent outline-none placeholder:text-muted"
              />
            </label>
          </div>

          {league !== null && (
            <p className="flex items-center gap-2 text-sm text-muted">
              Mostrando <span className="font-semibold text-ink">{leagueName}</span>
              <button type="button" onClick={() => pickLeague(null)} className="cursor-pointer font-semibold text-gold hover:underline">
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

          {/* Home view only, and once the list is in: the backend then builds the slips from its cache without spending quota. */}
          {data && allGroups.length > 0 && filter === 'Todos' && league === null && !search && (
            <Parlays
              date={date}
              slip={slip}
              onSelect={setSelectedId}
              open={parlaysOpen}
              onToggle={() => setParlaysOpen(!parlaysOpen)}
            />
          )}

          {following.length > 0 && (
            <MatchCard
              title={
                <span className="inline-flex items-center gap-1.5 text-gold">
                  <StarIcon filled />
                  Siguiendo
                </span>
              }
              matches={following}
              onSelect={open}
              showLeague
            />
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
          slip={slip}
        />
      )}
      {/* With a match open, the Match Center docks the slip itself, above its blur. */}
      {!selected && <BetSlip slip={slip} />}
    </div>
  )
}
