import { useEffect, useRef, useState, type ReactNode } from 'react'
import { PredictionView } from './AiPrediction'
import { LIVE, statusText } from './status'
import type { Competition, Lineup, Match, MatchDetails, MatchEvent, Player, Side, Starter, Team } from './types'
import { usePrediction } from './usePrediction'

const TABS = ['Resumen', 'Estadísticas', 'Alineaciones', 'Pronóstico IA ✨'] as const
type Tab = (typeof TABS)[number]
type Substitution = Extract<MatchEvent, { type: 'subst' }>
const SIDES = ['home', 'away'] as const
const SIDE_COLOR = { home: 'bg-sky-500', away: 'bg-rose-500' } as const

function Icon({ symbol, label }: { symbol: string; label: string }) {
  return (
    <span role="img" aria-label={label}>
      {symbol}
    </span>
  )
}

function Note({ children }: { children: ReactNode }) {
  return <p className="py-8 text-center text-sm text-neutral-400">{children}</p>
}

function SimulatedBadge({ sample }: { sample: boolean }) {
  return (
    <p className="mb-4 inline-flex rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-0.5 text-xs text-amber-300">
      Datos simulados · {sample ? 'sin API key' : 'la liga no tiene cobertura'}
    </p>
  )
}

function TeamBadge({ team }: { team: Team }) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-2">
      <img src={team.crest} alt="" className="size-12 sm:size-16" />
      <span className="w-full truncate font-semibold">{team.shortName}</span>
    </div>
  )
}

function EventText({ event }: { event: MatchEvent }) {
  if (event.type === 'subst')
    return (
      <span>
        <Icon symbol="🔄" label="Cambio" /> <span className="text-emerald-400">↑ {event.player_in}</span>{' '}
        <span className="text-red-400">↓ {event.player_out}</span>
      </span>
    )
  if (event.type === 'goal')
    return (
      <span>
        <Icon symbol="⚽" label="Gol" /> <strong>{event.player}</strong>
        {event.detail && ` (${event.detail})`}
        {event.assist && <span className="text-neutral-400"> · asist. {event.assist}</span>}
      </span>
    )
  return (
    <span>
      {event.type === 'yellow' ? <Icon symbol="🟨" label="Tarjeta amarilla" /> : <Icon symbol="🟥" label="Tarjeta roja" />}{' '}
      {event.player}
    </span>
  )
}

