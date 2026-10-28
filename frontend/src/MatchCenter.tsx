import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { PredictionView } from './AiPrediction'
import {
  BallIcon,
  CardIcon,
  CrossIcon,
  JerseyIcon,
  PitchIcon,
  SparklesIcon,
  StarIcon,
  StopwatchIcon,
  SubIcon,
  WhistleIcon,
} from './icons'
import { countryLabel } from './leagues'
import { LIVE, statusText } from './status'
import type { Competition, Lineup, Match, MatchDetails, MatchEvent, Side, Starter, Team } from './types'
import { usePrediction } from './usePrediction'

const TABS = ['Resumen', 'Estadísticas', 'Alineaciones', 'Pronóstico IA'] as const
type Tab = (typeof TABS)[number]
type Substitution = Extract<MatchEvent, { type: 'subst' }>
const SIDES = ['home', 'away'] as const
const SIDE_COLOR = { home: 'bg-sky', away: 'bg-orange' } as const
const SIDE_RING = { home: 'ring-sky', away: 'ring-orange' } as const
const INLINE_ICON = 'mr-1 inline-block size-4 align-[-3px]'

function Note({ children }: { children: ReactNode }) {
  return <p className="py-8 text-center text-sm text-muted">{children}</p>
}

function SimulatedBadge({ sample }: { sample: boolean }) {
  return (
    <p className="mb-4 inline-flex rounded-full border border-orange/50 bg-orange/10 px-2.5 py-0.5 text-xs font-semibold text-warn">
      Datos simulados · {sample ? 'sin API key' : 'la liga no tiene cobertura'}
    </p>
  )
}

function TeamBadge({ team, followed, onFollow }: { team: Team; followed: boolean; onFollow: (team: Team) => void }) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-1.5">
      <img src={team.crest} alt="" className="size-12 object-contain sm:size-16" />
      <span className="w-full truncate text-lg font-bold tracking-tight">{team.shortName}</span>
      <button
        type="button"
        onClick={() => onFollow(team)}
        aria-pressed={followed}
        aria-label={`Seguir a ${team.shortName}`}
        className={`inline-flex cursor-pointer items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 ease-out active:scale-[0.98] ${
          followed ? 'border-yellow bg-yellow text-forest' : 'border-cream/25 text-cream/80 hover:bg-cream/10 hover:text-cream'
        }`}
      >
        <StarIcon filled={followed} className="size-3.5" />
        {followed ? 'Siguiendo' : 'Seguir'}
      </button>
    </div>
  )
}

function EventText({ event }: { event: MatchEvent }) {
  if (event.type === 'subst')
    return (
      <span>
        <SubIcon label="Cambio" className={INLINE_ICON} />
        <span className="font-semibold text-sub-in">
          <span className="sr-only">entra </span>
          {event.player_in}
        </span>{' '}
        <span className="text-sub-out">
          <span className="sr-only">sale </span>
          {event.player_out}
        </span>
      </span>
    )
  if (event.type === 'goal')
    return (
      <span>
        <BallIcon own={event.detail === 'autogol'} label={event.detail === 'autogol' ? 'Autogol' : 'Gol'} className={INLINE_ICON} />
        <strong>{event.player}</strong>
        {event.detail && ` (${event.detail})`}
        {event.assist && <span className="text-muted"> · asist. {event.assist}</span>}
      </span>
    )
  return (
    <span>
      <CardIcon variant={event.type} label={event.type === 'yellow' ? 'Tarjeta amarilla' : 'Tarjeta roja'} className={INLINE_ICON} />
      {event.player}
    </span>
  )
}

