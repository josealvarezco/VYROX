import { useEffect, useRef } from 'react'
import { BetSlip, OddButton } from './BetSlip'
import { CrossIcon, DoubleChevronRightIcon, ScaleCompareIcon, SparklesIcon } from './icons'
import { compareMatches, type ComparedSide } from './matchComparator'
import type { ForecastMatch } from './types'
import type { useBetSlip } from './useBetSlip'

type Slip = ReturnType<typeof useBetSlip>

// The duel's rows: a value from 0 to 100 for each side and the odd that goes with it.
const METRICS: [string, (side: ComparedSide) => [number, number | null]][] = [
  ['Jugada principal recomendada', (side) => [side.bestPick.probability, side.bestPick.odd]],
  ['Solidez del favorito (1X2)', (side) => [side.fav1x2Prob, side.fav1x2Odd]],
  ['Proyección de goles (+2.5)', (side) => [side.over25Prob, side.over25Odd]],
  ['Tendencia Ambos Anotan (BTTS)', (side) => [side.bttsProb, side.bttsOdd]],
  ['Índice de Seguridad VYROX', (side) => [side.safetyScore, null]],
]

const SELECT = 'w-full min-w-0 cursor-pointer truncate rounded-full border border-line bg-surface px-3.5 py-2 text-sm font-semibold text-ink'

function Column({ match, side, winner, played, slip }: { match: ForecastMatch; side: ComparedSide; winner: boolean; played: boolean; slip: Slip }) {
  const { bestPick } = side
  return (
    <div className={`relative flex flex-col items-center gap-2 rounded-2xl border p-3 pt-6 text-center ${winner ? 'border-yellow bg-yellow/10' : 'border-line bg-surface'}`}>
      {winner && (
        <span className="absolute -top-3 rounded-full bg-yellow px-2.5 py-0.5 text-[10px] font-extrabold tracking-wide whitespace-nowrap text-forest shadow">
          VEREDICTO IA: ENTRAR AQUÍ
        </span>
      )}
      <div className="flex items-center gap-2">
        <img src={match.home_logo} alt="" className="size-8 object-contain" />
        <span className="text-xs font-bold text-muted">VS</span>
        <img src={match.away_logo} alt="" className="size-8 object-contain" />
      </div>
      <p className="text-sm leading-snug font-bold">
        {match.home_team} <span className="font-normal text-muted">vs</span> {match.away_team}
      </p>
      <p className="flex items-center gap-1.5 text-xs text-muted">
        <img src={match.league_logo} alt="" className="size-4 rounded bg-white/90 object-contain p-px" />
        <span className="truncate">{match.league_name}</span> · <span className="font-num">{match.kickoff_label}</span>
      </p>
      <p className="mt-1 text-xs">
        Mejor jugada: <span className="font-semibold">{bestPick.market_selection}</span>
      </p>
      <div className="mt-auto w-full pt-1">
        {played ? (
          <p className="text-xs text-muted">Partido ya jugado: solo de referencia.</p>
        ) : (
          bestPick.odd && (
            <OddButton
              pick={{
                match_id: match.match_id,
                home_team: match.home_team,
                away_team: match.away_team,
                kickoff_label: match.kickoff_label,
                market_selection: bestPick.market_selection,
                market_category: bestPick.market_category,
                odd: bestPick.odd,
              }}
              slip={slip}
              className="flex w-full items-center justify-center gap-1.5 px-3 py-2 text-sm"
            >
              <span className="font-sans">Agregar jugada al Cupón</span>
              <DoubleChevronRightIcon className="size-3.5" />
              {bestPick.odd.toFixed(2)}
            </OddButton>
          )
        )}
      </div>
    </div>
  )
}

