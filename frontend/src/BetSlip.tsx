import { useState, type ReactNode } from 'react'
import { Chevron, CrossIcon, TicketSlipIcon } from './icons'
import { STAKES, pesos } from './money'
import type { SlipLeg } from './types'
import { slipKey, totalOdd, type useBetSlip } from './useBetSlip'

type Slip = ReturnType<typeof useBetSlip>

// Share of the bank each profile stakes: its range, nearer the top the likelier the play.
const PROFILES = [
  { name: 'Conservador', low: 1, high: 2 },
  { name: 'Moderado · IA', low: 2.5, high: 5 },
  { name: 'Agresivo', low: 6, high: 10 },
]

const pill = (active: boolean) =>
  `cursor-pointer rounded-full border px-2.5 py-1 text-xs font-semibold transition-all duration-200 ease-out hover:scale-[1.02] active:scale-[0.98] ${
    active ? 'border-yellow bg-yellow text-forest' : 'border-line bg-surface text-ink'
  }`

// An odd that adds its pick to the slip or takes it out again; yellow while the pick is in.
export function OddButton({ pick, slip, className, children }: { pick: SlipLeg; slip: Slip; className: string; children: ReactNode }) {
  const picked = slip.has(pick)
  return (
    <button
      type="button"
      onClick={() => slip.toggle(pick)}
      aria-pressed={picked}
      aria-label={`${picked ? 'Quitar del' : 'Agregar al'} cupón: ${pick.market_selection}, cuota ${pick.odd.toFixed(2)}`}
      className={`cursor-pointer rounded-xl border font-num font-bold transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 ${
        picked ? 'border-yellow bg-yellow text-forest ring-2 ring-yellow/40' : 'border-line bg-surface-2 text-ink hover:border-yellow'
      } ${className}`}
    >
      {children}
    </button>
  )
}

function CopInput({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-1.5">
      <span className="whitespace-nowrap text-muted">{label}</span>
      <input
        type="number"
        min={0}
        step={1000}
        inputMode="numeric"
        aria-label={`${label} en COP`}
        value={value || ''}
        onChange={(event) => onChange(Math.max(0, Number(event.target.value)))}
        placeholder="0"
        className="w-full min-w-0 bg-transparent text-right font-num font-semibold outline-none"
      />
      <span className="text-xs text-muted">COP</span>
    </label>
  )
}

