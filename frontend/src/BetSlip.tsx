import { useState, type ReactNode } from 'react'
import { CheckIcon, Chevron, CrossIcon, ShareIcon, StopwatchIcon, TicketSlipIcon, TrashIcon } from './icons'
import { STAKES, pesos } from './money'
import { ShareButton } from './ShareButton'
import { playCard } from './shareCard'
import { statusText } from './status'
import type { SavedTicket, SlipLeg } from './types'
import { slipKey, totalOdd, type useBetSlip } from './useBetSlip'

type Slip = ReturnType<typeof useBetSlip>

// Share of the bank each profile stakes: its range, nearer the top the likelier the play.
const PROFILES = [
  { name: 'Conservador', low: 1, high: 2 },
  { name: 'Moderado · IA', low: 2.5, high: 5 },
  { name: 'Agresivo', low: 6, high: 10 },
]

const BADGES = {
  pending: { label: 'PENDIENTE', style: 'bg-yellow text-forest', Icon: StopwatchIcon },
  won: { label: 'GANADA', style: 'bg-[#1d7a3e] text-cream', Icon: CheckIcon },
  lost: { label: 'PERDIDA', style: 'bg-orange text-forest', Icon: CrossIcon },
}

const pill = (active: boolean) =>
  `cursor-pointer rounded-full border px-2.5 py-1 text-xs font-semibold transition-all duration-200 ease-out hover:scale-[1.02] active:scale-[0.98] ${
    active ? 'border-yellow bg-yellow text-forest' : 'border-line bg-surface text-ink'
  }`

const signed = (value: number) => `${value < 0 ? '-' : '+'}${pesos(Math.abs(value))}`

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

const ICON_BUTTON =
  'grid size-7 shrink-0 cursor-pointer place-items-center rounded-full text-muted transition-all duration-200 ease-out hover:bg-surface-2 hover:text-ink'

function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} title={label} className={ICON_BUTTON}>
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
        className="w-full min-w-0 bg-transparent text-right font-num font-semibold text-ink outline-none"
      />
      <span className="text-xs text-muted">COP</span>
    </label>
  )
}

// Return of a stake typed in pesos, or of a share of the user's bank picked by risk profile.
export function StakeSimulator({ odd, slip, onRegister }: { odd: number; slip: Slip; onRegister?: (stake: number) => void }) {
  const [byBank, setByBank] = useState(false)
  const [stake, setStake] = useState(STAKES[0])
  const [profile, setProfile] = useState(1) // Moderado, VYROX IA's suggestion
  const chance = 100 / odd // fair odds, so this is VYROX IA's own probability
  const { low, high } = PROFILES[profile]
  const percent = Math.round((low + ((high - low) * chance) / 100) * 10) / 10
  const amount = Math.round(byBank ? (slip.bank * percent) / 100 : stake)
  const risk = chance >= 60 ? 'Bajo' : chance >= 35 ? 'Medio' : 'Alto'
  const short = slip.bank > 0 && amount > slip.bank // a configured bank has to cover the stake
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
      {onRegister && (
        <>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onRegister(amount)}
              disabled={!amount || short}
              className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-yellow py-2.5 font-bold text-forest transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_6px_16px_-6px_rgb(244_213_109/0.7)] active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              <TicketSlipIcon className="size-4" />
              Registrar Jugada
            </button>
            <ShareButton
              draw={() => playCard(slip.legs, odd, amount, Math.round(amount * odd))}
              filename="vyrox-jugada-cupon.png" // not registered yet, so no play id
              label="Compartir cupón"
              className="flex cursor-pointer items-center gap-1.5 rounded-full border border-line px-3.5 font-semibold transition-all duration-200 ease-out hover:bg-surface-2"
            >
              <ShareIcon />
              Compartir
            </ShareButton>
          </div>
          {short && <p className="text-xs text-warn">Tu bank de {pesos(slip.bank)} COP no alcanza para este monto.</p>}
        </>
      )}
    </div>
  )
}

