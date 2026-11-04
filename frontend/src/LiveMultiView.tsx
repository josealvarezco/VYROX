import type { ReactNode } from 'react'
import { CrossIcon, FlameIcon, GridMultiViewIcon, MaximizeExpandIcon } from './icons'
import { LiveMinute, QuickOdds, type Quick } from './MatchList'
import { PressureBar } from './Momentum'
import { SLOTS, parlayMatches, toggleSlot, topLive, trackLeg, type Track } from './multiView'
import { LIVE, hasOdds, kickoffTime, statusText } from './status'
import type { Match, SlipLeg, TicketLeg } from './types'
import { VyroxDropdown } from './VyroxDropdown'

const TRACK: Record<Track, { note: string; style: string }> = {
  ok: { note: 'Se está cumpliendo', style: 'border-win/50 bg-win/10 text-win' },
  waiting: { note: 'Aún falta', style: 'border-orange/50 bg-orange/10 text-warn' },
  lost: { note: 'Ya no se puede dar', style: 'border-line bg-surface-2 text-muted' },
}

const SECONDARY =
  'cursor-pointer rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm font-semibold transition-all duration-200 ease-out hover:border-yellow hover:bg-surface-2 active:scale-[0.98] disabled:cursor-default disabled:opacity-50 disabled:hover:border-line disabled:hover:bg-surface'

type Play = { source: string; leg: SlipLeg & Partial<Pick<TicketLeg, 'status'>> }

function Team({ name, crest }: { name: string; crest: string }) {
  return (
    <span className="flex min-w-0 flex-col items-center gap-1.5 text-center text-sm font-semibold">
      <img src={crest} alt="" className="size-10 object-contain" />
      <span className="w-full truncate">{name}</span>
    </span>
  )
}

