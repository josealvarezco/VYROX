import { useState, type ReactNode } from 'react'
import { BankrollAnalytics } from './Bankroll'
import { CheckIcon, Chevron, CrossIcon, LayersCombineIcon, ShareIcon, StopwatchIcon, TicketSlipIcon, TrashIcon } from './icons'
import { STAKES, pesos, signed } from './money'
import { bestHouse } from './bookmakers'
import { ShareButton } from './ShareButton'
import { byMatch, matchOdd, totalOdd } from './sameGameParlay'
import { playCard } from './shareCard'
import { TARGETS, fetchSmartParlay } from './smartParlay'
import { statusText } from './status'
import type { SavedTicket, SlipLeg } from './types'
import { slipKey, type useBetSlip } from './useBetSlip'

type Slip = ReturnType<typeof useBetSlip>

// Share of the bank each profile stakes: its range, nearer the top the likelier the play.
const PROFILES = [
  { name: 'Conservador', low: 1, high: 2 },
  { name: 'Moderado · IA', low: 2.5, high: 5 },
  { name: 'Agresivo', low: 6, high: 10 },
]

const BADGES = {
  pending: { label: 'PENDIENTE', style: 'bg-yellow text-forest', Icon: StopwatchIcon },
  won: { label: 'GANADA', style: 'bg-[#16A34A] text-white', Icon: CheckIcon },
  lost: { label: 'PERDIDA', style: 'bg-[#DC2626] text-white', Icon: CrossIcon },
}
// A settled play gets a green or red frame; each settled pick a soft green or red line (lighter in dark mode).
const CARD = { pending: 'border border-line', won: 'border-2 border-[#16A34A]', lost: 'border-2 border-[#DC2626]' }
const PICK = { pending: 'border-transparent', won: 'border-win/40 bg-win/10', lost: 'border-loss/40 bg-loss/10' }
const ODD = { pending: '', won: 'text-win', lost: 'text-loss' }

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
export function StakeSimulator({
  odd,
  slip,
  onRegister,
  houses,
}: {
  odd: number
  slip: Slip
  onRegister?: (stake: number) => void
  houses?: ReturnType<typeof bestHouse> // the bet slip's comparison of the bookmakers that quote every pick
}) {
  const [byBank, setByBank] = useState(false)
  const [stake, setStake] = useState(STAKES[0])
  const [profile, setProfile] = useState(1) // Moderado, VYROX IA's suggestion
  const chance = 100 / odd // the probability the odd implies: VYROX IA's, a few points off for the bookmaker's margin
  const { low, high } = PROFILES[profile]
  const percent = Math.round((low + ((high - low) * chance) / 100) * 10) / 10
  const amount = Math.round(byBank ? (slip.bank * percent) / 100 : stake)
  const risk = chance >= 60 ? 'Bajo' : chance >= 35 ? 'Medio' : 'Alto'
  const short = slip.bank > 0 && amount > slip.bank // a configured bank has to cover the stake
  const best = houses?.best
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
      {houses && (
        <div aria-live="polite" className="flex flex-wrap items-center gap-2 rounded-xl border border-line bg-surface-2 px-3 py-2 text-xs">
          {best ? (
            <>
              <span className="min-w-0 flex-1">
                Mejor pago entre las casas para esta jugada: <span className="font-bold">{best.name}</span> · cuota{' '}
                <span className="font-num font-semibold">{best.total.toFixed(2)}</span> ·{' '}
                <span className="font-num font-semibold">{pesos(amount * best.total)} COP</span>
              </span>
              {slip.legs.some((leg, index) => leg.bookmaker !== best.name || leg.odd !== best.odds[index]) && (
                <button
                  type="button"
                  onClick={() => slip.applyHouse(best.name, best.odds)}
                  className="cursor-pointer rounded-full bg-yellow px-2.5 py-1 font-bold text-forest transition-all duration-200 ease-out hover:opacity-90 active:scale-[0.98]"
                >
                  Aplicar cuotas de {best.name}
                </button>
              )}
            </>
          ) : (
            <span className="text-muted">
              {houses.missing
                ? `Abre «Cuotas» en ${houses.missing === 1 ? 'el partido' : `los ${houses.missing} partidos`} de tu cupón para comparar las casas.`
                : 'Ninguna casa cotiza todas tus selecciones.'}
            </span>
          )}
        </div>
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
    <article className={`rounded-2xl bg-surface p-3 ${CARD[ticket.status]}`}>
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

      <ul className="mt-2 space-y-1">
        {ticket.legs.map((leg) => {
          const match = slip.matches.find((item) => item.id === leg.match_id)
          const { home, away } = match?.score.fullTime ?? { home: null, away: null }
          return (
            <li key={slipKey(leg)} className={`flex items-center gap-2 rounded-xl border px-2 py-1.5 ${PICK[leg.status]}`}>
              {leg.status === 'won' ? (
                <CheckIcon className="size-4 text-win" label="Cumplida" />
              ) : leg.status === 'lost' ? (
                <CrossIcon className="size-4 text-loss" label="Fallida" />
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
              <span className={`font-num font-bold ${ODD[leg.status]}`}>{leg.odd.toFixed(2)}</span>
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
          <dd className={`font-num font-semibold ${ODD[ticket.status]}`}>
            {pesos(back)} /{' '}
            <span className={ticket.status === 'pending' ? 'text-gold' : ticket.status === 'won' ? 'font-bold' : ''}>{signed(back - ticket.stake)}</span>
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
      <BankrollAnalytics tickets={tickets} bank={slip.bank} />
      {tickets.length ? (
        tickets.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} slip={slip} />)
      ) : (
        <p className="py-4 text-center text-muted">Aún no registras jugadas. Arma tu cupón y toca "Registrar Jugada".</p>
      )}
      <p className="text-[11px] text-muted">
        Cada selección se decide sola en la fecha que estás viendo: en vivo en cuanto ya no puede cambiar (se pasa la línea
        de goles o anotan ambos) y las demás al final de su partido. Las de otras fechas, con los botones de cada jugada.
      </p>
    </div>
  )
}

// One tap fills the empty slip with VYROX IA's slip for a target odd, from x2 to x10.
function QuickFill({ date, slip }: { date: string; slip: Slip }) {
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState('')
  const fill = (target: number) => {
    setBusy(true)
    setNote('')
    fetchSmartParlay(date, target, null, 'all', 0)
      .then((built) =>
        built.legs.length && !built.played ? slip.replace(built.legs) : setNote(built.message ?? 'Ya no quedan partidos por jugar en esta fecha.'),
      )
      .catch(() => setNote('VYROX IA no pudo armar la combinada. Intenta de nuevo.'))
      .finally(() => setBusy(false))
  }
  return (
    <div className="mt-2 space-y-2">
      <p className="text-xs font-semibold">O deja que VYROX IA la arme por cuota objetivo:</p>
      <div className="flex justify-center gap-1.5">
        {TARGETS.slice(0, 4).map(([target]) => (
          <button
            key={target}
            type="button"
            disabled={busy}
            onClick={() => fill(target)}
            aria-label={`Armar con VYROX IA una combinada de cuota ${target}`}
            className={`font-num ${pill(false)} disabled:opacity-50`}
          >
            x{target}
          </button>
        ))}
      </div>
      {note && <p className="text-xs text-warn">{note}</p>}
    </div>
  )
}

// On the page, the right column on desktop, always open, empty or not. Docked in the Match Center, the modal's
// right column on desktop while it has something to show: never under the blur. Below lg, a pill that opens a
// non-modal drawer, so odds can still be added from the cards while it is open.
export function BetSlip({ slip, docked = false, date }: { slip: Slip; docked?: boolean; date?: string }) {
  const empty = !slip.legs.length && !slip.tickets.length
  if (docked && empty) return null
  const total = totalOdd(slip.legs)
  const layer = docked ? 'z-[60]' : 'z-30'
  const [panelAt, pillAt] = !docked || slip.docks ? ['lg:flex', 'lg:hidden'] : ['lg:hidden', 'lg:flex']
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
        className={`fixed right-4 bottom-4 ${layer} ${slip.open || empty ? 'hidden' : 'flex'} ${pillAt} cursor-pointer items-center gap-2 rounded-full bg-forest px-4 py-3 text-sm font-bold text-cream shadow-xl ring-1 ring-yellow/40 transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0`}
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
        className={`fixed inset-x-4 bottom-4 ${layer} ${slip.open && !empty ? 'flex' : 'hidden'} ${panelAt} max-h-[calc(100dvh-2rem)] animate-tab-in flex-col overflow-hidden rounded-3xl border border-line bg-modal text-sm text-ink shadow-2xl sm:left-auto sm:w-96 ${
          docked
            ? 'lg:static lg:ml-4 lg:max-h-[92vh]'
            : 'lg:sticky lg:inset-auto lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:w-auto lg:rounded-2xl lg:bg-surface lg:shadow-none'
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
            className="ml-auto grid size-8 shrink-0 cursor-pointer place-items-center rounded-full transition-all duration-200 ease-out hover:bg-cream/10 lg:hidden"
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
                {byMatch(slip.legs).map((legs) => {
                  const rows = legs.map((leg) => (
                    <div key={slipKey(leg)} className="flex items-center gap-3 py-2.5">
                      <div className="min-w-0 flex-1">
                        <p className="leading-snug font-bold">{leg.market_selection}</p>
                        <p className="truncate text-xs text-muted">
                          {leg.home_team} - {leg.away_team} · <span className="font-num">{leg.kickoff_label}</span>
                        </p>
                        {leg.bookmaker && (
                          <span className="mt-0.5 inline-block rounded-full bg-chip px-1.5 text-[10px] font-semibold text-cream">{leg.bookmaker}</span>
                        )}
                      </div>
                      <span className="font-num font-bold">{leg.odd.toFixed(2)}</span>
                      <IconButton label={`Quitar ${leg.market_selection}`} onClick={() => slip.remove(leg)}>
                        <CrossIcon className="size-3.5" />
                      </IconButton>
                    </div>
                  ))
                  if (legs.length === 1) return <li key={legs[0].match_id}>{rows}</li>
                  // Picks of one match are one Crear Apuesta, priced together when VYROX IA's model of the match came with them.
                  const plain = legs.reduce((product, leg) => product * leg.odd, 1)
                  return (
                    <li key={legs[0].match_id} className="py-2.5">
                      <div className="rounded-xl border border-yellow/70 bg-yellow/10 px-3 py-2">
                        <p className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 rounded-full bg-yellow px-2 py-0.5 text-[10px] font-bold tracking-wide text-forest">
                            <LayersCombineIcon className="size-3" />
                            CREAR APUESTA (MISMO PARTIDO)
                          </span>
                          <span className="ml-auto font-num text-base font-bold">{matchOdd(legs).toFixed(2)}</span>
                        </p>
                        <div className="divide-y divide-dashed divide-line">{rows}</div>
                        <p className="text-[11px] text-muted">
                          {legs.some((leg) => leg.model)
                            ? `Cuota ajustada por correlación con el modelo de VYROX IA: multiplicadas darían ${plain.toFixed(2)}.`
                            : 'Sin el pronóstico de VYROX IA de este partido, la cuota es el producto de sus selecciones y es solo aproximada.'}
                        </p>
                      </div>
                    </li>
                  )
                })}
              </ul>

              <div className="space-y-3 border-t border-line bg-surface px-4 py-3">
                <p className="flex items-center justify-between font-semibold">
                  Cuota total multiplicada
                  <span className="font-num text-xl font-bold">{total.toFixed(2)}</span>
                </p>
                <StakeSimulator odd={total} slip={slip} onRegister={slip.register} houses={bestHouse(slip.legs, slip.quotes)} />
                <button
                  type="button"
                  onClick={slip.clear}
                  className="w-full cursor-pointer rounded-full border border-line py-1.5 font-semibold transition-all duration-200 ease-out hover:bg-surface-2"
                >
                  Limpiar cupón
                </button>
                <p className="text-[11px] text-muted">
                  Simulación con cuotas estimadas de mercado de VYROX IA, no las de ninguna casa de apuestas.
                  VYROX no recibe apuestas. +18 · Juega con responsabilidad.
                </p>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
              <span className="mb-1 grid size-12 place-items-center rounded-full bg-yellow/15 text-gold">
                <TicketSlipIcon className="size-6" />
              </span>
              <p className="font-bold">Tu cupón está vacío</p>
              <p className="text-muted">
                Toca una cuota de las Combinadas Populares, del Radar IA o del Pronóstico IA de un partido para armar tu jugada.
              </p>
              {date && <QuickFill date={date} slip={slip} />}
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
