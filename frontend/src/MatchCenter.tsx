import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { MarketOdds, PredictionView } from './AiPrediction'
import { LiveMinute } from './MatchList'
import { BetBuilder } from './BetBuilder'
import { MomentumPanel } from './Momentum'
import { OddsTable } from './OddsTable'
import { BetSlip } from './BetSlip'
import {
  BallIcon,
  CardIcon,
  CrossIcon,
  JerseyIcon,
  PitchIcon,
  ShareIcon,
  SparklesIcon,
  StarIcon,
  StopwatchIcon,
  SubIcon,
  WhistleIcon,
} from './icons'
import { countryLabel } from './leagues'
import { ShareButton } from './ShareButton'
import { forecastCard } from './shareCard'
import { LIVE, statusText } from './status'
import type { Competition, Lineup, Match, MatchDetails, MatchEvent, Player, Prediction, Side, Starter, Team } from './types'
import type { useBetSlip } from './useBetSlip'
import { useMatchOdds } from './useMatchOdds'
import { usePrediction } from './usePrediction'

const TABS = ['Resumen', 'Estadísticas', 'Alineaciones', 'Cuotas', 'Pronóstico IA'] as const
type Tab = (typeof TABS)[number]
type Substitution = Extract<MatchEvent, { type: 'subst' }>
const SIDES = ['home', 'away'] as const
const SIDE_COLOR = { home: 'bg-sky', away: 'bg-orange' } as const
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

const POSITIONS: Record<string, string> = { G: 'Portero', D: 'Defensa', M: 'Mediocampista', F: 'Delantero' }
// Home in brand yellow, away in cream ringed in orange, on the pitch, its legend and the player card.
const CHIP = { home: 'bg-yellow text-forest', away: 'bg-cream text-forest ring-2 ring-orange' } as const

// "L. Messi" and "Lionel Messi" both read "Messi" under the chip, short enough for the space between neighbours.
function surname(name: string) {
  const rest = name.slice(name.indexOf(' ') + 1) // the whole name when it has a single word
  return /\p{L}/u.test(rest) ? rest : name // a simulated "Jugador 7" keeps its name
}

// What a player did in the match, for the player card and screen readers.
function playerEvents({ goals, yellow, red, subbed_in, subbed_out }: Player) {
  return [
    goals > 1 ? `${goals} goles` : goals ? 'Gol' : '',
    red ? (yellow ? 'Doble amarilla' : 'Tarjeta roja') : yellow ? 'Tarjeta amarilla' : '',
    subbed_in ? `Entró al ${subbed_in}` : '',
    subbed_out ? `Salió al ${subbed_out}` : '',
  ].filter(Boolean)
}

// A starter's place in both layouts, as percentages along the pitch from the home goal and across it: a wide screen
// shows home attacking to the right, a phone shows home attacking down. Grid column 1 is each team's left flank
// (Inter's lineup has Dimarco at 3:1 and Diouf at 3:5), so it goes on top for home and at the bottom for away.
function spot(side: Side, player: Starter, starters: Starter[]) {
  const rows = Math.max(...starters.map((p) => p.row))
  const lane = starters.filter((p) => p.row === player.row).length
  const across = ((player.col - 0.5) / lane) * 100
  const depth = ((player.row - 0.5) / rows) * 50 // share of the pitch between the team's own goal line and halfway
  return {
    '--along': `${side === 'home' ? depth : 100 - depth}%`,
    '--across': `${side === 'home' ? across : 100 - across}%`,
    '--line': `${50 / rows - 1}%`, // a wide pitch: one line's share minus a gap, so one-line names never touch the next line
    '--lane': `${100 / lane - 2}%`, // a phone: one lane's share of the width
  } as CSSProperties
}