function Summary({ match, events }: { match: Match; events: MatchEvent[] }) {
  const halfTime = match.score.halfTime
  const facts = (
    [
      ['Estadio', [match.venue?.name, match.venue?.city].filter(Boolean).join(', ')],
      ['Árbitro', match.referee],
      ['Medio tiempo', halfTime?.home != null ? `${halfTime.home} : ${halfTime.away}` : null],
    ] as [string, string | null | undefined][]
  ).filter(([, value]) => value)

  return (
    <div className="space-y-6">
      {events.length ? (
        <ol className="space-y-3">
          {events.map((event, index) => (
            <li key={index} className="grid grid-cols-[minmax(0,1fr)_3.5rem_minmax(0,1fr)] items-start gap-2 text-sm">
              <div className="text-right">{event.team === 'home' && <EventText event={event} />}</div>
              <span className="rounded-full bg-neutral-800 py-0.5 text-center text-xs font-semibold tabular-nums text-neutral-300">
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
        <dl className="grid gap-3 border-t border-neutral-800 pt-4 text-sm sm:grid-cols-3">
          {facts.map(([label, value]) => (
            <div key={label}>
              <dt className="text-neutral-400">{label}</dt>
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
              <span className="font-semibold tabular-nums">
                {home}
                {unit}
              </span>
              <span className="text-neutral-400">{label}</span>
              <span className="font-semibold tabular-nums">
                {away}
                {unit}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1" aria-hidden="true">
              <div className="flex h-2 justify-end overflow-hidden rounded-l-full bg-neutral-800">
                <div className={`h-full ${SIDE_COLOR.home}`} style={{ width: `${(home / total) * 100}%` }} />
              </div>
              <div className="h-2 overflow-hidden rounded-r-full bg-neutral-800">
                <div className={`h-full ${SIDE_COLOR.away}`} style={{ width: `${(away / total) * 100}%` }} />
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
  // Home defends the bottom goal and away the top one; column 1 goes on each team's right flank.
  return side === 'home' ? { left: `${100 - across}%`, top: `${100 - depth}%` } : { left: `${across}%`, top: `${depth}%` }
}

function Marks({ player }: { player: Player }) {
  const { goals, yellow, red, subbed_in, subbed_out } = player
  if (!goals && !yellow && !red && !subbed_in && !subbed_out) return null
  return (
    <span className="flex items-center gap-0.5 text-[10px] leading-tight [text-shadow:0_1px_2px_rgb(0_0_0)]">
      {Array.from({ length: goals }, (_, index) => (
        <Icon key={index} symbol="⚽" label="Gol" />
      ))}
      {yellow && <Icon symbol="🟨" label="Tarjeta amarilla" />}
      {red && <Icon symbol="🟥" label="Tarjeta roja" />}
      {subbed_out && (
        <span className="text-red-300">
          <Icon symbol="🔄" label="Salió" />
          {subbed_out}
        </span>
      )}
      {subbed_in && (
        <span className="text-emerald-300">
          <Icon symbol="🔄" label="Entró" />
          {subbed_in}
        </span>
      )}
    </span>
  )
}

function Pitch({ lineups }: { lineups: Record<Side, Lineup> }) {
  return (
    <div
      className="relative mx-auto aspect-[68/105] w-full max-w-md overflow-hidden rounded-lg bg-emerald-800"
      style={{ backgroundImage: 'repeating-linear-gradient(0deg, rgb(255 255 255 / 0.04) 0 10%, transparent 10% 20%)' }}
    >
      <svg
        viewBox="0 0 68 105"
        className="absolute inset-0 size-full"
        fill="none"
        stroke="rgb(255 255 255 / 0.45)"
        strokeWidth="0.35"
        aria-hidden="true"
      >
        <rect x="1" y="1" width="66" height="103" />
        <line x1="1" y1="52.5" x2="67" y2="52.5" />
        <circle cx="34" cy="52.5" r="9.15" />
        <rect x="13.84" y="1" width="40.32" height="16.5" />
        <rect x="24.84" y="1" width="18.32" height="5.5" />
        <rect x="13.84" y="87.5" width="40.32" height="16.5" />
        <rect x="24.84" y="98.5" width="18.32" height="5.5" />
        <g fill="rgb(255 255 255 / 0.45)" stroke="none">
          <circle cx="34" cy="52.5" r="0.6" />
          <circle cx="34" cy="12" r="0.5" />
          <circle cx="34" cy="93" r="0.5" />
        </g>
      </svg>
      {SIDES.map((side) =>
        lineups[side].starters.map((player, index, starters) => (
          <div
            key={`${side}-${index}`}
            className="absolute flex w-16 -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center"
            style={spot(side, player, starters)}
          >
            <span
              className={`grid size-7 place-items-center rounded-full text-xs font-bold text-white ring-2 ring-white/80 ${SIDE_COLOR[side]}`}
            >
              {player.number}
            </span>
            <span className="mt-0.5 w-full truncate text-[10px] leading-tight font-medium text-white [text-shadow:0_1px_2px_rgb(0_0_0)]">
              {player.name}
            </span>
            <Marks player={player} />
          </div>
        )),
      )}
    </div>
  )
}

function TeamLine({ team, lineup }: { team: Team; lineup: Lineup }) {
  return (
    <p className="flex flex-wrap items-center justify-center gap-x-2 text-sm">
      <img src={team.crest} alt="" className="size-5" />
      <span className="font-semibold">{team.shortName}</span>
      <span className="text-neutral-400">
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
      <TeamLine team={match.awayTeam} lineup={lineups.away} />
      <Pitch lineups={lineups} />
      <TeamLine team={match.homeTeam} lineup={lineups.home} />

      <section>
        <h3 className="mb-2 text-sm font-semibold">Cambios realizados</h3>
        {substitutions.length ? (
          <ul className="space-y-1.5 text-sm">
            {substitutions.map((event, index) => (
              <li key={index} className="flex flex-wrap items-center gap-x-2">
                <span className="w-12 text-xs tabular-nums text-neutral-400">{event.minute}</span>
                <img src={teams[event.team].crest} alt={teams[event.team].shortName} className="size-4" />
                <span className="text-emerald-400">↑ {event.player_in}</span>
                <span className="text-red-400">↓ {event.player_out}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-neutral-400">Sin cambios todavía.</p>
        )}
      </section>

      <section>
        <h3 className="mb-2 text-sm font-semibold">Banca de suplentes</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {SIDES.map((side) => (
            <div key={side}>
              <p className="mb-1 text-xs text-neutral-400">{teams[side].shortName}</p>
              <ul className="space-y-1 text-sm">
                {lineups[side].substitutes.map((player, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="w-6 shrink-0 text-right text-xs tabular-nums text-neutral-400">{player.number}</span>
                    <span className="truncate">{player.name}</span>
                    {player.subbed_in && <span className="shrink-0 text-xs text-emerald-400">↑ {player.subbed_in}</span>}
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
      <h3 className="mb-2 text-sm font-semibold">Últimos {played} enfrentamientos directos</h3>
      <table className="w-full table-fixed text-sm">
        <thead className="text-xs text-neutral-400">
          <tr>
            <th className="w-24 pb-1 text-left font-normal">Fecha</th>
            <th className="pb-1 text-right font-normal">Local</th>
            <th className="w-16 pb-1 font-normal">Marcador</th>
            <th className="pb-1 text-left font-normal">Visitante</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-800">
          {h2h.matches.map((meeting) => (
            <tr key={meeting.id}>
              <td className="py-1.5 text-xs text-neutral-400" title={meeting.league}>
                {new Date(`${meeting.date}T12:00:00`).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}
              </td>
              <td className="truncate py-1.5 text-right">{meeting.home}</td>
              <td className="py-1.5 text-center font-semibold tabular-nums">
                {meeting.home_goals} : {meeting.away_goals}
              </td>
              <td className="truncate py-1.5">{meeting.away}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        {summary.map(([label, value]) => (
          <span key={label} className="rounded-full border border-neutral-700 px-2.5 py-1">
            <span className="text-neutral-400">{label}:</span> <span className="font-semibold">{value}</span>
          </span>
        ))}
      </div>
    </section>
  )
}

export function MatchCenter({ match, competition, onClose }: { match: Match; competition: Competition; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [tab, setTab] = useState<Tab>('Resumen')
  const [details, setDetails] = useState<MatchDetails | null>(null)
  const [failed, setFailed] = useState(false)
  const prediction = usePrediction(match, competition.name)

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
    if (next === 'Pronóstico IA ✨') prediction.load() // Gemini is only asked when someone opens its tab
  }

  const { home, away } = match.score.fullTime
  const live = LIVE.has(match.status)
  const kickoff = new Date(match.utcDate).toLocaleString('es-CO', { dateStyle: 'long', timeStyle: 'short' })
  const waiting = <Note>{failed ? 'No se pudieron cargar los datos del partido.' : 'Cargando datos del partido…'}</Note>

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      aria-label={`${match.homeTeam.shortName} vs ${match.awayTeam.shortName}`}
      className="m-auto max-h-[92vh] w-[calc(100%-2rem)] max-w-3xl flex-col overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900 p-0 text-neutral-100 backdrop:bg-black/70 open:flex"
    >
      <header className="shrink-0 border-b border-neutral-800 px-5 pt-4">
        <div className="flex items-center justify-between gap-3 text-sm text-neutral-400">
          <span className="flex min-w-0 items-center gap-2">
            <img src={competition.emblem} alt="" className="size-5" />
            <span className="truncate">
              {competition.name} · {competition.area.name}
            </span>
          </span>
          <button
            type="button"
            onClick={() => dialog.current?.close()}
            className="shrink-0 rounded-md px-2 py-1 text-neutral-300 hover:bg-neutral-800"
          >
            Cerrar ✕
          </button>
        </div>

        <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 text-center">
          <TeamBadge team={match.homeTeam} />
          <div>
            <p className={`text-4xl font-bold tabular-nums ${live ? 'text-emerald-400' : ''}`}>
              {home ?? '-'} : {away ?? '-'}
            </p>
            <p className={`mt-1 text-sm ${live ? 'text-emerald-400' : 'text-neutral-400'}`}>
              {statusText(match)}
              {live && match.minute ? ` · ${match.minute}'` : ''}
            </p>
          </div>
          <TeamBadge team={match.awayTeam} />
        </div>
        <p className="mt-3 text-center text-xs text-neutral-400">{[kickoff, match.round].filter(Boolean).join(' · ')}</p>

        <div role="tablist" aria-label="Secciones del partido" className="mt-3 flex overflow-x-auto">
          {TABS.map((name, index) => (
            <button
              key={name}
              type="button"
              role="tab"
              id={`match-tab-${index}`}
              aria-selected={tab === name}
              aria-controls="match-tab-panel"
              onClick={() => openTab(name)}
              className={`shrink-0 border-b-2 px-3 py-2 text-sm whitespace-nowrap ${
                tab === name ? 'border-violet-400 font-semibold text-white' : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      </header>

      <div
        id="match-tab-panel"
        role="tabpanel"
        aria-labelledby={`match-tab-${TABS.indexOf(tab)}`}
        className="min-h-0 flex-1 overflow-y-auto px-5 py-5"
      >
        {tab === 'Pronóstico IA ✨' ? (
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
    </dialog>
  )
}