function TicketCard({ ticket, slip }: { ticket: SavedTicket; slip: Slip }) {
  const { label, style, Icon } = BADGES[ticket.status]
  const pending = ticket.status === 'pending'
  const back = ticket.status === 'lost' ? 0 : ticket.potential_return
  const created = new Date(ticket.createdAt)
    .toLocaleString('es-CO', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: 'America/Bogota' })
    .replace(',', '')

  return (
    <article className="rounded-2xl border border-line bg-surface p-3">
      <header className="flex items-center gap-2">
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide ${style}`}>
          <Icon className="size-3" />
          {label}
        </span>
        <span className="font-num text-xs text-muted">{created}</span>
        <span className="ml-auto flex">
          {pending && (
            <>
              <IconButton label="Marcar como ganada" onClick={() => slip.settleTicket(ticket.id, 'won')}>
                <CheckIcon className="size-4" />
              </IconButton>
              <IconButton label="Marcar como perdida" onClick={() => slip.settleTicket(ticket.id, 'lost')}>
                <CrossIcon className="size-4" />
              </IconButton>
            </>
          )}
          <ShareButton
            draw={() => playCard(ticket.legs, ticket.total_odd, ticket.stake, ticket.potential_return, ticket.status)}
            filename={`vyrox-jugada-${ticket.id}.png`}
            label="Compartir jugada"
            className={ICON_BUTTON}
          >
            <ShareIcon />
          </ShareButton>
          <IconButton label="Eliminar jugada" onClick={() => slip.removeTicket(ticket.id)}>
            <TrashIcon className="size-4" />
          </IconButton>
        </span>
      </header>

      <ul className="mt-1 divide-y divide-dashed divide-line">
        {ticket.legs.map((leg) => {
          const match = slip.matches.find((item) => item.id === leg.match_id)
          const { home, away } = match?.score.fullTime ?? { home: null, away: null }
          return (
            <li key={slipKey(leg)} className="flex items-center gap-2 py-1.5">
              {leg.status === 'won' ? (
                <CheckIcon className="size-4 text-sub-in" label="Cumplida" />
              ) : leg.status === 'lost' ? (
                <CrossIcon className="size-4 text-sub-out" label="Fallida" />
              ) : (
                <StopwatchIcon className="size-4 text-muted" label="Pendiente" />
              )}
              <div className="min-w-0 flex-1">
                <p className="leading-snug font-semibold">{leg.market_selection}</p>
                <p className="truncate text-xs text-muted">
                  {leg.home_team} - {leg.away_team} ·{' '}
                  <span className="font-num">{match && home !== null ? `${home}-${away} ${statusText(match)}` : leg.kickoff_label}</span>
                </p>
              </div>
              <span className="font-num font-bold">{leg.odd.toFixed(2)}</span>
            </li>
          )
        })}
      </ul>

      <dl className="mt-1 grid grid-cols-3 gap-2 border-t border-line pt-2 text-xs">
        <div>
          <dt className="text-muted">Apostado</dt>
          <dd className="font-num font-semibold">{pesos(ticket.stake)} COP</dd>
        </div>
        <div>
          <dt className="text-muted">Cuota</dt>
          <dd className="font-num font-semibold">{ticket.total_odd.toFixed(2)}</dd>
        </div>
        <div>
          <dt className="text-muted">{pending ? 'Retorno posible / Profit' : 'Retorno / Profit'}</dt>
          <dd className="font-num font-semibold">
            {pesos(back)} / <span className={ticket.status === 'lost' ? 'text-warn' : 'text-gold'}>{signed(back - ticket.stake)}</span>
          </dd>
        </div>
      </dl>
    </article>
  )
}

function MyBets({ slip }: { slip: Slip }) {
  const { tickets } = slip
  const count = (status: SavedTicket['status']) => tickets.filter((ticket) => ticket.status === status).length
  const settled = tickets.filter((ticket) => ticket.status !== 'pending')
  const staked = settled.reduce((sum, ticket) => sum + ticket.stake, 0)
  const profit = settled.reduce((sum, ticket) => sum + (ticket.status === 'won' ? ticket.potential_return : 0), 0) - staked
  const kpis = [
    ['Profit neto', `${signed(profit)} COP`, profit < 0 ? 'text-orange' : 'text-yellow'],
    ['ROI', staked ? `${profit < 0 ? '-' : '+'}${Math.abs((profit / staked) * 100).toFixed(1)}%` : '—', ''],
    ['Récord', `${count('won')}G - ${count('lost')}P · ${count('pending')} En juego`, ''],
  ]

  return (
    <div className="space-y-3 px-4 py-3">
      <section aria-label="Tu bankroll" className="space-y-2.5 rounded-2xl bg-forest p-3 text-cream">
        <CopInput label="Bank actual" value={slip.bank} onChange={slip.setBank} />
        <dl className="space-y-1.5 px-1">
          {kpis.map(([label, value, style]) => (
            <div key={label} className="flex items-baseline justify-between gap-3">
              <dt className="text-xs text-cream/70">{label}</dt>
              <dd className={`text-right font-num font-bold ${style}`}>{value}</dd>
            </div>
          ))}
        </dl>
      </section>
      {tickets.length ? (
        tickets.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} slip={slip} />)
      ) : (
        <p className="py-4 text-center text-muted">Aún no registras jugadas. Arma tu cupón y toca "Registrar Jugada".</p>
      )}
      <p className="text-[11px] text-muted">
        Las jugadas se liquidan solas cuando su partido termina en la fecha que estás viendo; las de otras fechas, con los
        botones de cada jugada.
      </p>
    </div>
  )
}

// Floating and non-modal on the page, so odds can still be added from the cards while it is open. Docked in the
// Match Center, it is the modal's right column on desktop and a drawer above it on phones: never under the blur.
export function BetSlip({ slip, docked = false }: { slip: Slip; docked?: boolean }) {
  if (!slip.legs.length && !slip.tickets.length) return null
  const total = totalOdd(slip.legs)
  const sameMatch = new Set(slip.legs.map((leg) => leg.match_id)).size < slip.legs.length
  const layer = docked ? 'z-[60]' : 'z-30'
  // Docked on desktop the panel follows slip.docks; everywhere else it opens and minimizes.
  const [panelAt, pillAt] = docked ? (slip.docks ? ['lg:flex', 'lg:hidden'] : ['lg:hidden', 'lg:flex']) : ['', '']
  const tabs = [
    ['slip', `Cupón (${slip.legs.length})`],
    ['tickets', `Mis Jugadas (${slip.tickets.length})`],
  ] as const

  return (
    <>
      <button
        type="button"
        onClick={() => {
          slip.setOpen(true)
          if (!slip.legs.length) slip.setView('tickets')
        }}
        aria-label={
          slip.legs.length
            ? `Abrir cupón: ${slip.legs.length} selecciones, cuota ${total.toFixed(2)}`
            : `Abrir Mis Jugadas: ${slip.tickets.length} jugadas`
        }
        className={`fixed right-4 bottom-4 ${layer} ${slip.open ? 'hidden' : 'flex'} ${pillAt} cursor-pointer items-center gap-2 rounded-full bg-forest px-4 py-3 text-sm font-bold text-cream shadow-xl ring-1 ring-yellow/40 transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0`}
      >
        <TicketSlipIcon className="size-5 text-yellow" />
        {slip.legs.length ? 'Cupón' : 'Mis Jugadas'}
        {/* Remounted on every change, so the count pops to confirm a pick while the slip is minimized. */}
        <span key={slip.legs.length} className="animate-pop rounded-full bg-yellow px-1.5 font-num text-xs text-forest">
          {slip.legs.length || slip.tickets.length}
        </span>
        {slip.legs.length > 0 && <span className="font-num text-yellow">{total.toFixed(2)}</span>}
      </button>

      <aside
        aria-label="Cupón de Apuestas VYROX"
        className={`fixed inset-x-4 bottom-4 ${layer} ${slip.open ? 'flex' : 'hidden'} ${panelAt} max-h-[calc(100dvh-2rem)] animate-tab-in flex-col overflow-hidden rounded-3xl border border-line bg-modal text-sm text-ink shadow-2xl sm:left-auto sm:w-96 ${
          docked ? 'lg:static lg:ml-4 lg:max-h-[92vh]' : ''
        }`}
      >
        <header className="hero flex shrink-0 items-center gap-2 px-3 py-2.5">
          <TicketSlipIcon className="size-5 text-yellow" />
          <div role="tablist" aria-label="Cupón de Apuestas VYROX" className="flex min-w-0 gap-1">
            {tabs.map(([view, label]) => (
              <button
                key={view}
                type="button"
                role="tab"
                aria-selected={slip.view === view}
                onClick={() => slip.setView(view)}
                className={`cursor-pointer rounded-full px-3 py-1 text-xs font-bold whitespace-nowrap transition-all duration-200 ease-out active:scale-[0.98] ${
                  slip.view === view ? 'bg-yellow text-forest' : 'text-cream/80 hover:bg-cream/10 hover:text-cream'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => slip.setOpen(false)}
            aria-label="Minimizar cupón"
            className={`ml-auto grid size-8 shrink-0 cursor-pointer place-items-center rounded-full transition-all duration-200 ease-out hover:bg-cream/10 ${
              docked ? 'lg:invisible' : ''
            }`}
          >
            <Chevron direction="down" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {slip.view === 'tickets' ? (
            <MyBets slip={slip} />
          ) : slip.legs.length ? (
            <>
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
                    <IconButton label={`Quitar ${leg.market_selection}`} onClick={() => slip.remove(leg)}>
                      <CrossIcon className="size-3.5" />
                    </IconButton>
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
                <StakeSimulator odd={total} slip={slip} onRegister={slip.register} />
                <button
                  type="button"
                  onClick={slip.clear}
                  className="w-full cursor-pointer rounded-full border border-line py-1.5 font-semibold transition-all duration-200 ease-out hover:bg-surface-2"
                >
                  Limpiar cupón
                </button>
                <p className="text-[11px] text-muted">
                  Simulación con las cuotas justas de VYROX IA (100 ÷ probabilidad), no las de ninguna casa de apuestas.
                  VYROX no recibe apuestas. +18 · Juega con responsabilidad.
                </p>
              </div>
            </>
          ) : (
            <p className="px-6 py-8 text-center text-muted">
              Tu cupón está vacío. Toca una cuota de las combinadas o del Pronóstico IA para agregarla.
            </p>
          )}
        </div>
      </aside>
    </>
  )
}
