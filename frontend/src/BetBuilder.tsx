import { useState } from 'react'
import { DoubleChevronRightIcon, LayersCombineIcon, TicketSlipIcon } from './icons'
import { betBuilderMarkets, calculateCorrelatedOdd, fitModel, getPresetBetBuilders, isCompatible, jointProbability, type Choice } from './sameGameParlay'
import { kickoffLabel } from './status'
import type { Match, Prediction, SlipLeg } from './types'
import type { useBetSlip } from './useBetSlip'

const pill = (active: boolean) =>
  `cursor-pointer rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-200 ease-out hover:scale-[1.02] active:scale-[0.98] disabled:cursor-default disabled:opacity-35 disabled:hover:scale-100 ${
    active ? 'border-yellow bg-yellow text-forest' : 'border-line bg-surface text-ink hover:border-yellow'
  }`

// CREAR APUESTA · MISMO PARTIDO: three ready-made combos and a builder of this match's picks, each priced as one bet.
export function BetBuilder({
  prediction,
  match,
  slip,
}: {
  prediction: Extract<Prediction, { fallback: false }>
  match: Match
  slip: ReturnType<typeof useBetSlip>
}) {
  const [picked, setPicked] = useState<string[]>([]) // the builder's labels, one per market at most
  const chances = prediction.probabilities
  const model = fitModel(chances.home, chances.away, prediction.over_2_5_probability)
  const base = { match_id: match.id, home_team: match.homeTeam.shortName, away_team: match.awayTeam.shortName, kickoff_label: kickoffLabel(match) }
  const markets = betBuilderMarkets(base, chances, prediction.market_odds, model)
  const presets = getPresetBetBuilders(markets, chances, model)
  const legs = markets.flatMap((market) => market.choices.filter((choice) => picked.includes(choice.label)).map((choice) => choice.leg))
  const plain = legs.reduce((product, leg) => product * leg.odd, 1)
  const odd = legs.length > 1 ? calculateCorrelatedOdd(legs, model) : null
  const change = odd ? Math.round((odd / plain - 1) * 100) : 0
  const mine = slip.legs.filter((leg) => leg.match_id === match.id)
  const inSlip = (combo: SlipLeg[]) => mine.length === combo.length && combo.every((leg) => slip.has(leg))

  // A market takes one pick: another replaces it, and tapping the picked one again takes it out.
  const toggle = (choices: Choice[], label: string) =>
    setPicked((current) =>
      current.includes(label) ? current.filter((other) => other !== label) : [...current.filter((other) => !choices.some((choice) => choice.label === other)), label],
    )

  return (
    <section aria-label="Crear Apuesta, mismo partido" className="space-y-4 rounded-2xl border-2 border-yellow bg-surface p-4 text-sm">
      <h3 className="flex items-center gap-2 font-bold tracking-wide">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-yellow text-forest">
          <LayersCombineIcon className="size-4.5" />
        </span>
        CREAR APUESTA · MISMO PARTIDO
      </h3>

      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted">Combos IA</p>
        <div className="grid gap-2 sm:grid-cols-3">
          {presets.map((preset) => (
            <article key={preset.name} className="flex flex-col gap-2 rounded-xl border border-line bg-surface-2 p-3">
              <h4 className="text-xs font-bold">{preset.name}</h4>
              <ul className="flex-1 space-y-0.5 text-xs text-muted">
                {preset.legs.map((leg) => (
                  <li key={leg.market_category}>{leg.market_selection}</li>
                ))}
              </ul>
              <p className="flex items-baseline justify-between gap-2">
                <span className="text-[11px] text-muted">
                  Prob. <span className="font-num">{preset.probability}%</span>
                </span>
                <span className="font-num text-xl font-bold">{preset.odd.toFixed(2)}</span>
              </p>
              <button
                type="button"
                onClick={() => slip.addBuilder(preset.legs)}
                aria-pressed={inSlip(preset.legs)}
                className={`cursor-pointer rounded-full px-3 py-1.5 text-xs font-bold whitespace-nowrap transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 ${
                  inSlip(preset.legs) ? 'bg-yellow text-forest' : 'bg-chip text-cream'
                }`}
              >
                {inSlip(preset.legs) ? 'En tu cupón' : 'Agregar Combo al Cupón'}
              </button>
            </article>
          ))}
        </div>
      </div>

      <div className="space-y-2.5">
        <p className="text-xs font-semibold text-muted">Arma la tuya: marca 2 o 3 mercados</p>
        {markets.map((market) => (
          <div key={market.name} role="group" aria-label={market.name} className="flex flex-wrap items-center gap-1.5">
            <span className="w-full text-xs font-semibold">{market.name}</span>
            {market.choices.map((choice) => {
              const active = picked.includes(choice.label)
              // A pick no score lets win with the others is greyed out, as at a bookmaker.
              const fits = active || isCompatible([...legs.filter((leg) => !market.choices.some((other) => other.leg === leg)), choice.leg])
              return (
                <button
                  key={choice.label}
                  type="button"
                  onClick={() => toggle(market.choices, choice.label)}
                  disabled={!fits}
                  aria-pressed={active}
                  title={fits ? choice.leg.market_selection : 'No puede ganar junto con tus otras selecciones'}
                  className={pill(active)}
                >
                  {choice.label} <span className="font-num font-bold">{choice.leg.odd.toFixed(2)}</span>
                </button>
              )
            })}
          </div>
        ))}
      </div>

      <div aria-live="polite" className="space-y-1 rounded-xl bg-forest px-4 py-3 text-cream">
        {odd ? (
          <>
            <p className="flex items-baseline justify-between gap-3 text-xs text-cream/70">
              Cuotas sueltas multiplicadas
              <span className="font-num line-through">{plain.toFixed(2)}</span>
            </p>
            <p className="flex items-baseline justify-between gap-3 font-semibold">
              Cuota Crear Apuesta (con ajuste de correlación)
              <span className="font-num text-2xl font-bold text-yellow">{odd.toFixed(2)}</span>
            </p>
            <p className="text-[11px] text-cream/70">
              Probabilidad VYROX IA de que se cumplan juntas: <span className="font-num">{Math.round(100 * jointProbability(model, legs))}%</span> ·{' '}
              <span className="font-num">
                {change > 0 ? '+' : ''}
                {change}%
              </span>{' '}
              frente a multiplicarlas
            </p>
          </>
        ) : (
          <p className="text-xs text-cream/70">Marca al menos 2 mercados para ver la cuota de tu Crear Apuesta.</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => slip.addBuilder(legs)}
        disabled={!odd}
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-yellow px-4 py-2.5 font-bold whitespace-nowrap text-forest transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_6px_16px_-6px_rgb(244_213_109/0.7)] active:translate-y-0 disabled:cursor-default disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
      >
        <TicketSlipIcon className="size-4" />
        Enviar Crear Apuesta al Cupón
        <DoubleChevronRightIcon className="size-3.5" />
        {odd && <span className="font-num text-base">{odd.toFixed(2)}</span>}
      </button>
      <p className="text-xs text-muted">
        VYROX IA calcula la probabilidad de que tus selecciones se cumplan juntas con un modelo de Poisson de marcadores
        ajustado a su pronóstico: las que van de la mano (ganar y que haya goles) pagan menos que multiplicadas, las que se
        contradicen no se pueden marcar y un mercado que las demás ya traen solo recorta la cuota. Es una estimación de VYROX,
        no la cuota de ninguna casa.
      </p>
    </section>
  )
}
