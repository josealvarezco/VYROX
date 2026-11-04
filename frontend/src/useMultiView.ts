import { useEffect, useState } from 'react'
import { SLOTS } from './multiView'

const KEY = 'vyrox_multiview_matches'

function stored(): number[] {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    return Array.isArray(value) ? value.filter((id) => typeof id === 'number').slice(0, SLOTS) : []
  } catch {
    return [] // storage blocked or a corrupted value
  }
}

// The matches on the Multivista's grid; in this browser only.
export function useMultiView() {
  const [ids, setIds] = useState<number[]>(stored)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(ids))
    } catch {
      // storage blocked: the grid still works until the page reloads
    }
  }, [ids])

  return { ids, setIds }
}
