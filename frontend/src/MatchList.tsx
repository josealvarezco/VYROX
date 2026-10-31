import type { ReactNode } from 'react'
import { OddButton } from './BetSlip'
import { Collapse } from './Collapse'
import { Chevron, FlameIcon, ScaleCompareIcon } from './icons'
import { PressureBar } from './Momentum'
import { LIVE, kickoffTime, statusText } from './status'
import type { ForecastMatch, Match } from './types'
import type { useBetSlip } from './useBetSlip'

// Picking matches for the comparator, "¿A cuál le entro?": only those VYROX IA forecast can be compared.
export type Compare = { can: (matchId: number) => boolean; picked: (matchId: number) => boolean; toggle: (matchId: number) => void }
// Quick odds on the rows: the active market's columns, and the forecast of each match that still takes plays.
export type Quick = {
  columns: [keyof ForecastMatch['picks'], string][]
  odds: (match: Match) => ForecastMatch | undefined
  slip: ReturnType<typeof useBetSlip>
}

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
  quick,
}: {
  match: Match
  showLeague: boolean
  onSelect: (match: Match) => void
  goal: boolean
  compare?: Compare
  quick?: Quick
}) {
  const { home, away } = match.score.fullTime
  const live = LIVE.has(match.status)
  const note = match.status === 'TIMED' ? null : live && match.minute ? `${match.minute}'` : statusText(match)
  const forecast = quick?.odds(match)
  const comparable = compare?.can(match.id) ? compare : undefined

  return (
    // The odds and the compare button sit beside the row's button, not inside it: tapping them never opens the match.
    <li
      className={`flex flex-wrap items-center transition-all duration-200 ease-out hover:bg-hover hover:shadow-[inset_3px_0_0_0_#F4D56D] ${
        goal ? 'animate-goal bg-yellow/10' : ''
      }`}
    >
      <button
        type="button"
        onClick={() => onSelect(match)}
        className={`grid min-w-0 grow cursor-pointer items-center gap-2 px-3 py-2.5 text-sm font-medium sm:px-4 ${
          showLeague ? 'grid-cols-[1.25rem_minmax(0,1fr)_6rem_minmax(0,1fr)]' : 'grid-cols-[minmax(0,1fr)_6rem_minmax(0,1fr)]'
        } ${forecast ? 'basis-full @xl:basis-0' : 'basis-0'}`}
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
      {(forecast || comparable) && (
        // On a narrow column the odds drop under the teams, on a line of their own.
        <span className={`ml-auto flex items-center gap-1 pr-2.5 ${forecast ? 'pb-2.5 @xl:pb-0' : ''}`}>
          {forecast &&
            quick &&
            quick.columns.map(([key]) => {
              const pick = forecast.picks[key]
              // A side with no chance has no odd, and a backend older than the page has no such pick: an empty slot keeps the columns in line.
              if (!pick?.odd) return <span key={key} className="w-[52px]" />
              const { market_selection, market_category, odd } = pick
              return (
                <OddButton
                  key={key}
                  pick={{ match_id: match.id, home_team: forecast.home_team, away_team: forecast.away_team, kickoff_label: forecast.kickoff_label, market_selection, market_category, odd }}
                  slip={quick.slip}
                  className="min-w-[52px] px-2.5 py-1.5 text-xs"
                >
                  {odd.toFixed(2)}
                </OddButton>
              )
            })}
          {comparable && <CompareButton matchId={match.id} label={`${match.homeTeam.shortName} vs ${match.awayTeam.shortName}`} compare={comparable} />}
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
  quick,
}: {
  title: ReactNode
  matches: Match[]
  onSelect: (match: Match) => void
  showLeague?: boolean
  collapsed?: boolean
  onToggle?: () => void
  scored?: (matchId: number) => boolean // matches that just scored, which glow for a few seconds
  compare?: Compare
  quick?: Quick
}) {
  const header = 'flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm font-bold tracking-tight'
  // The quick odds' column names right over the rows' odds, while the card is open and any of its matches has them:
  // in the header on a wide column, and on a line of their own under it on a narrow one, where the odds drop too.
  const columns = !collapsed && quick && matches.some(quick.odds) ? quick.columns : []
  const labels = (className: string) =>
    columns.length > 0 && (
      <span aria-hidden="true" className={`gap-1 font-num text-[11px] font-semibold text-muted ${className}`}>
        {columns.map(([key, label]) => (
          <span key={key} className="w-[52px] text-center">
            {label}
          </span>
        ))}
      </span>
    )
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
            <span className="ml-auto flex items-center gap-2.5">
              {labels('hidden @xl:flex')}
              <Chevron direction={collapsed ? 'down' : 'up'} className="text-muted" />
            </span>
          </button>
        ) : (
          <span className={header}>
            {title}
            {/* An empty slot in the chevron's place keeps the column names over the odds. */}
            {columns.length > 0 && (
              <span className="ml-auto hidden items-center gap-2.5 @xl:flex">
                {labels('flex')}
                <span className="size-4" />
              </span>
            )}
          </span>
        )}
      </h2>
      {labels('-mt-2 flex justify-end pr-10.5 pb-1.5 @xl:hidden')}
      <Collapse open={!collapsed}>
        <ul className="divide-y divide-line border-t border-line">
          {matches.map((match) => (
            <MatchRow key={match.id} match={match} showLeague={showLeague} onSelect={onSelect} goal={scored?.(match.id) ?? false} compare={compare} quick={quick} />
          ))}
        </ul>
      </Collapse>
    </section>
  )
}