function PlayerSpot({ side, player, style, onShow, onHide }: { side: Side; player: Starter; style: CSSProperties; onShow: () => void; onHide: () => void }) {
  const { goals, yellow, red, subbed_out } = player
  const card = red ? (yellow ? 'second-yellow' : 'red') : yellow ? 'yellow' : null
  const events = playerEvents(player)
  return (
    <button
      type="button"
      onMouseEnter={onShow}
      onMouseLeave={onHide}
      onFocus={onShow}
      onBlur={onHide}
      onClick={onShow}
      aria-label={`${player.name}, dorsal ${player.number}${events.length ? `: ${events.join(', ')}` : ''}`}
      style={style}
      // On a phone the pitch stands up, with smaller chips so its lines fit: "along" runs down from the home goal and the home team's left flank is on the right.
      className="group absolute top-[var(--along)] left-[calc(100%_-_var(--across))] flex w-[min(var(--lane),5.5rem)] -translate-x-1/2 -translate-y-1/2 cursor-pointer flex-col items-center text-center sm:top-[var(--across)] sm:left-[var(--along)] sm:w-[var(--line)]"
    >
      {/* Events float on the chip's edge, so the name below always stays on one clean line. */}
      <span className="relative">
        <span
          className={`grid size-7 place-items-center rounded-full font-num text-xs font-bold shadow-md sm:size-9 sm:text-sm transition-transform duration-200 ease-out group-hover:scale-110 group-focus-visible:scale-110 ${CHIP[side]}`}
        >
          {player.number}
        </span>
        {card && <CardIcon variant={card} className="absolute -top-1 -left-1 size-4" />}
        {subbed_out && (
          <span className="absolute -top-1 -right-1 flex translate-x-1/2 items-center gap-0.5 rounded-full bg-forest py-px pr-1 pl-px font-num text-[9px] leading-none font-bold text-cream ring-1 ring-cream/30">
            <SubIcon className="size-3.5" />
            {subbed_out}
          </span>
        )}
        {goals > 0 && (
          <span className="absolute -right-1 -bottom-1">
            <BallIcon />
            {goals > 1 && (
              <span className="absolute -top-1.5 -right-1.5 grid size-3 place-items-center rounded-full bg-yellow font-num text-[8px] font-bold text-forest">
                {goals}
              </span>
            )}
          </span>
        )}
      </span>
      <span className="mt-0.5 w-full truncate text-[10px] leading-tight font-semibold text-cream sm:mt-1 sm:text-[11px]">{surname(player.name)}</span>
    </button>
  )
}

// The player under the cursor or the finger, in the other team's half so it never covers him.
function PlayerCard({ side, player }: { side: Side; player: Starter }) {
  const [photo, setPhoto] = useState(player.id !== null) // simulated players have no id, hence no photo
  const events = playerEvents(player)
  return (
    <div
      aria-hidden="true" // the chip's label already says all of it
      className={`pointer-events-none absolute z-10 flex w-60 max-w-[calc(100%-1.5rem)] animate-tab-in items-center gap-3 rounded-2xl bg-modal p-3 text-left text-ink shadow-xl ring-1 ring-line ${
        side === 'home'
          ? 'bottom-3 left-1/2 -translate-x-1/2 sm:top-3 sm:right-3 sm:bottom-auto sm:left-auto sm:translate-x-0'
          : 'top-3 left-1/2 -translate-x-1/2 sm:left-3 sm:translate-x-0'
      }`}
    >
      {photo ? (
        <img
          src={`https://media.api-sports.io/football/players/${player.id}.png`}
          alt=""
          onError={() => setPhoto(false)}
          className="size-12 shrink-0 rounded-full bg-surface-2 object-cover"
        />
      ) : (
        <span className={`grid size-12 shrink-0 place-items-center rounded-full font-num text-lg font-bold ${CHIP[side]}`}>{player.number}</span>
      )}
      <div className="min-w-0 text-xs">
        <p className="truncate text-sm font-bold">{player.name}</p>
        <p className="text-muted">
          Dorsal <span className="font-num font-bold text-ink">{player.number}</span>
          {POSITIONS[player.pos] && ` · ${POSITIONS[player.pos]}`} · Titular
        </p>
        <p className="mt-0.5 font-semibold text-gold">{events.length ? events.join(' · ') : 'Sin goles, tarjetas ni cambios'}</p>
      </div>
    </div>
  )
}