function Summary({ match, events }: { match: Match; events: MatchEvent[] }) {
  const halfTime = match.score.halfTime
  const facts = (
    [
      [PitchIcon, 'Estadio', [match.venue?.name, match.venue?.city].filter(Boolean).join(', ')],
      [WhistleIcon, 'Árbitro', match.referee],
      [StopwatchIcon, 'Medio tiempo', halfTime?.home != null ? `${halfTime.home} : ${halfTime.away}` : null],
    ] as [typeof PitchIcon, string, string | null | undefined][]
  ).filter(([, , value]) => value)

  return (
    <div className="space-y-6">
      {events.length ? (
        <ol className="space-y-3">
          {events.map((event, index) => (
            <li key={index} className="grid grid-cols-[minmax(0,1fr)_3.5rem_minmax(0,1fr)] items-start gap-2 text-sm">
              <div className="text-right">{event.team === 'home' && <EventText event={event} />}</div>
              <span className="rounded-full bg-chip py-0.5 text-center text-xs font-semibold font-num tabular-nums text-cream">
                {event.minute}
              </span>
              <div>{event.team === 'away' && <EventText event={event} />}</div>
            </li>
          ))}
        </ol>
      ) : (
        <Note>Sin goles, tarjetas ni cambios registrados.</Note>
      )}
      {facts.length > 0 && (
        <dl className="grid gap-3 border-t border-line pt-4 text-sm sm:grid-cols-3">
          {facts.map(([FactIcon, label, value]) => (
            <div key={label}>
              <dt className="flex items-center gap-1.5 text-muted">
                <FactIcon />
                {label}
              </dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  )
}

function Statistics({ rows }: { rows: MatchDetails['statistics'] }) {
  if (!rows.length) return <Note>Las estadísticas aparecen cuando empieza el partido.</Note>
  return (
    <div className="space-y-4">
      {rows.map(({ label, home, away }) => {
        const total = home + away || 1
        const unit = label === 'Posesión' ? '%' : ''
        return (
          <div key={label}>
            <div className="mb-1.5 flex items-baseline justify-between text-sm">
              <span className="font-semibold font-num tabular-nums">
                {home}
                {unit}
              </span>
              <span className="text-muted">{label}</span>
              <span className="font-semibold font-num tabular-nums">
                {away}
                {unit}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1" aria-hidden="true">
              <div className="flex h-2 justify-end overflow-hidden rounded-l-full bg-line">
                <div
                  className={`h-full origin-right animate-grow transition-all duration-500 ease-out ${SIDE_COLOR.home}`}
                  style={{ width: `${(home / total) * 100}%` }}
                />
              </div>
              <div className="h-2 overflow-hidden rounded-r-full bg-line">
                <div
                  className={`h-full origin-left animate-grow transition-all duration-500 ease-out ${SIDE_COLOR.away}`}
                  style={{ width: `${(away / total) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function spot(side: Side, player: Starter, starters: Starter[]) {
  const rows = Math.max(...starters.map((p) => p.row))
  const across = ((player.col - 0.5) / starters.filter((p) => p.row === player.row).length) * 100
  const depth = ((player.row - 0.5) / rows) * 50 // share of the pitch between the team's own goal line and halfway
  const width = `${50 / rows - 1}%` // one line's share minus a gap, so one-line names never touch the next line
  // Home attacks to the right and away to the left. Grid column 1 is each team's left flank (Inter's
  // lineup has Dimarco at 3:1 and Diouf at 3:5), so it goes on top for home and at the bottom for away.
  return side === 'home'
    ? { left: `${depth}%`, top: `${across}%`, width }
    : { left: `${100 - depth}%`, top: `${100 - across}%`, width }
}

function PlayerSpot({ side, player, style }: { side: Side; player: Starter; style: CSSProperties }) {
  const [photo, setPhoto] = useState(player.id !== null) // simulated players have no id, hence no photo
  const { goals, yellow, red, subbed_out } = player
  const card = red ? (yellow ? 'second-yellow' : 'red') : yellow ? 'yellow' : null
  return (
    <div className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center" style={style}>
      {/* Events float on the avatar's edge, so the name below always stays on one clean line. */}
      <div className="relative">
        {photo ? (
          <img
            src={`https://media.api-sports.io/football/players/${player.id}.png`}
            alt=""
            onError={() => setPhoto(false)}
            className={`size-10 rounded-full bg-cream/10 object-cover ring-2 ${SIDE_RING[side]}`}
          />
        ) : (
          <span className={`grid size-10 place-items-center rounded-full font-num text-sm font-bold text-forest ${SIDE_COLOR[side]}`}>
            {player.number}
          </span>
        )}
        {card && (
          <CardIcon
            variant={card}
            label={{ yellow: 'Tarjeta amarilla', red: 'Tarjeta roja', 'second-yellow': 'Doble amarilla' }[card]}
            className="absolute -top-1 -left-1 size-4"
          />
        )}
        {subbed_out && (
          <span className="absolute -top-1 -right-1 flex translate-x-1/2 items-center gap-0.5 rounded-full bg-forest py-px pr-1 pl-px font-num text-[9px] leading-none font-bold text-cream ring-1 ring-cream/30">
            <SubIcon label="Salió" className="size-3.5" />
            {subbed_out}
          </span>
        )}
        {goals > 0 && (
          <span className="absolute -right-1 -bottom-1">
            <BallIcon label={goals > 1 ? `${goals} goles` : 'Gol'} />
            {goals > 1 && (
              <span
                aria-hidden="true"
                className="absolute -top-1.5 -right-1.5 grid size-3 place-items-center rounded-full bg-yellow font-num text-[8px] font-bold text-forest"
              >
                {goals}
              </span>
            )}
          </span>
        )}
      </div>
      <span title={player.name} className="mt-1 w-full truncate text-[11px] leading-tight font-semibold text-cream">
        <span className="font-num font-bold text-yellow">{player.number}</span> {player.name}
      </span>
    </div>
  )
}

function Pitch({ lineups }: { lineups: Record<Side, Lineup> }) {
  return (
    // Phones scroll the pitch sideways: 22 players do not fit legibly in 340 px.
    <div className="overflow-x-auto">
      <div className="relative aspect-[105/68] w-full min-w-[640px] overflow-hidden rounded-2xl bg-forest">
        <svg
          viewBox="0 0 105 68"
          className="absolute inset-0 size-full"
          fill="none"
          stroke="rgb(247 245 235 / 0.35)"
          strokeWidth="0.3"
          aria-hidden="true"
        >
          <rect x="1" y="1" width="103" height="66" />
          <line x1="52.5" y1="1" x2="52.5" y2="67" />
          <circle cx="52.5" cy="34" r="9.15" />
          <rect x="1" y="13.84" width="16.5" height="40.32" />
          <rect x="1" y="24.84" width="5.5" height="18.32" />
          <rect x="87.5" y="13.84" width="16.5" height="40.32" />
          <rect x="98.5" y="24.84" width="5.5" height="18.32" />
          <g fill="rgb(247 245 235 / 0.35)" stroke="none">
            <circle cx="52.5" cy="34" r="0.6" />
            <circle cx="12" cy="34" r="0.5" />
            <circle cx="93" cy="34" r="0.5" />
          </g>
        </svg>
        {/* Inset so the players on the touchlines are never cut off at the pitch edge. */}
        <div className="absolute inset-x-2 inset-y-6">
          {SIDES.map((side) =>
            lineups[side].starters.map((player, index, starters) => (
              <PlayerSpot key={`${side}-${index}`} side={side} player={player} style={spot(side, player, starters)} />
            )),
          )}
        </div>
      </div>
    </div>
  )
}

function TeamLine({ team, lineup }: { team: Team; lineup: Lineup }) {
  return (
    <p className="flex flex-wrap items-center justify-center gap-x-2 text-sm">
      <img src={team.crest} alt="" className="size-5" />
      <span className="font-bold">{team.shortName}</span>
      <span className="text-muted">
        {lineup.formation}
        {lineup.coach && ` · DT ${lineup.coach}`}
      </span>
    </p>
  )
}

function Lineups({ match, details }: { match: Match; details: MatchDetails }) {
  const { lineups, events } = details
  if (!lineups) return <Note>Las alineaciones se publican poco antes de que empiece el partido.</Note>
  const teams = { home: match.homeTeam, away: match.awayTeam }
  const substitutions = events.filter((event): event is Substitution => event.type === 'subst')

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <TeamLine team={match.homeTeam} lineup={lineups.home} />
        <TeamLine team={match.awayTeam} lineup={lineups.away} />
      </div>
      <Pitch lineups={lineups} />

      <section>
        <h3 className="mb-2 flex items-center gap-1.5 text-sm font-bold">
          <SubIcon />
          Cambios realizados
        </h3>
        {substitutions.length ? (
          <ul className="space-y-1.5 text-sm">
            {substitutions.map((event, index) => (
              <li key={index} className="flex flex-wrap items-center gap-x-2">
                <span className="w-12 rounded-full bg-chip py-0.5 text-center font-num text-xs font-semibold tabular-nums text-cream">
                  {event.minute}
                </span>
                <img src={teams[event.team].crest} alt={teams[event.team].shortName} className="size-4" />
                <span className="font-semibold text-sub-in">
                  <span className="sr-only">entra </span>
                  {event.player_in}
                </span>
                <span className="text-sub-out">
                  <span className="sr-only">sale </span>
                  {event.player_out}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">Sin cambios todavía.</p>
        )}
      </section>

      <section>
        <h3 className="mb-2 flex items-center gap-1.5 text-sm font-bold">
          <JerseyIcon className="size-4 text-muted" />
          Banca de suplentes
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {SIDES.map((side) => (
            <div key={side}>
              <p className="mb-1 text-xs text-muted">{teams[side].shortName}</p>
              <ul className="space-y-1 text-sm">
                {lineups[side].substitutes.map((player, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="w-6 shrink-0 text-right text-xs font-num tabular-nums text-muted">{player.number}</span>
                    <span className="truncate">{player.name}</span>
                    {player.subbed_in && (
                      <span className="inline-flex shrink-0 items-center gap-1 font-num text-xs text-sub-in">
                        <SubIcon label="Entró" className="size-3.5" />
                        {player.subbed_in}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function HeadToHead({ h2h }: { h2h: MatchDetails['h2h'] }) {
  if (!h2h?.matches.length) return <Note>Sin enfrentamientos directos registrados.</Note>
  const played = h2h.matches.length
  const summary = [
    ['Promedio de goles', h2h.avg_goals],
    ['Ambos anotan', `${h2h.btts}/${played}`],
    ['Más de 2.5 goles', `${h2h.over_2_5}/${played}`],
  ] as const

  return (
    <section>
      <h3 className="mb-2 text-sm font-bold">Últimos {played} enfrentamientos directos</h3>
      <table className="w-full table-fixed text-sm">
        <thead className="text-xs text-muted">
          <tr>
            <th className="w-24 pb-1 text-left font-normal">Fecha</th>
            <th className="pb-1 text-right font-normal">Local</th>
            <th className="w-16 pb-1 font-normal">Marcador</th>
            <th className="pb-1 text-left font-normal">Visitante</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {h2h.matches.map((meeting) => (
            <tr key={meeting.id}>
              <td className="py-1.5 text-xs text-muted" title={meeting.league}>
                {new Date(`${meeting.date}T12:00:00`).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}
              </td>
              <td className="truncate py-1.5 text-right">{meeting.home}</td>
              <td className="py-1.5 text-center font-semibold font-num tabular-nums">
                {meeting.home_goals} : {meeting.away_goals}
              </td>
              <td className="truncate py-1.5">{meeting.away}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        {summary.map(([label, value]) => (
          <span key={label} className="rounded-full border border-line px-2.5 py-1">
            <span className="text-muted">{label}:</span> <span className="font-num font-bold">{value}</span>
          </span>
        ))}
      </div>
    </section>
  )
}

export function MatchCenter({
  match,
  competition,
  isFollowed,
  onFollow,
  onClose,
}: {
  match: Match
  competition: Competition
  isFollowed: (teamId: number) => boolean
  onFollow: (team: Team) => void
  onClose: () => void
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [tab, setTab] = useState<Tab>('Resumen')
  const [details, setDetails] = useState<MatchDetails | null>(null)
  const [failed, setFailed] = useState(false)
  const prediction = usePrediction(match, competition.league_name)

  useEffect(() => {
    if (!dialog.current?.open) dialog.current?.showModal()
  }, [])

  useEffect(() => {
    let current = true // drop the answer if the modal closed meanwhile
    fetch(`/api/matches/${match.id}/details`)
      .then((response) => {
        if (!response.ok) throw new Error(response.statusText)
        return response.json()
      })
      .then((body: MatchDetails) => current && setDetails(body))
      .catch(() => current && setFailed(true))
    return () => {
      current = false
    }
  }, [match.id])

  const openTab = (next: Tab) => {
    setTab(next)
    if (next === 'Pronóstico IA') prediction.load() // Gemini is only asked when someone opens its tab
  }

  const { home, away } = match.score.fullTime
  const live = LIVE.has(match.status)
  const kickoff = new Date(match.utcDate).toLocaleString('es-CO', { dateStyle: 'long', timeStyle: 'short', timeZone: 'America/Bogota' })
  const waiting = <Note>{failed ? 'No se pudieron cargar los datos del partido.' : 'Cargando datos del partido…'}</Note>

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      aria-label={`${match.homeTeam.shortName} vs ${match.awayTeam.shortName}`}
      className="m-auto max-h-[92vh] w-[calc(100%-2rem)] max-w-3xl flex-col overflow-hidden rounded-3xl border border-line bg-modal p-0 text-ink open:flex"
    >
      <header className="hero shrink-0 px-5 pt-4 pb-7">
        <div className="flex items-center justify-between gap-3 text-sm text-cream/75">
          <span className="flex min-w-0 items-center gap-2">
            <img src={competition.league_logo} alt="" className="size-5 rounded bg-white/90 object-contain p-px" />
            <span className="truncate">
              {competition.league_name} · {countryLabel(competition.country)}
            </span>
          </span>
          <button
            type="button"
            onClick={() => dialog.current?.close()}
            className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-full px-3 py-1 font-semibold text-cream/85 transition-all duration-200 ease-out hover:bg-cream/10 hover:text-cream active:scale-[0.98]"
          >
            Cerrar
            <CrossIcon className="size-3.5" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 text-center">
          <TeamBadge team={match.homeTeam} followed={isFollowed(match.homeTeam.id)} onFollow={onFollow} />
          <div>
            <p className="font-num text-5xl font-bold tabular-nums">
              {home ?? '-'} : {away ?? '-'}
            </p>
            <p className={`mt-1 text-sm ${live ? 'font-bold text-orange' : 'text-cream/70'}`}>
              {statusText(match)}
              {live && match.minute ? <span className="font-num"> · {match.minute}'</span> : ''}
            </p>
          </div>
          <TeamBadge team={match.awayTeam} followed={isFollowed(match.awayTeam.id)} onFollow={onFollow} />
        </div>
        <p className="mt-3 text-center text-xs text-cream/65">{[kickoff, match.round].filter(Boolean).join(' · ')}</p>

        <div role="tablist" aria-label="Secciones del partido" className="mt-4 flex gap-1.5 overflow-x-auto">
          {TABS.map((name, index) => (
            <button
              key={name}
              type="button"
              role="tab"
              id={`match-tab-${index}`}
              aria-selected={tab === name}
              aria-controls="match-tab-panel"
              onClick={() => openTab(name)}
              className={`inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold whitespace-nowrap transition-all duration-200 ease-out active:scale-[0.98] ${
                tab === name
                  ? 'bg-yellow font-bold text-forest'
                  : name === 'Pronóstico IA'
                    ? 'text-yellow hover:bg-cream/10'
                    : 'text-cream/75 hover:bg-cream/10 hover:text-cream'
              }`}
            >
              {name}
              {name === 'Pronóstico IA' && <SparklesIcon />}
            </button>
          ))}
        </div>
      </header>

      <div
        id="match-tab-panel"
        role="tabpanel"
        aria-labelledby={`match-tab-${TABS.indexOf(tab)}`}
        className="relative -mt-4 min-h-0 flex-1 overflow-y-auto rounded-t-3xl bg-modal px-5 py-5"
      >
        {/* Keyed by tab so each switch replays the short entrance. */}
        <div key={tab} className="animate-tab-in">
          {tab === 'Pronóstico IA' ? (
            <div className="space-y-6">
              <PredictionView prediction={prediction.prediction} state={prediction.state} />
              {details ? <HeadToHead h2h={details.h2h} /> : waiting}
            </div>
          ) : !details ? (
            waiting
          ) : tab === 'Resumen' ? (
            <Summary match={match} events={details.events} />
          ) : tab === 'Estadísticas' ? (
            <>
              {details.simulated.includes('statistics') && <SimulatedBadge sample={details.sample} />}
              <Statistics rows={details.statistics} />
            </>
          ) : (
            <>
              {details.simulated.includes('lineups') && <SimulatedBadge sample={details.sample} />}
              <Lineups match={match} details={details} />
            </>
          )}
        </div>
      </div>
    </dialog>
  )
}
