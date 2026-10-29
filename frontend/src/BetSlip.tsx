import { useState } from 'react'
import { Chevron, CrossIcon, TicketSlipIcon } from './icons'
import { STAKES, pesos } from './money'
import type { useBetSlip } from './useBetSlip'

// Floating, non-modal panel, so odds can still be added from the cards while it is open.
export function BetSlip({ slip }: { slip: ReturnType<typeof useBetSlip> }) {
  const [stake, setStake] = useState(STAKES[0])
  if (!slip.legs.length) return null
  const total = Math.round(slip.legs.reduce((product, leg) => product * leg.odd, 1) * 100) / 100 // same rounding as the backend's total_odd

  if (!slip.open) {
    return (
      <button
        type="button"
        onClick={() => slip.setOpen(true)}
        aria-label={`Abrir cupón: ${slip.legs.length} selecciones, cuota ${total.toFixed(2)}`}
        className="fixed right-4 bottom-4 z-30 flex cursor-pointer items-center gap-2 rounded-full bg-forest px-4 py-3 text-sm font-bold text-cream shadow-xl ring-1 ring-yellow/40 transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0"
      >
        <TicketSlipIcon className="size-5 text-yellow" />
        Cupón
        <span className="rounded-full bg-yellow px-1.5 font-num text-xs text-forest">{slip.legs.length}</span>
        <span className="font-num text-yellow">{total.toFixed(2)}</span>
      </button>
    )
  }

  return (
    <aside
      aria-label="Cupón de Apuestas VYROX"
      className="fixed inset-x-4 bottom-4 z-30 flex max-h-[calc(100dvh-2rem)] animate-tab-in flex-col overflow-hidden rounded-3xl border border-line bg-modal text-sm shadow-2xl sm:left-auto sm:w-96"
    >
      <header className="hero flex items-center gap-2 px-4 py-3">
        <TicketSlipIcon className="size-5 text-yellow" />
        <h2 className="font-bold">Cupón de Apuestas VYROX</h2>
        <span className="rounded-full bg-yellow px-1.5 font-num text-xs font-bold text-forest">{slip.legs.length}</span>
        <button
          type="button"
          onClick={() => slip.setOpen(false)}
          aria-label="Minimizar cupón"
          className="ml-auto grid size-8 cursor-pointer place-items-center rounded-full transition-all duration-200 ease-out hover:bg-cream/10"
        >
          <Chevron direction="down" />
        </button>
      </header>

      <ul className="min-h-0 flex-1 divide-y divide-dashed divide-line overflow-y-auto px-4">
        {slip.legs.map((leg) => (
          <li key={leg.match_id} className="flex items-center gap-3 py-2.5">
            <div className="min-w-0 flex-1">
              <p className="leading-snug font-bold">{leg.market_selection}</p>
              <p className="truncate text-xs text-muted">
                {leg.home_team} - {leg.away_team} · <span className="font-num">{leg.kickoff_label}</span>
              </p>
            </div>
            <span className="font-num font-bold">{leg.odd.toFixed(2)}</span>
            <button
              type="button"
              onClick={() => slip.remove(leg.match_id)}
              aria-label={`Quitar ${leg.market_selection}`}
              className="grid size-7 shrink-0 cursor-pointer place-items-center rounded-full text-muted transition-all duration-200 ease-out hover:bg-surface-2 hover:text-ink"
            >
              <CrossIcon className="size-3.5" />
            </button>
          </li>
        ))}
      </ul>

      <div className="space-y-3 border-t border-line bg-surface px-4 py-3">
        <p className="flex items-center justify-between font-semibold">
          Cuota total multiplicada
          <span className="font-num text-xl font-bold">{total.toFixed(2)}</span>
        </p>
        <div className="flex flex-wrap gap-1.5">
          {STAKES.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setStake(value)}
              aria-pressed={stake === value}
              className={`cursor-pointer rounded-full border px-2.5 py-1 font-num text-xs font-semibold transition-all duration-200 ease-out hover:scale-[1.02] active:scale-[0.98] ${
                stake === value ? 'border-yellow bg-yellow text-forest' : 'border-line bg-surface-2 text-ink'
              }`}
            >
              {pesos(value)}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 rounded-full border border-line bg-surface-2 px-3.5 py-1.5">
          <span className="text-muted">Monto</span>
          <input
            type="number"
            min={0}
            step={1000}
            inputMode="numeric"
            aria-label="Monto en COP"
            value={stake || ''}
            onChange={(event) => setStake(Math.max(0, Number(event.target.value)))}
            placeholder="0"
            className="w-full min-w-0 bg-transparent text-right font-num font-semibold outline-none"
          />
          <span className="text-xs text-muted">COP</span>
        </label>
        <div aria-live="polite" className="rounded-2xl bg-forest px-4 py-3 text-cream">
          <p className="text-xs text-cream/70">Retorno potencial</p>
          <p className="font-num text-3xl leading-tight font-bold break-all text-yellow">{pesos(stake * total)} COP</p>
        </div>
        <button
          type="button"
          onClick={slip.clear}
          className="w-full cursor-pointer rounded-full border border-line py-1.5 font-semibold transition-all duration-200 ease-out hover:bg-surface-2"
        >
          Limpiar cupón
        </button>
        <p className="text-[11px] text-muted">
          Simulación con las cuotas justas de VYROX IA (100 ÷ probabilidad), no las de ninguna casa de apuestas. VYROX no
          recibe apuestas. +18 · Juega con responsabilidad.
        </p>
      </div>
    </aside>
  )
}