// The pitch's markings, 105 × 68 m, on grass mown in stripes.
function Markings() {
  return (
    <>
      {[10.5, 31.5, 52.5, 73.5, 94.5].map((x) => (
        <rect key={x} x={x} width="10.5" height="68" fill="#0A2917" stroke="none" />
      ))}
      <rect x="1" y="1" width="103" height="66" />
      <line x1="52.5" y1="1" x2="52.5" y2="67" />
      <circle cx="52.5" cy="34" r="9.15" />
      <rect x="1" y="13.84" width="16.5" height="40.32" />
      <rect x="1" y="24.84" width="5.5" height="18.32" />
      <rect x="87.5" y="13.84" width="16.5" height="40.32" />
      <rect x="98.5" y="24.84" width="5.5" height="18.32" />
      <g fill="rgb(247 245 235 / 0.25)" stroke="none">
        <circle cx="52.5" cy="34" r="0.6" />
        <circle cx="12" cy="34" r="0.5" />
        <circle cx="93" cy="34" r="0.5" />
      </g>
    </>
  )
}

function Pitch({ lineups }: { lineups: Record<Side, Lineup> }) {
  const [shown, setShown] = useState<[Side, number] | null>(null)
  const lines = { fill: 'none', stroke: 'rgb(247 245 235 / 0.25)', strokeWidth: 0.3, 'aria-hidden': true } as const
  return (
    // Wide screens lay the pitch down, home on the left; a phone stands it up, home on top, so all 22 players fit.
    <div className="relative aspect-[68/105] w-full overflow-hidden rounded-2xl bg-forest sm:aspect-[105/68]">
      <svg viewBox="0 0 105 68" className="absolute inset-0 hidden size-full sm:block" {...lines}>
        <Markings />
      </svg>
      <svg viewBox="0 0 68 105" className="absolute inset-0 size-full sm:hidden" {...lines}>
        <g transform="translate(68 0) rotate(90)">
          <Markings />
        </g>
      </svg>
      {/* Inset so the players on the touchlines are never cut off at the pitch edge. */}
      <div className="absolute inset-x-4 inset-y-5 sm:inset-x-2 sm:inset-y-6">
        {SIDES.map((side) =>
          lineups[side].starters.map((player, index, starters) => (
            <PlayerSpot
              key={`${side}-${index}`}
              side={side}
              player={player}
              style={spot(side, player, starters)}
              onShow={() => setShown([side, index])}
              onHide={() => setShown(null)}
            />
          )),
        )}
      </div>
      {shown && <PlayerCard key={shown.join('-')} side={shown[0]} player={lineups[shown[0]].starters[shown[1]]} />}
    </div>
  )
}

