import type { ReactNode } from 'react'
import { Chevron } from './icons'
import { LIVE, kickoffTime, statusText } from './status'
import type { Match } from './types'

function MatchRow({ match, showLeague, onSelect }: { match: Match; showLeague: boolean; onSelect: (match: Match) => void }) {
  const { home, away } = match.score.fullTime
  const live = LIVE.has(match.status)
  const note = match.status === 'TIMED' ? null : live && match.minute ? `${match.minute}'` : statusText(match)

  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(match)}
        className={`grid w-full items-center gap-2 px-3 py-2.5 text-sm hover:bg-neutral-800/60 sm:px-4 ${
          showLeague ? 'grid-cols-[1.25rem_minmax(0,1fr)_5rem_minmax(0,1fr)]' : 'grid-cols-[minmax(0,1fr)_5rem_minmax(0,1fr)]'
        }`}
      >
        {showLeague && (
          <img
            src={match.league.league_logo}
            alt={match.league.league_name}
            title={match.league.league_name}
            className="size-5 rounded bg-white/90 object-contain p-px"
          />
        )}
        <span className="flex min-w-0 items-center justify-end gap-2">
          <span className="truncate">{match.homeTeam.shortName}</span>
          <img src={match.homeTeam.crest} alt="" className="size-5 shrink-0 object-contain" />
        </span>
        <span className="text-center leading-tight">
          <span className={`block font-semibold tabular-nums ${live ? 'text-emerald-400' : ''}`}>
            {home === null ? kickoffTime(match) : `${home} - ${away}`}
          </span>
          {note && <span className={`block text-[11px] ${live ? 'text-emerald-400' : 'text-neutral-400'}`}>{note}</span>}
        </span>
        <span className="flex min-w-0 items-center gap-2">
          <img src={match.awayTeam.crest} alt="" className="size-5 shrink-0 object-contain" />
          <span className="truncate">{match.awayTeam.shortName}</span>
        </span>
      </button>
    </li>
  )
}

export function MatchCard({
  title,
  matches,
  onSelect,
  showLeague = false,
  collapsed = false,
  onToggle,
}: {
  title: ReactNode
  matches: Match[]
  onSelect: (match: Match) => void
  showLeague?: boolean
  collapsed?: boolean
  onToggle?: () => void
}) {
  const header = 'flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm font-semibold'
  return (
    <section className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900">
      <h2 className={collapsed ? '' : 'border-b border-neutral-800'}>
        {onToggle ? (
          <button type="button" onClick={onToggle} aria-expanded={!collapsed} className={`${header} hover:bg-neutral-800/40`}>
            {title}
            <Chevron direction={collapsed ? 'down' : 'up'} className="ml-auto text-neutral-400" />
          </button>
        ) : (
          <span className={header}>{title}</span>
        )}
      </h2>
      {!collapsed && (
        <ul className="divide-y divide-neutral-800">
          {matches.map((match) => (
            <MatchRow key={match.id} match={match} showLeague={showLeague} onSelect={onSelect} />
          ))}
        </ul>
      )}
    </section>
  )
}
