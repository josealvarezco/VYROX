import { useCallback, useEffect, useState } from 'react'
import { isCompatible, totalOdd } from './sameGameParlay'
import { settle } from './ticketSettlement'
import type { Match, MatchOdds, SavedTicket, SlipLeg } from './types'

const KEY = 'vyrox:bet-slip'
const BANK_KEY = 'vyrox_user_bank'
const TICKETS_KEY = 'vyrox_saved_tickets'
const STATUSES: unknown[] = ['pending', 'won', 'lost']

// One item per match and market: another side of the same market replaces it, other markets add up.
export const slipKey = (leg: SlipLeg) => `${leg.match_id}:${leg.market_category}`

// The exact pick: the parlays and the Match Center can price one market differently.
const same = (a: SlipLeg, b: SlipLeg) =>
  slipKey(a) === slipKey(b) && a.market_selection === b.market_selection && a.odd === b.odd && a.bookmaker === b.bookmaker

// A pick that can never win with the rest of its match (Empate + Más de 2.5 + "No" ambos anotan) replaces them all.
const merge = (legs: SlipLeg[], picks: SlipLeg[]) =>
  picks.reduce((current, pick) => {
    const others = current.filter((leg) => slipKey(leg) !== slipKey(pick))
    const rest = others.filter((leg) => leg.match_id === pick.match_id)
    return [...(isCompatible([...rest, pick]) ? others : others.filter((leg) => leg.match_id !== pick.match_id)), pick]
  }, legs)

// The page renders every one of these fields, so a corrupted or edited value must not reach it.
const isLeg = (leg: Record<string, unknown>) =>
  typeof leg.match_id === 'number' &&
  typeof leg.odd === 'number' &&
  leg.odd > 0 &&
  ['home_team', 'away_team', 'kickoff_label', 'market_selection', 'market_category'].every((field) => typeof leg[field] === 'string') &&
  (leg.bookmaker === undefined || typeof leg.bookmaker === 'string') &&
  (leg.model === undefined || (Array.isArray(leg.model) && leg.model.length === 2 && leg.model.every((goals) => typeof goals === 'number' && goals > 0)))

const isTicket = (ticket: Record<string, unknown>) =>
  typeof ticket.id === 'string' &&
  typeof ticket.createdAt === 'string' &&
  Array.isArray(ticket.legs) &&
  ticket.legs.every((leg) => leg && typeof leg === 'object' && isLeg(leg) && STATUSES.includes(leg.status)) &&
  ['total_odd', 'stake', 'potential_return'].every((field) => typeof ticket[field] === 'number') &&
  STATUSES.includes(ticket.status) &&
  typeof ticket.fromBank === 'boolean'

function stored<T>(key: string, valid: (item: Record<string, unknown>) => boolean): T[] {
  try {
    const value = JSON.parse(localStorage.getItem(key) ?? '[]')
    return Array.isArray(value) ? value.filter((item) => item && typeof item === 'object' && valid(item)) : []
  } catch {
    return [] // storage blocked or a corrupted value
  }
}

function storedBank() {
  try {
    const value = Number(localStorage.getItem(BANK_KEY))
    return value > 0 ? value : 0
  } catch {
    return 0
  }
}

const save = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value)
  } catch {
    // storage blocked: the slip still works until the page reloads
  }
}