// Return of a stake typed in pesos, or of a share of the user's bank picked by risk profile.
export function StakeSimulator({ odd, slip }: { odd: number; slip: Slip }) {
  const [byBank, setByBank] = useState(false)
  const [stake, setStake] = useState(STAKES[0])
  const [profile, setProfile] = useState(1) // Moderado, VYROX IA's suggestion
  const chance = 100 / odd // fair odds, so this is VYROX IA's own probability
  const { low, high } = PROFILES[profile]
  const percent = Math.round((low + ((high - low) * chance) / 100) * 10) / 10
  const amount = byBank ? (slip.bank * percent) / 100 : stake
  const risk = chance >= 60 ? 'Bajo' : chance >= 35 ? 'Medio' : 'Alto'
  const rows = [
    ...(byBank ? [['Stake sugerido', `${percent}% de tu Bank (Riesgo ${risk})`, 'font-semibold']] : []),
    ['Total a apostar', `${pesos(amount)} COP`, 'font-semibold'],
    ['Ganancia neta si aciertas', `${pesos(amount * odd - amount)} COP`, 'font-bold text-yellow'],
    ['Retorno total', `${pesos(amount * odd)} COP`, 'text-xl font-bold'],
  ]

  return (
    <div className="space-y-3">
      <div className="flex gap-1.5">
        {['Monto en COP', 'Según mi Bank'].map((label, index) => (
          <button
            key={label}
            type="button"
            onClick={() => setByBank(index === 1)}
            aria-pressed={byBank === (index === 1)}
            className={pill(byBank === (index === 1))}
          >
            {label}
          </button>
        ))}
      </div>
      {byBank ? (
        <>
          <CopInput label="Tu bank total" value={slip.bank} onChange={slip.setBank} />
          <div className="flex flex-wrap gap-1.5">
            {PROFILES.map(({ name }, index) => (
              <button key={name} type="button" onClick={() => setProfile(index)} aria-pressed={profile === index} className={pill(profile === index)}>
                {name}
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-wrap gap-1.5">
            {STAKES.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setStake(value)}
                aria-pressed={stake === value}
                className={`font-num ${pill(stake === value)}`}
              >
                {pesos(value)}
              </button>
            ))}
          </div>
          <CopInput label="Monto" value={stake} onChange={setStake} />
        </>
      )}
      <dl aria-live="polite" className="space-y-1.5 rounded-2xl bg-forest px-4 py-3 text-cream">
        {rows.map(([label, value, style]) => (
          <div key={label} className="flex items-baseline justify-between gap-3">
            <dt className="text-xs text-cream/70">{label}</dt>
            <dd className={`text-right font-num ${style}`}>{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

// Floating and non-modal on the page, so odds can still be added from the cards while it is open. Docked in the
// Match Center, it is the modal's right column on desktop and a drawer above it on phones: never under the blur.
export function BetSlip({ slip, docked = false }: { slip: Slip; docked?: boolean }) {
  if (!slip.legs.length) return null
  const total = totalOdd(slip.legs)
  const sameMatch = new Set(slip.legs.map((leg) => leg.match_id)).size < slip.legs.length
  const layer = docked ? 'z-[60]' : 'z-30'

  return (
    <>
      {!slip.open && (
        <button
          type="button"
          onClick={() => slip.setOpen(true)}
          aria-label={`Abrir cupón: ${slip.legs.length} selecciones, cuota ${total.toFixed(2)}`}
          className={`fixed right-4 bottom-4 ${layer} flex cursor-pointer items-center gap-2 rounded-full bg-forest px-4 py-3 text-sm font-bold text-cream shadow-xl ring-1 ring-yellow/40 transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 ${
            docked ? 'lg:hidden' : ''
          }`}
        >
          <TicketSlipIcon className="size-5 text-yellow" />
          Cupón
          {/* Remounted on every change, so the count pops to confirm a pick while the slip is minimized. */}
          <span key={slip.legs.length} className="animate-pop rounded-full bg-yellow px-1.5 font-num text-xs text-forest">
            {slip.legs.length}
          </span>
          <span className="font-num text-yellow">{total.toFixed(2)}</span>
        </button>
      )}

      {(slip.open || docked) && (
        <aside
          aria-label="Cupón de Apuestas VYROX"
          className={`fixed inset-x-4 bottom-4 ${layer} max-h-[calc(100dvh-2rem)] animate-tab-in flex-col overflow-hidden rounded-3xl border border-line bg-modal text-sm text-ink shadow-2xl sm:left-auto sm:w-96 ${
            slip.open ? 'flex' : 'hidden lg:flex'
          } ${docked ? 'lg:static lg:ml-4 lg:max-h-[92vh]' : ''}`}
        >
          <header className="hero flex shrink-0 items-center gap-2 px-4 py-3">
            <TicketSlipIcon className="size-5 text-yellow" />
            <h2 className="font-bold">Cupón de Apuestas VYROX</h2>
            <span key={slip.legs.length} className="animate-pop rounded-full bg-yellow px-1.5 font-num text-xs font-bold text-forest">
              {slip.legs.length}
            </span>
            <button
              type="button"
              onClick={() => slip.setOpen(false)}
              aria-label="Minimizar cupón"
              className={`ml-auto grid size-8 cursor-pointer place-items-center rounded-full transition-all duration-200 ease-out hover:bg-cream/10 ${
                docked ? 'lg:invisible' : ''
              }`}
            >
              <Chevron direction="down" />
            </button>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <ul className="divide-y divide-dashed divide-line px-4">
              {slip.legs.map((leg) => (
                <li key={slipKey(leg)} className="flex items-center gap-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="leading-snug font-bold">{leg.market_selection}</p>
                    <p className="truncate text-xs text-muted">
                      {leg.home_team} - {leg.away_team} · <span className="font-num">{leg.kickoff_label}</span>
                    </p>
                  </div>
                  <span className="font-num font-bold">{leg.odd.toFixed(2)}</span>
                  <button
                    type="button"
                    onClick={() => slip.remove(leg)}
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
              {sameMatch && (
                <p className="text-xs text-warn">
                  Hay varias selecciones de un mismo partido. Esos mercados se influyen entre sí, así que la cuota
                  multiplicada es solo aproximada.
                </p>
              )}
              <StakeSimulator odd={total} slip={slip} />
              <button
                type="button"
                onClick={slip.clear}
                className="w-full cursor-pointer rounded-full border border-line py-1.5 font-semibold transition-all duration-200 ease-out hover:bg-surface-2"
              >
                Limpiar cupón
              </button>
              <p className="text-[11px] text-muted">
                Simulación con las cuotas justas de VYROX IA (100 ÷ probabilidad), no las de ninguna casa de apuestas. VYROX
                no recibe apuestas. +18 · Juega con responsabilidad.
              </p>
            </div>
          </div>
        </aside>
      )}
    </>
  )
}
