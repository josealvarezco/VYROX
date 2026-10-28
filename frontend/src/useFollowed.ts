import { useEffect, useState } from 'react'
import type { Team } from './types'

const KEY = 'vyrox:followed-teams'

function stored(): Team[] {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    return Array.isArray(value) ? value.filter((team) => typeof team?.id === 'number') : []
  } catch {
    return [] // storage blocked or a corrupted value
  }
}

// Followed teams live only in this browser; the app has no database.
export function useFollowed() {
  const [teams, setTeams] = useState<Team[]>(stored)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(teams))
    } catch {
      // storage blocked: following still works until the page reloads
    }
  }, [teams])

  const isFollowed = (id: number) => teams.some((team) => team.id === id)
  const toggle = (team: Team) =>
    setTeams((current) =>
      current.some((t) => t.id === team.id) ? current.filter((t) => t.id !== team.id) : [...current, team],
    )

  return { teams, isFollowed, toggle }
}
