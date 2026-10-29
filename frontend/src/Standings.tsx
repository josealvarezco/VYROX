import { useEffect, useState } from 'react'
import type { Match, Result, Side, Standing, StandingsResponse, Team } from './types'

const VIEWS = ['Tabla completa', 'Solo rivales'] as const
const SIDES = ['home', 'away'] as const
const BADGE = { home: 'LOCAL', away: 'VISITA' } as const
const RESULT: Record<Result, [string, string]> = {
  V: ['Victoria', 'bg-[#16A34A] text-white'],
  E: ['Empate', 'bg-muted/25 text-ink'],
  D: ['Derrota', 'bg-orange text-forest'],
}
const COLUMNS = [
  ['PJ', 'Partidos jugados', 'w-9'],
  ['G', 'Ganados', 'w-9'],
  ['E', 'Empatados', 'w-9'],
  ['P', 'Perdidos', 'w-9'],
  ['GF:GC', 'Goles a favor y en contra', 'w-14'],
  ['DG', 'Diferencia de gol', 'w-10'],
  ['PTS', 'Puntos', 'w-11'],
] as const
// Lower is better for the position and the goals conceded.
const FACE_OFF = [
  ['Posición', 'rank', true],
  ['Puntos', 'points', false],
  ['Goles a favor', 'goals_for', false],
  ['Goles en contra', 'goals_against', true],
] as const
// Zone bars by order down the table; relegation is always orange.
const ZONES = ['bg-[#16A34A]', 'bg-sky', 'bg-peach', 'bg-muted']
const CELL = 'px-1.5 py-2 text-center font-num tabular-nums'

// Tables loaded this session, by request: back on the tab, or on another match of the league, they show at once.
const tables = new Map<string, StandingsResponse>()

function Form({ results }: { results: Result[] }) {
  return (
    <span className="flex gap-1">
      {results.map((result, index) => (
        <abbr
          key={index}
          title={RESULT[result][0]}
          className={`grid size-6 shrink-0 place-items-center rounded-md font-num text-xs font-bold no-underline ${RESULT[result][1]}`}
        >
          {result}
        </abbr>
      ))}
    </span>
  )
}

function Crest({ src }: { src: string | null }) {
  return src ? <img src={src} alt="" className="size-5 shrink-0 object-contain" /> : <span className="size-5 shrink-0 rounded-full bg-line" />
}

