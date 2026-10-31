import { useEffect, useState } from 'react'

const KEY = 'vyrox_pinned_matches'
const AUTO_KEY = 'vyrox_auto_pin_bets'

function stored(): number[] {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    return Array.isArray(value) ? value.filter((id) => typeof id === 'number') : []
  } catch {
    return [] // storage blocked or a corrupted value
  }
}

function storedAuto() {
  try {
    return localStorage.getItem(AUTO_KEY) !== 'false' // on until the user turns it off
  } catch {
    return true
  }
}

const save = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value)
  } catch {
    // storage blocked: pinning still works until the page reloads
  }
}

// Matches pinned on top of the list, and whether the matches of the user's plays pin themselves; in this browser only.
export function usePinned() {
  const [ids, setIds] = useState<number[]>(stored)
  const [auto, setAuto] = useState(storedAuto)

  useEffect(() => save(KEY, JSON.stringify(ids)), [ids])
  useEffect(() => save(AUTO_KEY, String(auto)), [auto])

  return {
    ids,
    pinned: (id: number) => ids.includes(id),
    toggle: (id: number) => setIds((current) => (current.includes(id) ? current.filter((other) => other !== id) : [...current, id])),
    clear: () => setIds([]),
    auto,
    setAuto,
  }
}
