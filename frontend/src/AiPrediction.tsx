import type { ReactNode } from 'react'
import { OddButton, StakeSimulator } from './BetSlip'
import { CheckIcon, CrossIcon, TicketSlipIcon, TrendUpIcon } from './icons'
import { fitModel, totalOdd } from './sameGameParlay'
import { kickoffLabel } from './status'
import type { Match, Prediction } from './types'
import type { useBetSlip } from './useBetSlip'
import type { usePrediction } from './usePrediction'

// Warm to cool accents of the palette: high confidence is orange, low is sky blue.
const CONFIDENCE: Record<string, string> = { Alta: 'bg-orange', Media: 'bg-peach', Baja: 'bg-sky' }

// VYROX IA at work: three bouncing dots in the brand colors.
export function Thinking({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-center gap-3 text-muted">
      <span aria-hidden="true" className="flex items-center gap-1 rounded-full bg-forest px-2.5 py-2">
        {[0, 150, 300].map((delay) => (
          <span key={delay} className="size-1.5 animate-bounce rounded-full bg-yellow" style={{ animationDelay: `${delay}ms` }} />
        ))}
      </span>
      {children}
    </p>
  )
}

// Estimated market odds for VYROX IA's probabilities. No bookmaker's real odds are available for these matches, so none are shown.
export function MarketOdds({
  prediction,
  match,
  slip,
}: {
  prediction: Extract<Prediction, { fallback: false }>
  match: Match
  slip: ReturnType<typeof useBetSlip>
}) {
  const odds = prediction.market_odds
  const home = match.homeTeam.shortName
  const away = match.awayTeam.shortName
  // The parlay legs' market labels and categories, so a pick reads the same in the slip wherever it came from.
  const markets = [
    ['Local (1)', 'result', `${home} - Resultado del partido`, odds.home],
    ['Empate (X)', 'result', 'Empate - Resultado del partido', odds.draw],
    ['Visitante (2)', 'result', `${away} - Resultado del partido`, odds.away],
    ['Más de 2.5 goles', 'goals', 'Más de 2.5 - Goles totales', odds.over_2_5],
    ['Menos de 2.5 goles', 'goals', 'Menos de 2.5 - Goles totales', odds.under_2_5],
    ['Ambos anotan: Sí', 'btts', 'Sí - Ambos anotan', odds.btts_yes],
    ['Ambos anotan: No', 'btts', 'No - Ambos anotan', odds.btts_no],
  ] as const
  // The match's model goes with each pick, so picks of this match in the slip are priced as one Crear Apuesta.
  const model = fitModel(prediction.probabilities.home, prediction.probabilities.away, prediction.over_2_5_probability)
  const pick = (market_category: string, market_selection: string, odd: number) => ({
    match_id: match.id,
    home_team: home,
    away_team: away,
    kickoff_label: kickoffLabel(match),
    market_selection,
    market_category,
    odd,
    model,
  })
  // The simulator multiplies what this match has in the slip, or the recommended play while nothing is picked.
  const mine = slip.legs.filter((leg) => leg.match_id === match.id)
  const simOdd = mine.length ? totalOdd(mine) : odds.recommended
  const multiplying =
    mine.length === 1 ? mine[0].market_selection : mine.length ? `tus ${mine.length} selecciones de este partido` : 'jugada recomendada'

  return (
    <section className="space-y-3 text-sm">
      <h3 className="flex items-center gap-1.5 font-bold">
        <TrendUpIcon className="size-4 text-gold" />
        Cuotas estimadas de mercado
      </h3>

      <div className="rounded-2xl border-2 border-yellow bg-surface p-4">
        <span className="rounded-full bg-yellow px-2 py-0.5 text-[10px] font-bold tracking-wide text-forest uppercase">
          Jugada recomendada
        </span>
        <div className="mt-2 flex items-end justify-between gap-3">
          <div>
            <p className="font-semibold">{prediction.recommended_bet}</p>
            <p className="text-xs text-muted">
              Probabilidad estimada: <span className="font-num">{prediction.recommended_bet_probability} %</span>
            </p>
          </div>
          {odds.recommended && (
            <OddButton
              pick={pick('recommended', `${prediction.recommended_bet} - Jugada VYROX IA`, odds.recommended)}
              slip={slip}
              className="flex shrink-0 items-center gap-1.5 px-3 py-1.5 text-2xl"
            >
              <TicketSlipIcon className="size-5" />
              {odds.recommended.toFixed(2)}
            </OddButton>
          )}
        </div>
      </div>

      <div className="grid grid-cols-6 gap-2">
        {markets.map(([label, category, market, value], index) =>
          value ? (
            // 1 X 2 share the first row; the two goal sides and the two both-score sides come in pairs.
            <OddButton
              key={label}
              pick={pick(category, market, value)}
              slip={slip}
              className={`${index < 3 ? 'col-span-2' : 'col-span-3'} p-2.5 text-center`}
            >
              <span className="block font-sans text-xs font-normal opacity-75">{label}</span>
              <span className="text-lg">{value.toFixed(2)}</span>
            </OddButton>
          ) : null,
        )}
      </div>

      {simOdd ? (
        <div className="space-y-3 rounded-2xl bg-surface-2 p-3">
          <p aria-live="polite" className="text-xs text-muted">
            Simulador en pesos colombianos (COP) con la cuota{' '}
            <span className="font-num font-semibold text-ink">{simOdd.toFixed(2)}</span> de {multiplying}
          </p>
          <StakeSimulator odd={simOdd} slip={slip} />
        </div>
      ) : null}

      <p className="text-xs text-muted">
        Toca una cuota para sumarla al Cupón de Apuestas VYROX. Son cuotas estimadas de mercado: la probabilidad de VYROX IA con el margen típico de una casa
        de apuestas. Es una estimación propia de VYROX, no la cuota de ninguna casa.
      </p>
    </section>
  )
}

