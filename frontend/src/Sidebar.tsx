import { useState, type ReactNode } from 'react'
import { Chevron, FilterIcon, Flag } from './icons'
import { TOP_LEAGUES, WORLD, countryLabel, fold, leagueLogo } from './leagues'
import type { Competition, Team } from './types'

function Card({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-neutral-800 bg-neutral-900 p-3">
      <div className="mb-2 flex items-center justify-between gap-2 px-1">
        <h2 className="text-sm font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

function LeagueButton({ name, logo, selected, onClick }: { name: string; logo: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm ${
        selected ? 'bg-violet-500/15 text-violet-200' : 'text-neutral-200 hover:bg-neutral-800'
      }`}
    >
      <img src={logo} alt="" className="size-6 shrink-0 rounded-md bg-white/90 object-contain p-0.5" />
      <span className="truncate">{name}</span>
    </button>
  )
}

function AllLeagues({ groups, league, onLeague }: { groups: Competition[]; league: number | null; onLeague: (id: number) => void }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState<Set<string>>(new Set())
  const search = fold(query.trim())

  const countries = new Map<string, Competition[]>()
  for (const group of groups) countries.set(group.country, [...(countries.get(group.country) ?? []), group])
  const shown = [...countries]
    .map(([country, leagues]) => ({
      country,
      flag: leagues[0].country_flag,
      // A country that matches keeps all its leagues; otherwise only the leagues that match stay.
      leagues: !search || fold(countryLabel(country)).includes(search) ? leagues : leagues.filter((g) => fold(g.league_name).includes(search)),
    }))
    .filter(({ leagues }) => leagues.length)
    .sort((a, b) => Number(b.country === WORLD) - Number(a.country === WORLD) || countryLabel(a.country).localeCompare(countryLabel(b.country), 'es'))

  const toggle = (country: string) =>
    setOpen((current) => {
      const next = new Set(current)
      if (!next.delete(country)) next.add(country)
      return next
    })

  return (
    <Card title="Todas las ligas">
      <label className="mb-2 flex items-center gap-2 rounded-md border border-neutral-700 bg-neutral-950 px-2 py-1.5 text-sm">
        <FilterIcon />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Filtro"
          aria-label="Filtrar países y ligas"
          className="w-full bg-transparent outline-none placeholder:text-neutral-500"
        />
      </label>
      {shown.length === 0 && <p className="px-1 py-2 text-xs text-neutral-400">Ningún país o liga coincide.</p>}
      <ul className="space-y-0.5">
        {shown.map(({ country, flag, leagues }) => {
          const expanded = search !== '' || open.has(country)
          return (
            <li key={country}>
              <button
                type="button"
                onClick={() => toggle(country)}
                aria-expanded={expanded}
                className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm hover:bg-neutral-800"
              >
                <Flag country={country} flag={flag} />
                <span className="flex-1 truncate">{countryLabel(country)}</span>
                <Chevron direction={expanded ? 'up' : 'down'} className="text-neutral-500" />
              </button>
              {expanded && (
                <ul className="mb-1 ml-6 space-y-0.5 border-l border-neutral-800 pl-2">
                  {leagues.map((group) => (
                    <li key={group.league_id}>
                      <LeagueButton
                        name={group.league_name}
                        logo={group.league_logo}
                        selected={league === group.league_id}
                        onClick={() => onLeague(group.league_id)}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </li>
          )
        })}
      </ul>
    </Card>
  )
}

export function Sidebar({
  groups,
  league,
  onLeague,
  followed,
  onUnfollow,
  onTeam,
}: {
  groups: Competition[]
  league: number | null
  onLeague: (id: number | null) => void
  followed: Team[]
  onUnfollow: (team: Team) => void
  onTeam: (team: Team) => void
}) {
  return (
    <div className="space-y-4">
      <Card title="Equipos seguidos">
        {followed.length ? (
          <ul className="space-y-0.5">
            {followed.map((team) => (
              <li key={team.id} className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onTeam(team)}
                  className="flex min-w-0 flex-1 items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm hover:bg-neutral-800"
                >
                  <img src={team.crest} alt="" className="size-5 shrink-0 object-contain" />
                  <span className="truncate">{team.shortName}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onUnfollow(team)}
                  aria-label={`Dejar de seguir a ${team.shortName}`}
                  className="rounded-md px-2 py-1 text-amber-400 hover:bg-neutral-800"
                >
                  ★
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-1 text-xs text-neutral-400">Abre un partido y toca ☆ junto a un equipo para seguirlo.</p>
        )}
      </Card>

      <Card
        title="Mejores ligas"
        action={
          league !== null && (
            <button type="button" onClick={() => onLeague(null)} className="text-xs text-violet-300 hover:underline">
              Ver todas
            </button>
          )
        }
      >
        <ul className="space-y-0.5">
          {TOP_LEAGUES.map(({ id, name }) => (
            <li key={id}>
              <LeagueButton name={name} logo={leagueLogo(id)} selected={league === id} onClick={() => onLeague(id)} />
            </li>
          ))}
        </ul>
      </Card>

      <AllLeagues groups={groups} league={league} onLeague={onLeague} />
    </div>
  )
}
