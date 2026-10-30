import type { ReactNode } from 'react'
import { Collapse } from './Collapse'
import { Chevron, FlameIcon, ScaleCompareIcon } from './icons'
import { PressureBar } from './Momentum'
import { LIVE, kickoffTime, statusText } from './status'
import type { Match } from './types'

// Picking matches for the comparator, "¿A cuál le entro?": only those VYROX IA forecast can be compared.
export type Compare = { can: (matchId: number) => boolean; picked: (matchId: number) => boolean; toggle: (matchId: number) => void }

export function CompareButton({ matchId, label, compare }: { matchId: number; label: string; compare: Compare }) {
  const picked = compare.picked(matchId)
  return (
    <button
      type="button"
      onClick={() => compare.toggle(matchId)}
      aria-pressed={picked}
      aria-label={`Comparar ${label}`}
      title="Comparar partido"
      className={`grid size-7 shrink-0 cursor-pointer place-items-center rounded-full border transition-all duration-200 ease-out active:scale-[0.95] ${
        picked ? 'border-yellow bg-yellow text-forest' : 'border-line bg-surface text-muted hover:border-yellow hover:text-ink'
      }`}
    >
      <ScaleCompareIcon className="size-4" />
    </button>
  )
}

function MatchRow({
  match,
  showLeague,
  onSelect,
  goal,
  compare,
}: {
  match: Match
  showLeague: boolean
  onSelect: (match: Match) => void
  goal: boolean
  compare?: Compare
}) {
  const { home, away } = match.score.fullTime
  const live = LIVE.has(match.status)
  const note = match.status === 'TIMED' ? null : live && match.minute ? `${match.minute}'` : statusText(match)

  return (
    <li className="relative">
      <button
        type="button"
        onClick={() => onSelect(match)}
        className={`grid w-full cursor-pointer items-center gap-2 px-3 py-2.5 text-sm font-medium transition-all duration-200 ease-out hover:bg-hover hover:shadow-[inset_3px_0_0_0_#F4D56D] sm:px-4 ${
          showLeague ? 'grid-cols-[1.25rem_minmax(0,1fr)_6rem_minmax(0,1fr)]' : 'grid-cols-[minmax(0,1fr)_6rem_minmax(0,1fr)]'
        } ${goal ? 'animate-goal bg-yellow/10' : ''} ${compare?.can(match.id) ? 'pr-11 sm:pr-11' : ''}`}
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
        <span className="flex flex-col items-center gap-0.5 leading-tight">
          {home === null ? (
            <span className="rounded-full bg-chip px-2 py-0.5 font-num text-xs font-semibold whitespace-nowrap text-cream">
              {kickoffTime(match)}
            </span>
          ) : (
            <span className="font-num font-bold tabular-nums">
              {home} - {away}
            </span>
          )}
          {(note || goal) && (
            <span className="flex items-center gap-1">
              {note && (
                <span className={`text-[11px] ${live ? 'rounded-full bg-orange px-1.5 font-num font-bold text-forest' : 'text-muted'}`}>
                  {note}
                </span>
              )}
              {goal && <span className="animate-pulse rounded-full bg-yellow px-1.5 text-[11px] font-extrabold text-forest">¡GOL!</span>}
              {match.momentum_status === 'high_voltage' && <FlameIcon className="size-3.5" label="Partido caliente" />}
            </span>
          )}
          {live && match.home_pressure !== undefined && (
            <PressureBar home={match.home_pressure} away={match.away_pressure ?? 0} className="mt-0.5 h-1 w-16" />
          )}
        </span>
        <span className="flex min-w-0 items-center gap-2">
          <img src={match.awayTeam.crest} alt="" className="size-5 shrink-0 object-contain" />
          <span className="truncate">{match.awayTeam.shortName}</span>
        </span>
      </button>
      {compare?.can(match.id) && (
        <span className="absolute top-1/2 right-2 -translate-y-1/2">
          <CompareButton matchId={match.id} label={`${match.homeTeam.shortName} vs ${match.awayTeam.shortName}`} compare={compare} />
        </span>
      )}
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
  scored,
  compare,
}: {
  title: ReactNode
  matches: Match[]
  onSelect: (match: Match) => void
  showLeague?: boolean
  collapsed?: boolean
  onToggle?: () => void
  scored?: (matchId: number) => boolean // matches that just scored, which glow for a few seconds
  compare?: Compare
}) {
  const header = 'flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm font-bold tracking-tight'
  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-surface">
      <h2>
        {onToggle ? (
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={!collapsed}
            className={`${header} cursor-pointer transition-all duration-200 ease-out hover:bg-surface-2/60`}
          >
            {title}
            <Chevron direction={collapsed ? 'down' : 'up'} className="ml-auto text-muted" />
          </button>
        ) : (
          <span className={header}>{title}</span>
        )}
      </h2>
      <Collapse open={!collapsed}>
        <ul className="divide-y divide-line border-t border-line">
          {matches.map((match) => (
            <MatchRow key={match.id} match={match} showLeague={showLeague} onSelect={onSelect} goal={scored?.(match.id) ?? false} compare={compare} />
          ))}
        </ul>
      </Collapse>
    </section>
  )
}