function Quadrant({ match, plays, goal, quick, onSelect, onRemove }: { match: Match; plays: Play[]; goal: boolean; quick: Quick; onSelect: () => void; onRemove: () => void }) {
  const { home, away } = match.score.fullTime
  const live = LIVE.has(match.status)
  const hot = match.momentum_status === 'high_voltage'
  const label = `${match.homeTeam.shortName} vs ${match.awayTeam.shortName}`
  return (
    <article className={`flex flex-col gap-3 rounded-2xl border bg-surface p-3 ${goal ? 'animate-goal border-yellow' : hot ? 'border-orange/70' : 'border-line'}`}>
      <header className="flex items-center gap-2">
        <img src={match.league.league_logo} alt="" className="size-5 shrink-0 rounded bg-white/90 object-contain p-px" />
        <h3 className="min-w-0 flex-1 truncate text-xs font-bold tracking-tight">{match.league.league_name}</h3>
        {live ? <LiveMinute match={match} /> : match.status !== 'TIMED' && <span className="text-[11px] text-muted">{statusText(match)}</span>}
        <button
          type="button"
          onClick={onSelect}
          aria-label={`Ver detalle de ${label}`}
          title="Ver detalle"
          className="flex shrink-0 cursor-pointer items-center gap-1 rounded-full px-1.5 py-1 text-[11px] font-semibold text-muted transition-all duration-200 ease-out hover:bg-surface-2 hover:text-ink"
        >
          <MaximizeExpandIcon className="size-3.5" />
          <span className="hidden @2xl:inline">Ver detalle</span>
        </button>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Quitar ${label} de la Multivista`}
          title="Quitar de la Multivista"
          className="grid size-6 shrink-0 cursor-pointer place-items-center rounded-full text-muted transition-all duration-200 ease-out hover:bg-surface-2 hover:text-ink"
        >
          <CrossIcon className="size-3.5" />
        </button>
      </header>

      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
        <Team name={match.homeTeam.shortName} crest={match.homeTeam.crest} />
        <div className="flex flex-col items-center gap-1">
          {home === null ? (
            <span className="rounded-full bg-chip px-2.5 py-1 font-num text-sm font-semibold whitespace-nowrap text-cream">{kickoffTime(match)}</span>
          ) : (
            <span className="font-num text-4xl leading-none font-bold tabular-nums">
              {home} - {away}
            </span>
          )}
          {goal && <span className="animate-pulse rounded-full bg-yellow px-2 text-[11px] font-extrabold text-forest">¡GOL!</span>}
        </div>
        <Team name={match.awayTeam.shortName} crest={match.awayTeam.crest} />
      </div>

      {plays.length > 0 && (
        <ul className="space-y-1">
          {plays.map(({ source, leg }) => {
            const { note, style } = TRACK[trackLeg(leg, match)]
            return (
              <li key={source + leg.market_selection} className={`rounded-xl border px-2.5 py-1.5 text-xs ${style}`}>
                <span className="font-bold">{source}:</span> {leg.market_selection}
                <span className="block text-[11px] font-semibold opacity-90">{note}</span>
              </li>
            )
          })}
        </ul>
      )}

      {live && (match.home_pressure === undefined ? (
        <p className="text-[11px] text-muted">Momentum IA lo mide al abrir Ver detalle.</p>
      ) : (
        <div className="space-y-1">
          <p className="flex items-center justify-between gap-2 text-[11px] font-semibold">
            <span className="font-num font-bold text-gold">{match.home_pressure}</span>
            {hot ? (
              <span className="flex items-center gap-1 font-extrabold text-warn">
                <FlameIcon className="size-3.5" />
                Partido Caliente
              </span>
            ) : (
              <span className="text-muted">Presión Momentum IA</span>
            )}
            <span className="font-num font-bold text-warn">{match.away_pressure ?? 0}</span>
          </p>
          <PressureBar home={match.home_pressure} away={match.away_pressure ?? 0} />
        </div>
      ))}

      {hasOdds(match, quick.odds(match)) && (
        <div className="mt-auto flex gap-1.5">
          <QuickOdds match={match} quick={quick} labeled slot="flex-1" button="w-full py-1.5 text-sm" />
        </div>
      )}
    </article>
  )
}

export function LiveMultiView({
  ids,
  setIds,
  matches,
  myLegs,
  tickets,
  slipLegs,
  scored,
  quick,
  marketPicker,
  onSelect,
}: {
  ids: number[]
  setIds: (ids: number[]) => void
  matches: Match[]
  myLegs: SlipLeg[]
  tickets: TicketLeg[]
  slipLegs: SlipLeg[]
  scored: (matchId: number) => boolean
  quick: Quick
  marketPicker: ReactNode
  onSelect: (match: Match) => void
}) {
  const byId = new Map(matches.map((match) => [match.id, match]))
  const onGrid = ids.flatMap((id) => byId.get(id) ?? [])
  const toggle = (id: number) => setIds(toggleSlot(ids, id, (other) => byId.has(other)))
  const mine = parlayMatches(myLegs, matches)
  const live = topLive(matches)
  const plays = (id: number) => [
    ...slipLegs.filter((leg) => leg.match_id === id).map((leg) => ({ source: 'En tu Cupón', leg })),
    // One pick played in several tickets is one line.
    ...[...new Map(tickets.filter((leg) => leg.match_id === id).map((leg) => [leg.market_selection, leg])).values()].map((leg) => ({ source: 'En tu Parlay', leg })),
  ]
  const free = matches.filter((match) => !ids.includes(match.id))

  return (
    <section aria-label="Multivista En Vivo" className="space-y-3.5">
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-line bg-surface p-3">
        <button
          type="button"
          onClick={() => setIds(mine)}
          disabled={!mine.length}
          title={mine.length ? undefined : 'No tienes jugadas en partidos de esta fecha'}
          className="cursor-pointer rounded-full bg-yellow px-3.5 py-1.5 text-sm font-bold text-forest transition-all duration-200 ease-out hover:opacity-90 active:scale-[0.98] disabled:cursor-default disabled:opacity-50"
        >
          Cargar mi Parlay en Pantalla
        </button>
        <button type="button" onClick={() => setIds(live)} disabled={!live.length} title={live.length ? undefined : 'No hay partidos en vivo ahora'} className={SECONDARY}>
          Top 4 En Vivo
        </button>
        <button type="button" onClick={() => setIds([])} disabled={!ids.length} className={SECONDARY}>
          Limpiar Multivista
        </button>
        <span className="ml-auto">{marketPicker}</span>
      </div>

      {/* By this column's width, not the screen's: beside the sidebar and the slip, two quadrants need the room. */}
      <div className="grid grid-cols-1 gap-3.5 @xl:grid-cols-2">
        {onGrid.map((match) => (
          <Quadrant key={match.id} match={match} plays={plays(match.id)} goal={scored(match.id)} quick={quick} onSelect={() => onSelect(match)} onRemove={() => toggle(match.id)} />
        ))}
        {Array.from({ length: SLOTS - onGrid.length }, (_, slot) => (
          <div key={slot} className="flex min-h-44 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-line p-4 text-center text-muted">
            <GridMultiViewIcon className="size-8" />
            <p className="text-sm font-semibold">Espacio disponible</p>
            <VyroxDropdown
              label="Elegir un partido para este cuadrante"
              value={null}
              searchable
              options={free.map((match) => ({
                value: match.id,
                label: `${match.homeTeam.shortName} vs ${match.awayTeam.shortName}`,
                icon: <img src={match.homeTeam.crest} alt="" className="size-5 object-contain" />,
                detail: `${match.league.league_name} · ${LIVE.has(match.status) ? 'En vivo' : statusText(match)}`,
                keywords: match.league.league_name,
              }))}
              onChange={toggle}
              className="rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm font-semibold text-ink transition-all duration-200 ease-out hover:border-yellow"
            >
              Elegir partido
            </VyroxDropdown>
          </div>
        ))}
      </div>
    </section>
  )
}
