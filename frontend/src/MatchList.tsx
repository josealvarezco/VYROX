import type { ReactNode } from 'react'
import { OddButton } from './BetSlip'
import { Collapse } from './Collapse'
import { Chevron, FlameIcon, GridMultiViewIcon, LockClosedIcon, PinIcon, ScaleCompareIcon } from './icons'
import { PressureBar } from './Momentum'
import { fitModel } from './sameGameParlay'
import { LIVE, hasOdds, kickoffLabel, kickoffTime, statusText } from './status'
import { COLUMN_WON } from './ticketSettlement'
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
// Pinning a match on top of the list.
export type Pin = { pinned: (matchId: number) => boolean; toggle: (matchId: number) => void }
// Adding a match to the Multivista's grid.
export type Multi = { has: (matchId: number) => boolean; full: boolean; toggle: (matchId: number) => void }

// A match's boxes in the active market: odds to tap before kickoff and in play (with a green dot), a lock on a
// suspended side and in the closing stretch, and the options to read once finished, with the winner in green.
export function QuickOdds({ match, quick, slot, button, labeled = false }: { match: Match; quick: Quick; slot: string; button: string; labeled?: boolean }) {
  const { home, away } = match.score.fullTime
  const live = LIVE.has(match.status)
  const forecast = quick.odds(match)
  const picks = live ? match.live_picks : forecast?.picks
  // The match's model goes with each pre-match odd, to price picks of one match as a Crear Apuesta in the slip; in
  // play the score has left it behind.
  const model = !live && picks?.home && picks.away && picks.over_2_5 ? fitModel(picks.home.probability, picks.away.probability, picks.over_2_5.probability) : undefined
  return quick.columns.map(([key, label]) => {
    if (match.status === 'FINISHED' && home !== null && away !== null) {
      const won = COLUMN_WON[key]?.(home, away)
      return (
        <span key={key} className={`rounded-xl border text-center font-num font-bold ${won ? 'border-[#22C55E] bg-[#22C55E]/20 text-ink' : 'border-line text-muted'} ${button}`}>
          {label}
          {won && <span className="sr-only">, ganadora</span>}
        </span>
      )
    }
    const pick = picks?.[key]
    const box = pick?.odd ? (
      <OddButton
        key={key}
        pick={{
          match_id: match.id,
          home_team: match.homeTeam.shortName,
          away_team: match.awayTeam.shortName,
          kickoff_label: forecast?.kickoff_label ?? kickoffLabel(match),
          market_selection: pick.market_selection,
          market_category: pick.market_category,
          odd: pick.odd,
          model,
        }}
        slip={quick.slip}
        trend={pick.trend}
        live={live}
        className={button}
      >
        {pick.odd.toFixed(2)}
      </OddButton>
    ) : (
      live && (
        <span key={key} title="Mercado suspendido" className={`grid place-items-center rounded-xl border border-line bg-surface-2/40 text-muted ${button}`}>
          <LockClosedIcon label="Mercado suspendido" className="h-[1lh] w-3.5" />
        </span>
      )
    )
    // A side with no chance has no odd: an empty slot keeps the columns in line. A row with no boxes at all only needs
    // it where the odds share the row with the teams.
    if (!box) return <span key={key} className={`${hasOdds(match, forecast) ? '' : 'hidden @xl:block'} ${slot}`} />
    return labeled ? (
      <span key={key} className={`text-center ${slot}`}>
        <span aria-hidden="true" className="mb-1 block font-num text-[11px] font-semibold text-muted">{label}</span>
        {box}
      </span>
    ) : (
      box
    )
  })
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

// A live match's minute: a ring that fills over the 90 minutes around a beating dot, and the stretch it is in (1T,
// ET for the break, 2T, TE in extra time); orange, "CIERRE", from the 85th minute.
export function LiveMinute({ match }: { match: Match }) {
  const minute = match.minute ?? 0
  const paused = match.status === 'PAUSED'
  const closing = !paused && minute >= 85
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full py-px pr-1.5 pl-0.5 font-num text-[11px] leading-4 font-bold whitespace-nowrap text-forest ${
        closing ? 'bg-orange' : 'bg-yellow'
      }`}
    >
      <svg viewBox="0 0 16 16" aria-hidden="true" className="size-3.5 -rotate-90">
        <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2.5" />
        <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="2.5" pathLength={90} strokeDasharray={`${Math.min(minute, 90)} 90`} />
        <circle cx="8" cy="8" r="1.8" fill="currentColor" className="origin-center animate-ping" />
        <circle cx="8" cy="8" r="1.8" fill="currentColor" />
      </svg>
      {paused ? 'ET' : `${minute > 90 ? 'TE' : minute > 45 ? '2T' : '1T'}${match.minute ? ` ${minute}'` : ''}`}
      {closing && <span className="text-[9px] tracking-wide">· CIERRE</span>}
    </span>
  )
}

function MatchRow({
  match,
  showLeague,
  onSelect,
  goal,
  compare,
  quick,
  pin,
  multi,
  played,
}: {
  match: Match
  showLeague: boolean
  onSelect: (match: Match) => void
  goal: boolean
  compare?: Compare
  quick?: Quick
  pin?: Pin
  multi?: Multi
  played?: string
}) {
  const { home, away } = match.score.fullTime
  const live = LIVE.has(match.status)
  const note = match.status === 'TIMED' || live ? null : statusText(match)
  const boxes = quick && hasOdds(match, quick.odds(match))
  const comparable = compare?.can(match.id) ? compare : undefined
  const onGrid = multi?.has(match.id)
  const pinned = pin?.pinned(match.id)

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
        className={`grid min-w-0 grow cursor-pointer items-center gap-2 px-3 py-2.5 text-sm font-medium sm:px-4 compact:px-2.5 compact:py-1.5 compact:text-xs ${
          showLeague ? 'grid-cols-[1.25rem_minmax(0,1fr)_6rem_minmax(0,1fr)]' : 'grid-cols-[minmax(0,1fr)_6rem_minmax(0,1fr)]'
        } ${boxes ? 'basis-full @xl:basis-0' : 'basis-full @md:basis-0'}`}
      >
        {showLeague && (
          <img
            src={match.league.league_logo}
            alt={match.league.league_name}
            title={match.league.league_name}
            className="size-5 rounded bg-white/90 object-contain p-px compact:size-4"
          />
        )}
        <span className="flex min-w-0 items-center justify-end gap-2">
          <span className="truncate">{match.homeTeam.shortName}</span>
          <img src={match.homeTeam.crest} alt="" className="size-5 shrink-0 object-contain compact:size-4" />
        </span>
        {/* Compact rows read like a table, score and status on one line; a live badge needs its own. */}
        <span className={`flex flex-col items-center gap-0.5 leading-tight ${live ? '' : 'compact:flex-row compact:justify-center compact:gap-1.5'}`}>
          {home === null ? (
            <span className="rounded-full bg-chip px-2 py-0.5 font-num text-xs font-semibold whitespace-nowrap text-cream">
              {kickoffTime(match)}
            </span>
          ) : (
            <span className="font-num font-bold tabular-nums">
              {home} - {away}
            </span>
          )}
          {(note || goal || live) && (
            <span className="flex items-center gap-1">
              {live ? <LiveMinute match={match} /> : note && <span className="text-[11px] text-muted">{note}</span>}
              {goal && <span className="animate-pulse rounded-full bg-yellow px-1.5 text-[11px] font-extrabold text-forest">¡GOL!</span>}
              {match.momentum_status === 'high_voltage' && <FlameIcon className="size-3.5" label="Partido caliente" />}
            </span>
          )}
          {live && match.home_pressure !== undefined && (
            <PressureBar home={match.home_pressure} away={match.away_pressure ?? 0} className="mt-0.5 h-1 w-16" />
          )}
        </span>
        <span className="flex min-w-0 items-center gap-2">
          <img src={match.awayTeam.crest} alt="" className="size-5 shrink-0 object-contain compact:size-4" />
          <span className="truncate">{match.awayTeam.shortName}</span>
        </span>
      </button>
      {(quick || comparable || pin) && (
        // On a narrow column the odds and the buttons drop under the teams, on a line of their own, so the names stay readable.
        <span className={`ml-auto flex items-center gap-1 pr-2.5 ${boxes ? 'pb-2.5 @xl:pb-0' : 'pb-1.5 @md:pb-0'}`}>
          {quick && (
            <QuickOdds
              match={match}
              quick={quick}
              slot="w-[52px] compact:w-[46px]"
              button="w-[52px] px-1 py-1.5 text-xs compact:w-[46px] compact:py-1 compact:text-[11px]"
            />
          )}
          {comparable ? (
            <CompareButton matchId={match.id} label={`${match.homeTeam.shortName} vs ${match.awayTeam.shortName}`} compare={comparable} />
          ) : (
            quick && <span className={`size-7 shrink-0 ${boxes ? '' : 'hidden @xl:block'}`} />
          )}
          {multi && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                multi.toggle(match.id)
              }}
              disabled={multi.full && !onGrid}
              aria-pressed={onGrid}
              aria-label={`${onGrid ? 'Quitar de' : 'Añadir a'} Multivista: ${match.homeTeam.shortName} vs ${match.awayTeam.shortName}`}
              title={multi.full && !onGrid ? 'Multivista llena: quita un partido primero' : 'Añadir/Quitar de Multivista'}
              className={`grid size-7 shrink-0 cursor-pointer place-items-center rounded-full transition-all duration-200 ease-out hover:bg-surface-2 active:scale-[0.95] disabled:cursor-default disabled:opacity-40 ${
                onGrid ? 'text-gold' : 'text-muted/60 hover:text-ink'
              }`}
            >
              <GridMultiViewIcon />
            </button>
          )}
          {pin && (
            <button
              type="button"
              onClick={() => pin.toggle(match.id)}
              aria-pressed={pinned}
              aria-label={`${pinned ? 'Desanclar' : 'Anclar arriba'} ${match.homeTeam.shortName} vs ${match.awayTeam.shortName}`}
              title={pinned ? 'Desanclar partido' : 'Anclar partido arriba'}
              className={`grid size-7 shrink-0 cursor-pointer place-items-center rounded-full transition-all duration-200 ease-out hover:bg-surface-2 active:scale-[0.95] ${
                pinned ? 'text-gold' : 'text-muted/60 hover:text-ink'
              }`}
            >
              <PinIcon filled={pinned} />
            </button>
          )}
        </span>
      )}
      {played && (
        <p className="basis-full truncate px-3 pb-2 text-xs sm:px-4">
          <span className="font-semibold text-gold">Llevas:</span> {played}
        </p>
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
  pin,
  multi,
  played,
  highlight = false,
  actions,
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
  pin?: Pin
  multi?: Multi
  played?: (matchId: number) => string // what the user plays on each match, under its row
  highlight?: boolean
  actions?: ReactNode // controls under the title
}) {
  const header = 'flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm font-bold tracking-tight compact:px-3 compact:py-1.5'
  // The quick odds' column names right over the rows' odds, while the card is open and any of its matches has them:
  // in the header on a wide column, and on a line of their own under it on a narrow one, where the odds drop too.
  const columns = !collapsed && quick && matches.some((match) => hasOdds(match, quick.odds(match))) ? quick.columns : []
  // The rows' odds end before the compare and pin buttons, so the names leave their room too.
  const room = pin ? 'mr-16 compact:mr-17' : '' // the compact header's padding is 4 px narrower
  const labels = (className: string) =>
    columns.length > 0 && (
      <span aria-hidden="true" className={`gap-1 font-num text-[11px] font-semibold text-muted ${className}`}>
        {columns.map(([key, label]) => (
          <span key={key} className="w-[52px] text-center compact:w-[46px]">
            {label}
          </span>
        ))}
      </span>
    )
  return (
    <section className={`overflow-hidden rounded-2xl border bg-surface ${highlight ? 'border-yellow/70' : 'border-line'}`}>
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
              {labels(`hidden @xl:flex ${room}`)}
              <Chevron direction={collapsed ? 'down' : 'up'} className="text-muted" />
            </span>
          </button>
        ) : (
          <span className={header}>
            {title}
            {/* An empty slot in the chevron's place keeps the column names over the odds. */}
            {columns.length > 0 && (
              <span className="ml-auto hidden items-center gap-2.5 @xl:flex">
                {labels(`flex ${room}`)}
                <span className="size-4" />
              </span>
            )}
          </span>
        )}
      </h2>
      {actions && <div className="flex flex-wrap items-center gap-2 px-4 pb-3 text-xs compact:px-3 compact:pb-1.5">{actions}</div>}
      {labels(`-mt-2 flex justify-end pb-1.5 @xl:hidden ${pin ? 'pr-26.5' : 'pr-10.5'}`)}
      <Collapse open={!collapsed}>
        <ul className="divide-y divide-line border-t border-line">
          {matches.map((match) => (
            <MatchRow key={match.id} match={match} showLeague={showLeague} onSelect={onSelect} goal={scored?.(match.id) ?? false} compare={compare} quick={quick} pin={pin} multi={multi} played={played?.(match.id)} />
          ))}
        </ul>
      </Collapse>
    </section>
  )
}
