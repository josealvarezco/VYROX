import { useState } from 'react'
import type { Match, Prediction } from './types'
import { usePrediction } from './usePrediction'

function PredictionCards({ prediction }: { prediction: Prediction }) {
  if (prediction.fallback) return <p className="text-amber-300">{prediction.reasoning}</p>
  const { home, draw, away } = prediction.probabilities
  const bars = [['Local', home], ['Empate', draw], ['Visitante', away]] as const
  const cards = [
    ['Apuesta Recomendada', prediction.recommended_bet],
    ['Confianza', prediction.confidence],
    ['Ambos Anotan', prediction.both_teams_to_score],
    ['Goles (2.5)', prediction.over_under_2_5],
  ] as const
  return (
    <div className="space-y-3">
      <div className="space-y-1.5 rounded-lg border border-neutral-800 bg-neutral-950/40 p-3">
        {bars.map(([label, value]) => (
          <div key={label} className="grid grid-cols-[4.5rem_1fr_2.5rem] items-center gap-2">
            <span className="text-neutral-400">{label}</span>
            <div className="h-2 overflow-hidden rounded-full bg-neutral-800" aria-hidden="true">
              <div className="h-full rounded-full bg-violet-500" style={{ width: `${value}%` }} />
            </div>
            <span className="text-right tabular-nums">{value}%</span>
          </div>
        ))}
      </div>
      <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {cards.map(([label, value]) => (
          <div key={label} className="rounded-lg border border-violet-500/30 bg-violet-500/10 p-2.5 first:col-span-2 sm:first:col-span-1">
            <dt className="text-xs text-neutral-400">{label}</dt>
            <dd className="mt-0.5 font-semibold text-violet-100">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="text-neutral-300">{prediction.reasoning}</p>
      <p className="text-xs text-neutral-500">Pronóstico generado por IA con fines informativos; no garantiza resultados.</p>
    </div>
  )
}

export function PredictionView({ prediction, state }: Pick<ReturnType<typeof usePrediction>, 'prediction' | 'state'>) {
  return (
    <div aria-live="polite" className="text-sm">
      {state === 'loading' && <p className="text-neutral-400">Analizando partido con Gemini IA...</p>}
      {state === 'error' && <p className="text-red-300">No se pudo conectar con el servidor. Vuelve a intentarlo.</p>}
      {prediction && <PredictionCards prediction={prediction} />}
    </div>
  )
}

export function AiPrediction({ match, league }: { match: Match; league: string }) {
  const [open, setOpen] = useState(false)
  const { prediction, state, load } = usePrediction(match, league)

  const toggle = () => {
    setOpen(!open)
    if (!open) load()
  }

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        className="col-span-full justify-self-end rounded-md border border-violet-500/40 px-2 py-1 text-xs text-violet-200 hover:bg-violet-500/10 sm:col-span-1"
      >
        Pronóstico IA ✨
      </button>
      {open && (
        <div className="col-span-full mt-2 rounded-lg bg-neutral-950/60 p-3">
          <PredictionView prediction={prediction} state={state} />
        </div>
      )}
    </>
  )
}
