import { useState } from 'react'
import { MoonIcon, SunIcon } from './icons'

export function ThemeToggle() {
  // index.html sets data-theme before the first paint: the saved choice, or else the system preference.
  const [dark, setDark] = useState(() => document.documentElement.dataset.theme === 'dark')

  const toggle = () => {
    const theme = dark ? 'light' : 'dark'
    document.documentElement.dataset.theme = theme
    setDark(!dark)
    try {
      localStorage.setItem('vyrox_theme', theme)
    } catch {
      // storage blocked: the theme still applies until the page reloads
    }
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label="Modo oscuro"
      title={dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      onClick={toggle}
      className="relative flex h-8 w-16 shrink-0 cursor-pointer items-center justify-between rounded-full border border-cream/20 bg-cream/10 px-2 text-cream/60 transition-all duration-200 ease-out hover:bg-cream/15 active:scale-[0.98]"
    >
      <SunIcon />
      <MoonIcon />
      <span
        className={`absolute top-[3px] left-[3px] grid size-6 place-items-center rounded-full bg-yellow text-forest shadow transition-transform ${
          dark ? 'translate-x-8' : ''
        }`}
      >
        {dark ? <MoonIcon /> : <SunIcon />}
      </span>
    </button>
  )
}