// "¿A cuál le entro? · Duelo de Valor VYROX IA": two matches of the date's forecast face to face, with the bet
// slip docked beside them on desktop like in the Match Center.
export function Comparator({
  matches,
  played,
  ids,
  onChange,
  onClose,
  slip,
}: {
  matches: ForecastMatch[]
  played: boolean
  ids: number[]
  onChange: (ids: number[]) => void
  onClose: () => void
  slip: Slip
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    if (!dialog.current?.open) dialog.current?.showModal()
  }, [])

  const [a, b] = [0, 1].map((index) => matches.find((match) => match.match_id === ids[index]))
  const duel = a && b ? { a, b, ...compareMatches(a, b) } : null
  const choose = (index: number, id: number) => onChange(index ? [ids[0], id] : [id, ids[1]])

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      aria-label="Comparador ¿A cuál le entro?"
      className={`m-0 size-full max-h-none max-w-none grid-cols-[minmax(0,48rem)] items-center justify-center overflow-hidden border-0 bg-transparent p-4 text-ink transition-[grid-template-columns] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] open:grid ${
        slip.docks ? 'lg:grid-cols-[minmax(0,48rem)_25rem]' : 'lg:grid-cols-[minmax(0,48rem)_0rem]'
      }`}
    >
      <div className="flex max-h-[92vh] flex-col overflow-hidden rounded-3xl border border-line bg-modal">
        <header className="hero flex shrink-0 items-center gap-3 px-5 py-4">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-yellow text-forest">
            <ScaleCompareIcon className="size-5" />
          </span>
          <div className="min-w-0">
            <h2 className="font-bold">¿A cuál le entro?</h2>
            <p className="text-xs text-cream/70">Duelo de Valor VYROX IA</p>
          </div>
          <button
            type="button"
            onClick={() => dialog.current?.close()}
            className="ml-auto inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold text-cream/85 transition-all duration-200 ease-out hover:bg-cream/10 hover:text-cream active:scale-[0.98]"
          >
            Cerrar
            <CrossIcon className="size-3.5" />
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5">
          <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
            {[0, 1].map((index) => (
              <label key={index} className={index ? 'order-3' : ''}>
                <span className="sr-only">Partido {index ? 'B' : 'A'}</span>
                <select value={ids[index] ?? ''} onChange={(event) => choose(index, Number(event.target.value))} className={SELECT}>
                  <option value="" disabled>
                    Partido {index ? 'B' : 'A'}
                  </option>
                  {matches.map((match) => (
                    <option key={match.match_id} value={match.match_id} disabled={match.match_id === ids[1 - index]}>
                      {match.home_team} vs {match.away_team} · {match.kickoff_label}
                    </option>
                  ))}
                </select>
              </label>
            ))}
            <span className="order-2 font-num text-sm font-bold text-muted">VS</span>
          </div>

          {!duel ? (
            <p className="rounded-2xl border border-line bg-surface px-4 py-6 text-center text-sm text-muted">
              Elige dos partidos de los que VYROX IA pronosticó para esta fecha y te dice a cuál entrarle.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Column match={duel.a} side={duel.A} winner={duel.verdict.winner === 'A'} played={played} slip={slip} />
                <Column match={duel.b} side={duel.B} winner={duel.verdict.winner === 'B'} played={played} slip={slip} />
              </div>

              <ul aria-label="Métricas enfrentadas" className="space-y-3.5">
                {METRICS.map(([label, value]) => {
                  const [[left, leftOdd], [right, rightOdd]] = [value(duel.A), value(duel.B)]
                  return (
                    <li key={label}>
                      <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
                        <span className={`font-num tabular-nums ${left >= right ? 'font-bold' : ''}`}>
                          {label.startsWith('Índice') ? left : `${left}%`}
                          {leftOdd && <span className="text-xs text-muted"> · {leftOdd.toFixed(2)}</span>}
                        </span>
                        <span className="text-center text-xs text-muted">{label}</span>
                        <span className={`text-right font-num tabular-nums ${right >= left ? 'font-bold' : ''}`}>
                          {rightOdd && <span className="text-xs text-muted">{rightOdd.toFixed(2)} · </span>}
                          {label.startsWith('Índice') ? right : `${right}%`}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-1" aria-hidden="true">
                        <div className="flex h-2 justify-end overflow-hidden rounded-l-full bg-line">
                          <div className="h-full origin-right animate-grow bg-yellow" style={{ width: `${left}%` }} />
                        </div>
                        <div className="h-2 overflow-hidden rounded-r-full bg-line">
                          <div className="h-full origin-left animate-grow bg-orange" style={{ width: `${right}%` }} />
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>

              <section aria-label="Conclusión de VYROX IA" className="space-y-2 rounded-2xl border-2 border-yellow bg-surface p-4">
                <p className="flex flex-wrap items-center gap-2">
                  <span className="flex items-center gap-1.5 font-bold">
                    <SparklesIcon className="size-4 text-gold" />
                    VYROX IA
                  </span>
                  <span className="rounded-full bg-yellow px-2 py-0.5 text-[10px] font-extrabold tracking-wide text-forest">{duel.verdict.badge}</span>
                </p>
                <p className="text-sm">{duel.verdict.explanation}</p>
              </section>
              <p className="text-[11px] text-muted">
                Con el pronóstico del día de VYROX IA y sus cuotas estimadas de mercado. El índice de seguridad suma lo
                clara que es la mejor jugada y lo que paga su cuota frente a esa probabilidad.
              </p>
            </>
          )}
        </div>
      </div>
      <BetSlip slip={slip} docked />
    </dialog>
  )
}
