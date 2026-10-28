import { useState, type ReactNode } from 'react'
import { Collapse } from './Collapse'
import { Chevron, FilterIcon, Flag, StarIcon } from './icons'
import { TOP_LEAGUES, WORLD, countryLabel, fold, leagueLogo } from './leagues'
import type { Competition, Team } from './types'

function Card({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-surface p-3">
      <div className="mb-2 flex items-center justify-between gap-2 px-1">
        <h2 className="text-sm font-bold">{title}</h2>
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
      className={`flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-2 py-1.5 text-left text-sm transition-all duration-200 ease-out ${
        selected ? 'bg-yellow font-bold text-forest' : 'text-ink hover:bg-surface-2'
      }`}
    >
      <img src={logo} alt="" loading="lazy" className="size-6 shrink-0 rounded-md bg-white/90 object-contain p-0.5" />
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
      <label className="mb-2 flex items-center gap-2 rounded-full border border-line bg-surface-2 px-2 py-1.5 text-sm">
        <FilterIcon />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Filtro"
          aria-label="Filtrar países y ligas"
          className="w-full bg-transparent outline-none placeholder:text-muted"
        />
      </label>
      {shown.length === 0 && <p className="px-1 py-2 text-xs text-muted">Ningún país o liga coincide.</p>}
      <ul className="space-y-0.5">
        {shown.map(({ country, flag, leagues }) => {
          const expanded = search !== '' || open.has(country)
          return (
            <li key={country}>
              <button
                type="button"
                onClick={() => toggle(country)}
                aria-expanded={expanded}
                className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-2 py-1.5 text-left text-sm transition-all duration-200 ease-out hover:bg-surface-2"
              >
                <Flag country={country} flag={flag} />
                <span className="flex-1 truncate">{countryLabel(country)}</span>
                <Chevron direction={expanded ? 'up' : 'down'} className="text-muted" />
              </button>
              <Collapse open={expanded}>
                <ul className="ml-6 space-y-0.5 border-l border-line pt-0.5 pb-1 pl-2">
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
              </Collapse>
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
                  className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 rounded-xl px-2 py-1.5 text-left text-sm transition-all duration-200 ease-out hover:bg-surface-2"
                >
                  <img src={team.crest} alt="" className="size-5 shrink-0 object-contain" />
                  <span className="truncate">{team.shortName}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onUnfollow(team)}
                  aria-label={`Dejar de seguir a ${team.shortName}`}
                  className="cursor-pointer rounded-xl px-2 py-1.5 text-gold transition-all duration-200 ease-out hover:bg-surface-2 active:scale-[0.98]"
                >
                  <StarIcon filled />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-1 text-xs text-muted">
            Abre un partido y toca <StarIcon className="inline-block size-3.5 align-[-2px]" /> junto a un equipo para seguirlo.
          </p>
        )}
      </Card>

      <Card
        title="Mejores ligas"
        action={
          league !== null && (
            <button type="button" onClick={() => onLeague(null)} className="cursor-pointer text-xs font-semibold text-gold hover:underline">
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
