import { CheckIcon, CrossIcon } from './icons'
import type { Prediction } from './types'
import type { usePrediction } from './usePrediction'

// Warm to cool accents of the palette: high confidence is orange, low is sky blue.
const CONFIDENCE: Record<string, string> = { Alta: 'bg-orange', Media: 'bg-peach', Baja: 'bg-sky' }

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
      <p className="text-xs text-muted">Pronóstico generado por IA con fines informativos; no garantiza resultados.</p>
    </div>
  )
}

export function PredictionView({ prediction, state }: Pick<ReturnType<typeof usePrediction>, 'prediction' | 'state'>) {
  return (
    <div aria-live="polite" className="text-sm">
      {state === 'loading' && <p className="text-muted">Analizando partido con Gemini IA...</p>}
      {state === 'error' && <p className="text-warn">No se pudo conectar con el servidor. Vuelve a intentarlo.</p>}
      {prediction && <PredictionCards prediction={prediction} />}
    </div>
  )
}
