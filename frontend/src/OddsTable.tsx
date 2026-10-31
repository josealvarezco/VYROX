import { useState } from 'react'
import { Thinking } from './AiPrediction'
import { OddButton, TrendCorner } from './BetSlip'
import { selection } from './bookmakers'
import { kickoffLabel } from './status'
import type { Match, MatchOdds, OddsMarket } from './types'
import type { useBetSlip } from './useBetSlip'

const TABS = [
  ['1x2', '1X2'],
  ['goals', 'MÁS DE/MENOS DE'],
  ['btts', 'AMBOS EQUIPOS MARCARÁN'],
] as const
const LINES = [
  ['goals_2_5', '2.5 goles'],
  ['goals_1_5', '1.5 goles'],
] as const
const COLUMNS: Record<OddsMarket, [string, string][]> = {
  '1x2': [
    ['home', '1'],
    ['draw', 'X'],
    ['away', '2'],
  ],
  goals_2_5: [
    ['over', 'Más de'],
    ['under', 'Menos de'],
  ],
  goals_1_5: [
    ['over', 'Más de'],
    ['under', 'Menos de'],
  ],
  btts: [
    ['yes', 'Sí'],
    ['no', 'No'],
  ],
}
const NOTE = 'rounded-2xl border border-line bg-surface px-4 py-3 text-sm text-muted'

const pill = (active: boolean) =>
  `cursor-pointer rounded-full border px-3 py-1 text-xs font-bold transition-all duration-200 ease-out active:scale-[0.98] ${
    active ? 'border-yellow bg-yellow text-forest' : 'border-line bg-surface text-ink hover:bg-surface-2'
  }`

// CUOTAS · CASAS DE APUESTAS: the real odds of the bookmakers that quote the match, the best one of each column
// framed in yellow. A tapped odd goes to the bet slip with its bookmaker.
export function OddsTable({
  match,
  odds,
  state,
  slip,
}: {
  match: Match
  odds: MatchOdds | null
  state: 'idle' | 'loading' | 'error'
  slip: ReturnType<typeof useBetSlip>
}) {
  const [tab, setTab] = useState<(typeof TABS)[number][0]>('1x2')
  const [line, setLine] = useState<(typeof LINES)[number][0]>('goals_2_5')
  if (state === 'error') return <p className={NOTE}>No se pudieron consultar las cuotas de las casas. Vuelve a abrir la pestaña en un momento.</p>
  if (!odds) return <Thinking>Consultando las cuotas de las casas de apuestas...</Thinking>

  const market: OddsMarket = tab === 'goals' ? line : tab
  const columns = COLUMNS[market]
  const rows = odds.bookmakers.flatMap((bookmaker) => (bookmaker.markets[market] ? [{ name: bookmaker.name, quotes: bookmaker.markets[market] }] : []))
  const best = Object.fromEntries(columns.map(([side]) => [side, Math.max(...rows.map((row) => row.quotes[side]?.odd ?? 0))]))
  const open = match.status === 'TIMED' // pre-match odds take plays only before kickoff
  const home = match.homeTeam.shortName
  const away = match.awayTeam.shortName
  const updated =
    odds.updated &&
    new Date(odds.updated).toLocaleString('es-CO', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: 'America/Bogota' })

  return (
    <section className="space-y-3 text-sm">
      <h3 className="font-bold tracking-wide">CUOTAS · CASAS DE APUESTAS</h3>
      <div className="flex flex-wrap items-center gap-1.5">
        {TABS.map(([value, label]) => (
          <button key={value} type="button" aria-pressed={tab === value} onClick={() => setTab(value)} className={pill(tab === value)}>
            {label}
          </button>
        ))}
        {tab === 'goals' && (
          <span role="group" aria-label="Línea de goles" className="ml-auto flex gap-1 rounded-full bg-surface-2 p-0.5">
            {LINES.map(([value, label]) => (
              <button
                key={value}
                type="button"
                aria-pressed={line === value}
                onClick={() => setLine(value)}
                className={`cursor-pointer rounded-full px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 ease-out ${
                  line === value ? 'bg-yellow text-forest' : 'text-muted hover:text-ink'
                }`}
              >
                {label}
              </button>
            ))}
          </span>
        )}
      </div>

      {rows.length ? (
        <table className="w-full border-separate border-spacing-y-1.5">
          <thead>
            <tr className="text-xs text-muted">
              <th className="text-left font-semibold">Casa</th>
              {columns.map(([side, label]) => (
                <th key={side} className="font-semibold">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ name, quotes }) => (
              <tr key={name}>
                <th scope="row" className="pr-2 text-left">
                  <span className="inline-block rounded-lg bg-forest px-2 py-1 text-xs font-bold whitespace-nowrap text-cream ring-1 ring-line">{name}</span>
                </th>
                {columns.map(([side]) => {
                  const quote = quotes[side]
                  if (!quote) return <td key={side} />
                  const [market_selection, market_category] = selection(market, side, home, away)
                  const frame = quote.odd === best[side] ? 'ring-2 ring-yellow' : ''
                  return (
                    <td key={side} className="px-0.5">
                      {open ? (
                        <OddButton
                          pick={{ match_id: match.id, home_team: home, away_team: away, kickoff_label: kickoffLabel(match), market_selection, market_category, odd: quote.odd, bookmaker: name }}
                          slip={slip}
                          trend={quote.trend}
                          className={`flex w-full items-center justify-center gap-1 px-2 py-2 text-sm ${frame}`}
                        >
                          {quote.odd.toFixed(2)}
                        </OddButton>
                      ) : (
                        <span className={`relative flex items-center justify-center gap-1 rounded-xl border border-line bg-surface-2 px-2 py-2 font-num font-bold ${frame}`}>
                          <TrendCorner trend={quote.trend} />
                          {quote.odd.toFixed(2)}
                        </span>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className={NOTE}>Ninguna casa publica todavía este mercado para el partido.</p>
      )}

      <p className="text-xs text-muted">
        {!open && 'El partido ya empezó: son las cuotas previas al inicio, solo como referencia. '}
        Cuotas reales de las casas que publica API-Football, que las actualiza cada 3 horas{updated ? ` (última: ${updated})` : ''}. Una
        esquina verde o roja marca las cuotas que subieron o bajaron desde la consulta anterior de VYROX. Wplay, BetPlay, Rushbet y Stake no
        publican sus cuotas en esta fuente. +18 · Juega con responsabilidad.
      </p>
    </section>
  )
}