function FaceOff({ rows, teams }: { rows: Record<Side, Standing>; teams: Record<Side, Team> }) {
  return (
    // The border sits on a wrapper: a table with collapsed borders ignores border-radius.
    <div className="rounded-2xl border border-line">
      <table className="w-full table-fixed text-sm">
        <thead>
          <tr>
            <th className="px-4 pt-3 pb-1.5 text-left">
              <span className="flex min-w-0 items-center gap-2">
                <Crest src={teams.home.crest} />
                {/* A phone leaves room for the crests only, in the same sides as the match header. */}
                <span className="truncate max-sm:sr-only">{teams.home.shortName}</span>
              </span>
            </th>
            <th className="w-28 pt-3 pb-1.5 text-xs font-semibold text-muted sm:w-32">Cara a cara</th>
            <th className="px-4 pt-3 pb-1.5 text-right">
              <span className="flex min-w-0 items-center justify-end gap-2">
                <span className="truncate max-sm:sr-only">{teams.away.shortName}</span>
                <Crest src={teams.away.crest} />
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          {FACE_OFF.map(([label, key, lowerWins]) => {
            const best = (lowerWins ? Math.min : Math.max)(rows.home[key], rows.away[key])
            const value = (side: Side) => (key === 'rank' ? `${rows[side][key]}.º` : rows[side][key])
            const mark = (side: Side) => `px-4 py-1.5 font-num tabular-nums ${rows[side][key] === best ? 'font-bold' : 'text-muted'}`
            return (
              <tr key={key}>
                <td className={mark('home')}>{value('home')}</td>
                <th scope="row" className="py-1.5 text-xs font-normal text-muted">
                  {label}
                </th>
                <td className={`text-right ${mark('away')}`}>{value('away')}</td>
              </tr>
            )
          })}
          {/* Full width: two rows of five pills beside a label do not fit on a phone, so the visitor's wraps below. */}
          <tr>
            <td colSpan={3} className="px-4 pt-1.5 pb-3">
              <p className="mb-1.5 text-center text-xs text-muted">Forma</p>
              <div className="flex flex-wrap justify-between gap-2">
                <Form results={rows.home.form} />
                <span className="ml-auto">
                  <Form results={rows.away.form} />
                </span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export function Standings({ match }: { match: Match }) {
  const teams = { home: match.homeTeam, away: match.awayTeam }
  const params = new URLSearchParams({
    season: String(match.league.season),
    home_team_id: String(match.homeTeam.id),
    away_team_id: String(match.awayTeam.id),
    home_team: match.homeTeam.shortName,
    away_team: match.awayTeam.shortName,
  })
  const url = `/api/leagues/${match.league.league_id}/standings?${params}`
  const [data, setData] = useState(() => tables.get(url) ?? null)
  const [failed, setFailed] = useState(false)
  const [view, setView] = useState<(typeof VIEWS)[number]>('Tabla completa')

  useEffect(() => {
    if (tables.has(url)) return
    let current = true // drop the answer if the tab closed meanwhile
    fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error(response.statusText)
        return response.json()
      })
      .then((body: StandingsResponse) => {
        tables.set(url, body)
        if (current) setData(body)
      })
      .catch(() => current && setFailed(true))
    return () => {
      current = false
    }
  }, [url])

  if (!data)
    return (
      <p className="py-8 text-center text-sm text-muted">
        {failed ? 'No se pudo cargar la tabla de posiciones.' : 'Cargando tabla de posiciones…'}
      </p>
    )

  // The match's teams by id, or by name when the table has no id for them.
  const sideOf = (row: Standing) => SIDES.find((side) => row.team_id === teams[side].id || row.team_name === teams[side].shortName)
  const [home, away] = SIDES.map((side) => data.standings.find((row) => sideOf(row) === side))
  const rivals = view === 'Solo rivales'
  const rows = rivals ? data.standings.filter(sideOf) : data.standings
  const zones = [...new Set(data.standings.map((row) => row.description).filter((zone) => zone !== null))]
  const others = zones.filter((zone) => zone !== 'Descenso')
  const zoneColor = (zone: string) => (zone === 'Descenso' ? 'bg-orange' : ZONES[others.indexOf(zone) % ZONES.length])
  const legend = zones.filter((zone) => rows.some((row) => row.description === zone))

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {VIEWS.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => setView(name)}
            aria-pressed={view === name}
            className={`cursor-pointer rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-all duration-200 ease-out hover:scale-[1.02] active:scale-[0.98] ${
              view === name ? 'border-yellow bg-yellow text-forest' : 'border-line bg-surface text-ink hover:bg-surface-2'
            }`}
          >
            {name}
          </button>
        ))}
        {data.group && <span className="ml-auto text-xs font-semibold text-muted">{data.group}</span>}
      </div>
      {data.is_simulated && (
        <p className="inline-flex rounded-full border border-orange/50 bg-orange/10 px-2.5 py-0.5 text-xs font-semibold text-warn">
          Datos simulados · tabla no disponible
        </p>
      )}

      {rivals && !(home && away) ? (
        <p className="py-8 text-center text-sm text-muted">Los dos equipos del partido no aparecen en esta tabla.</p>
      ) : (
        <>
          {/* Phones scroll the table sideways: ten columns do not fit legibly in 340 px. */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[42rem] table-fixed text-sm">
              <thead className="text-xs text-muted">
                <tr>
                  <th scope="col" className="w-10 py-2 font-semibold">
                    <abbr title="Posición" className="no-underline">
                      #
                    </abbr>
                  </th>
                  <th scope="col" className="py-2 text-left font-semibold">
                    Equipo
                  </th>
                  {COLUMNS.map(([short, long, width]) => (
                    <th key={short} scope="col" className={`py-2 font-semibold ${width}`}>
                      <abbr title={long} className="no-underline">
                        {short}
                      </abbr>
                    </th>
                  ))}
                  <th scope="col" className="w-40 py-2 pl-3 text-left font-semibold">
                    Forma
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((row) => {
                  const side = sideOf(row)
                  return (
                    <tr key={row.team_id ?? row.team_name} className={side ? 'bg-pick outline -outline-offset-1 outline-yellow' : ''}>
                      <td className="relative py-2 text-center font-num font-bold tabular-nums">
                        {row.description && (
                          <span
                            role="img"
                            aria-label={row.description}
                            title={row.description}
                            className={`absolute inset-y-1.5 left-0 w-1 rounded-full ${zoneColor(row.description)}`}
                          />
                        )}
                        {row.rank}
                      </td>
                      <td className="py-2 pr-2">
                        <span className="flex min-w-0 items-center gap-2">
                          <Crest src={side ? teams[side].crest : row.team_logo} />
                          <span className="truncate font-semibold">{row.team_name}</span>
                          {side && (
                            <span className="shrink-0 rounded bg-yellow px-1 py-px text-[10px] leading-tight font-bold tracking-wide text-forest">
                              {BADGE[side]}
                            </span>
                          )}
                        </span>
                      </td>
                      <td className={CELL}>{row.played}</td>
                      <td className={CELL}>{row.win}</td>
                      <td className={CELL}>{row.draw}</td>
                      <td className={CELL}>{row.lose}</td>
                      <td className={CELL}>
                        {row.goals_for}:{row.goals_against}
                      </td>
                      <td className={CELL}>{row.goals_diff > 0 ? `+${row.goals_diff}` : row.goals_diff}</td>
                      <td className={`${CELL} font-bold`}>{row.points}</td>
                      <td className="py-2 pl-3">
                        <Form results={row.form} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {rivals && home && away && <FaceOff rows={{ home, away }} teams={teams} />}
          {legend.length > 0 && (
            <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted">
              {legend.map((zone) => (
                <li key={zone} className="flex items-center gap-1.5">
                  <span className={`h-3 w-1 rounded-full ${zoneColor(zone)}`} />
                  {zone}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  )
}