// The simulated bet slip, the user's bank and their registered plays live only in this browser.
export function useBetSlip() {
  const [legs, setLegs] = useState<SlipLeg[]>(() => stored(KEY, isLeg))
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<'slip' | 'tickets'>('slip')
  const [matches, setMatches] = useState<Match[]>([])
  const [quotes, setQuotes] = useState<Record<number, MatchOdds>>({}) // bookmaker odds opened in the Match Center, this visit only
  // One state, so settling a play and paying its return into the bank happen in the same pure update.
  const [wallet, setWallet] = useState(() => ({ bank: storedBank(), tickets: stored<SavedTicket>(TICKETS_KEY, isTicket) }))

  useEffect(() => save(KEY, JSON.stringify(legs)), [legs])
  useEffect(() => save(BANK_KEY, String(wallet.bank)), [wallet.bank])
  useEffect(() => save(TICKETS_KEY, JSON.stringify(wallet.tickets)), [wallet.tickets])

  // Fed with every match list the page loads: settling uses its final scores and costs no API-Football request.
  // Stable (it only uses setters), so the page's loading effect can depend on it without refetching.
  const track = useCallback((list: Match[]) => {
    const now = new Date().toISOString()
    setMatches(list)
    setWallet((current) => {
      const { tickets, credit } = settle(current.tickets, list, now)
      return tickets === current.tickets ? current : { bank: current.bank + credit, tickets }
    })
  }, [])

  const add = (picks: SlipLeg[]) => {
    setLegs((current) => merge(current, picks))
    setOpen(true)
  }
  // A Crear Apuesta is one bet on its match: it takes the place of whatever the slip had on that match.
  const addBuilder = (picks: SlipLeg[]) => {
    setLegs((current) => [...current.filter((leg) => leg.match_id !== picks[0]?.match_id), ...picks])
    setView('slip')
    setOpen(true)
  }
  // The smart builder's slip takes the whole slip, which opens on it.
  const replace = (picks: SlipLeg[]) => {
    setLegs(merge([], picks))
    setView('slip')
    setOpen(true)
  }
  const addQuotes = useCallback((matchId: number, odds: MatchOdds) => setQuotes((current) => ({ ...current, [matchId]: odds })), [])
  // Every pick at one bookmaker's odds, in the slip's order: a parlay is placed at a single house.
  const applyHouse = (bookmaker: string, odds: number[]) =>
    setLegs((current) => current.map((leg, index) => ({ ...leg, odd: odds[index] ?? leg.odd, bookmaker })))
  const remove = (pick: SlipLeg) => setLegs((current) => current.filter((leg) => slipKey(leg) !== slipKey(pick)))
  const has = (pick: SlipLeg) => legs.some((leg) => same(leg, pick))
  // A single pick only updates the slip; it opens for whole parlays, so tapping odds never covers the cards.
  const toggle = (pick: SlipLeg) =>
    setLegs((current) => (current.some((leg) => same(leg, pick)) ? current.filter((leg) => !same(leg, pick)) : merge(current, [pick])))

  // The stake leaves a configured bank; without one the play is only tracked.
  const register = (stake: number) => {
    const total = totalOdd(legs)
    const ticket = {
      id: Date.now().toString(36),
      createdAt: new Date().toISOString(),
      legs: legs.map((leg) => ({ ...leg, status: 'pending' as const })),
      total_odd: total,
      stake,
      potential_return: Math.round(stake * total),
      status: 'pending' as const,
      settledAt: null,
    }
    setWallet((current) => ({
      bank: current.bank > 0 ? current.bank - stake : current.bank,
      tickets: [{ ...ticket, fromBank: current.bank > 0 }, ...current.tickets],
    }))
    setLegs([])
    setView('tickets')
    setOpen(true)
  }

  // For matches of other dates, which the page never loads.
  const settleTicket = (id: string, status: 'won' | 'lost') => {
    const now = new Date().toISOString()
    setWallet((current) => {
      const ticket = current.tickets.find((item) => item.id === id)
      if (ticket?.status !== 'pending') return current
      return {
        bank: current.bank + (status === 'won' && ticket.fromBank ? ticket.potential_return : 0),
        tickets: current.tickets.map((item) => (item.id === id ? { ...item, status, settledAt: now } : item)),
      }
    })
  }

  // Deleting an open play gives its stake back to the bank it came from.
  const removeTicket = (id: string) =>
    setWallet((current) => {
      const ticket = current.tickets.find((item) => item.id === id)
      return {
        bank: current.bank + (ticket?.status === 'pending' && ticket.fromBank ? ticket.stake : 0),
        tickets: current.tickets.filter((item) => item.id !== id),
      }
    })

  const { bank, tickets } = wallet
  return {
    legs,
    open,
    setOpen,
    add,
    addBuilder,
    replace,
    remove,
    has,
    toggle,
    clear: () => setLegs([]),
    bank,
    setBank: (value: number) => setWallet((current) => ({ ...current, bank: value })),
    tickets,
    register,
    settleTicket,
    removeTicket,
    view,
    setView,
    // In the Match Center the slip docks beside the match while it has picks or shows the user's plays.
    docks: legs.length > 0 || (view === 'tickets' && tickets.length > 0),
    matches,
    track,
    quotes,
    addQuotes,
    applyHouse,
  }
}