function Lineups({ match, details }: { match: Match; details: MatchDetails }) {
  const { lineups, events } = details
  if (!lineups) return <Note>Las alineaciones se publican poco antes de que empiece el partido.</Note>
  const teams = { home: match.homeTeam, away: match.awayTeam }
  const substitutions = events.filter((event): event is Substitution => event.type === 'subst')

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 text-sm font-bold">
        {SIDES.map((side) => (
          <span key={side} className="flex min-w-0 items-center gap-2">
            <span aria-hidden="true" className={`size-3 shrink-0 rounded-full ${CHIP[side]}`} />
            <img src={teams[side].crest} alt="" className="size-5 shrink-0" />
            <span className="truncate">{teams[side].shortName}</span>
          </span>
        ))}
      </div>
      <Pitch lineups={lineups} />

      <div className="grid gap-4 sm:grid-cols-2">
        {SIDES.map((side) => (
          <section key={side} aria-label={teams[side].shortName} className="rounded-2xl border border-line bg-surface p-3">
            <h3 className="flex items-center gap-2 text-sm font-bold">
              <img src={teams[side].crest} alt="" className="size-5" />
              {teams[side].shortName}
            </h3>
            <dl className="mt-2 grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-0.5 text-xs">
              <dt className="text-muted">Formación</dt>
              <dd className="font-num font-bold">{lineups[side].formation}</dd>
              {lineups[side].coach && (
                <>
                  <dt className="text-muted">Director técnico</dt>
                  <dd className="truncate font-semibold">{lineups[side].coach}</dd>
                </>
              )}
            </dl>
            <p className="mt-3 mb-1 flex items-center gap-1.5 text-xs font-bold">
              <JerseyIcon className="size-4 text-muted" />
              Suplentes
            </p>
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
          </section>
        ))}
      </div>

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
  slip,
}: {
  match: Match
  competition: Competition
  isFollowed: (teamId: number) => boolean
  onFollow: (team: Team) => void
  onClose: () => void
  slip: ReturnType<typeof useBetSlip>
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [tab, setTab] = useState<Tab>('Resumen')
  const [details, setDetails] = useState<MatchDetails | null>(null)
  const [failed, setFailed] = useState(false)
  const prediction = usePrediction(match, competition.league_name)
  const bookmakerOdds = useMatchOdds(match.id, slip.addQuotes)

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
    if (next === 'Cuotas') bookmakerOdds.load() // and API-Football's odds, one request per match
  }

  const { home, away } = match.score.fullTime
  const live = LIVE.has(match.status)
  const kickoff = new Date(match.utcDate).toLocaleString('es-CO', { dateStyle: 'long', timeStyle: 'short', timeZone: 'America/Bogota' })
  const waiting = <Note>{failed ? 'No se pudieron cargar los datos del partido.' : 'Cargando datos del partido…'}</Note>

  return (
    // A full-screen grid in the top layer: the match card and, on desktop, the bet slip docked to its right,
    // both sharp above the blur. Growing the slip's column from 0 slides the card left.
    <dialog
      ref={dialog}
      onClose={onClose}
      aria-label={`${match.homeTeam.shortName} vs ${match.awayTeam.shortName}`}
      className={`m-0 size-full max-h-none max-w-none grid-cols-[minmax(0,48rem)] items-center justify-center overflow-hidden border-0 bg-transparent p-4 text-ink transition-[grid-template-columns] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] open:grid ${
        slip.docks ? 'lg:grid-cols-[minmax(0,48rem)_25rem]' : 'lg:grid-cols-[minmax(0,48rem)_0rem]'
      }`}
    >
      <div className="flex max-h-[92vh] flex-col overflow-hidden rounded-3xl border border-line bg-modal">
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
              <p className="mt-1 text-sm text-cream/70">{live ? <LiveMinute match={match} /> : statusText(match)}</p>
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
                {prediction.prediction && !prediction.prediction.fallback && (
                  <div className="-mb-3 flex justify-end">
                    <ShareButton
                      draw={() => forecastCard(match, competition.league_name, prediction.prediction as Extract<Prediction, { fallback: false }>)}
                      filename={`vyrox-pronostico-${match.id}.png`}
                      label="Compartir Pronóstico"
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm font-semibold transition-all duration-200 ease-out hover:bg-surface-2 active:scale-[0.98]"
                    >
                      <ShareIcon />
                      Compartir Pronóstico
                    </ShareButton>
                  </div>
                )}
                <PredictionView prediction={prediction.prediction} state={prediction.state} />
                {details ? <HeadToHead h2h={details.h2h} /> : waiting}
                {prediction.prediction &&
                  !prediction.prediction.fallback &&
                  prediction.prediction.market_odds && // a backend older than market odds sends none
                  (match.status === 'TIMED' || live ? (
                    <>
                      <MarketOdds prediction={prediction.prediction} match={match} slip={slip} />
                      {/* A Crear Apuesta prices the picks before kickoff: a live score would already decide some. */}
                      {match.status === 'TIMED' && <BetBuilder prediction={prediction.prediction} match={match} slip={slip} />}
                    </>
                  ) : (
                    // Once a match is decided its probabilities are 0 or 100, so an odd says nothing.
                    <p className="text-xs text-muted">Las cuotas estimadas de mercado se calculan solo para partidos por jugar o en vivo.</p>
                  ))}
              </div>
            ) : tab === 'Cuotas' ? (
              <OddsTable match={match} odds={bookmakerOdds.odds} state={bookmakerOdds.state} slip={slip} />
            ) : !details ? (
              waiting
            ) : tab === 'Resumen' || tab === 'Estadísticas' ? (
              <div className="space-y-5">
                {details.momentum && <MomentumPanel momentum={details.momentum} home={match.homeTeam.shortName} away={match.awayTeam.shortName} />}
                {tab === 'Resumen' ? (
                  <Summary match={match} events={details.events} />
                ) : (
                  <>
                    {details.simulated.includes('statistics') && <SimulatedBadge sample={details.sample} />}
                    <Statistics rows={details.statistics} />
                  </>
                )}
              </div>
            ) : (
              <>
                {details.simulated.includes('lineups') && <SimulatedBadge sample={details.sample} />}
                <Lineups match={match} details={details} />
              </>
            )}
          </div>
        </div>
      </div>
      <BetSlip slip={slip} docked />
    </dialog>
  )
}