function PredictionCards({ prediction }: { prediction: Prediction }) {
  if (prediction.fallback) return <p className="text-warn">{prediction.reasoning}</p>
  const { home, draw, away } = prediction.probabilities
  const bars = [['Local', home], ['Empate', draw], ['Visitante', away]] as const
  const confidence = (
    <span className={`rounded-full px-2.5 py-0.5 text-forest ${CONFIDENCE[prediction.confidence]}`}>{prediction.confidence}</span>
  )
  const bothScore = (
    <span className="inline-flex items-center gap-1">
      {prediction.both_teams_to_score === 'Sí' ? (
        <CheckIcon className="size-4 text-[#22C55E]" />
      ) : (
        <CrossIcon className="size-4 text-[#EF4444]" />
      )}
      {prediction.both_teams_to_score}
    </span>
  )
  const cards = [
    ['Apuesta Recomendada', prediction.recommended_bet],
    ['Confianza', confidence],
    ['Ambos Anotan', bothScore],
    ['Goles (2.5)', prediction.over_under_2_5],
  ] as const
  return (
    <div className="space-y-3">
      <div className="space-y-2 rounded-2xl border border-line bg-surface p-4">
        {bars.map(([label, value]) => (
          <div key={label} className="grid grid-cols-[4.5rem_1fr_3rem] items-center gap-3">
            <span className="text-muted">{label}</span>
            <div className="h-2.5 overflow-hidden rounded-full bg-chip" aria-hidden="true">
              <div
                className="h-full origin-left animate-grow rounded-full bg-yellow transition-all duration-500 ease-out"
                style={{ width: `${value}%` }}
              />
            </div>
            <span className="text-right font-num font-bold tabular-nums">{value}%</span>
          </div>
        ))}
      </div>
      <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {cards.map(([label, value]) => (
          <div key={label} className="rounded-2xl bg-forest p-3 text-cream first:col-span-2 sm:first:col-span-1">
            <dt className="text-xs text-cream/70">{label}</dt>
            <dd className="mt-1 font-bold">{value}</dd>
          </div>
        ))}
      </dl>
      <p>{prediction.reasoning}</p>
      <p className="text-xs text-muted">
        Análisis generado por el motor predictivo VYROX IA con fines informativos; no garantiza resultados.
      </p>
    </div>
  )
}

export function PredictionView({ prediction, state }: Pick<ReturnType<typeof usePrediction>, 'prediction' | 'state'>) {
  return (
    <div aria-live="polite" className="text-sm">
      {state === 'loading' && <Thinking>Analizando partido con VYROX IA...</Thinking>}
      {state === 'error' && <p className="text-warn">No se pudo conectar con el servidor. Vuelve a intentarlo.</p>}
      {prediction && <PredictionCards prediction={prediction} />}
    </div>
  )
}
