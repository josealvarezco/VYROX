import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { CheckIcon, Chevron, FilterIcon } from './icons'
import { fold } from './leagues'

export type DropdownOption<T> = {
  value: T
  label: string
  icon?: ReactNode
  detail?: ReactNode // a second line under the label
  keywords?: string // more text the search finds it by
  disabled?: boolean
}

// VYROX's dropdown in place of the platform's <select>: a pill that opens a floating listbox in the brand's look,
// with arrow keys, Home, End, Enter and Escape, an optional search box, and a click anywhere else to close it. The
// panel is fixed to the screen under its pill, so a scrolling container such as the comparator's never clips it.
// shortcut: it always opens below its pill; flip it above when a dropdown sits near the bottom of the screen.
export function VyroxDropdown<T extends string | number>({
  label,
  value,
  options,
  onChange,
  children,
  className,
  chevron = '',
  align = 'left',
  searchable = false,
}: {
  label: string // what is being chosen, for screen readers
  value: T | null
  options: DropdownOption<T>[]
  onChange: (value: T) => void
  children: ReactNode // the pill's content: what is chosen now
  className: string // the pill's look
  chevron?: string // extra classes for the pill's chevron
  align?: 'left' | 'right'
  searchable?: boolean
}) {
  const id = useId()
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const [place, setPlace] = useState<{ top: number; left?: number; right?: number; width: number } | null>(null)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const open = place !== null
  const shown = options.filter((option) => fold(`${option.label} ${option.keywords ?? ''}`).includes(fold(query.trim())))
  const chosen = options.find((option) => option.value === value)

  const close = (refocus = true) => {
    setPlace(null)
    setQuery('')
    if (refocus) trigger.current?.focus()
  }
  const show = () => {
    const rect = trigger.current?.getBoundingClientRect()
    if (!rect) return
    // A right-aligned panel ends where its pill ends: clientWidth is the screen without its scrollbar.
    const edge = align === 'right' ? { right: document.documentElement.clientWidth - rect.right } : { left: rect.left }
    setPlace({ top: rect.bottom + 8, width: Math.max(rect.width, 288), ...edge })
    setActive(Math.max(0, options.findIndex((option) => option.value === value)))
  }
  const pick = (option?: DropdownOption<T>) => {
    if (!option || option.disabled) return
    onChange(option.value)
    close()
  }
  // The arrow keys skip the options that cannot be chosen.
  const step = (from: number, by: number) => {
    for (let index = from + by; index >= 0 && index < shown.length; index += by) if (!shown[index].disabled) return index
    return from
  }
  const onKey = (event: KeyboardEvent) => {
    if (event.key === 'Tab') return close(false)
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') setActive(step(active, event.key === 'ArrowDown' ? 1 : -1))
    else if (event.key === 'Home') setActive(step(-1, 1))
    else if (event.key === 'End') setActive(step(shown.length, -1))
    else if (event.key === 'Enter') pick(shown[active])
    else if (event.key === 'Escape') close()
    else return
    event.preventDefault()
  }

  useEffect(() => {
    if (!open) return
    root.current?.querySelector<HTMLElement>(searchable ? 'input' : '[role="listbox"]')?.focus()
    // A click or a scroll outside the menu closes it: the pill it hangs from may have moved.
    const outside = (event: Event) => {
      if (!root.current?.contains(event.target as Node)) close(false)
    }
    const resized = () => close(false)
    document.addEventListener('mousedown', outside)
    document.addEventListener('scroll', outside, true)
    window.addEventListener('resize', resized)
    return () => {
      document.removeEventListener('mousedown', outside)
      document.removeEventListener('scroll', outside, true)
      window.removeEventListener('resize', resized)
    }
  }, [open, searchable]) // close only uses setters and refs

  const activeId = shown[active] ? `${id}-${active}` : undefined

  return (
    <div ref={root}>
      <button
        ref={trigger}
        type="button"
        onClick={() => (open ? close() : show())}
        onKeyDown={(event) => {
          if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
          event.preventDefault()
          show()
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? `${id}-list` : undefined}
        aria-label={chosen ? `${label}: ${chosen.label}` : label}
        className={`flex cursor-pointer items-center gap-1.5 ${className}`}
      >
        {children}
        <Chevron direction={open ? 'up' : 'down'} className={`ml-auto opacity-70 ${chevron}`} />
      </button>

      {place && (
        <div
          onKeyDown={onKey}
          style={place}
          className="fixed z-50 max-w-[calc(100vw-2rem)] animate-tab-in rounded-2xl border border-menu-line bg-menu/95 p-1.5 text-ink shadow-2xl backdrop-blur-md"
        >
          {searchable && (
            <label className="mb-1.5 flex items-center gap-2 rounded-xl bg-surface-2 px-3 py-2 text-sm">
              <FilterIcon />
              <input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value)
                  setActive(0)
                }}
                placeholder="Buscar equipo o liga..."
                role="combobox"
                aria-label="Buscar equipo o liga"
                aria-expanded="true"
                aria-autocomplete="list"
                aria-controls={`${id}-list`}
                aria-activedescendant={activeId}
                className="w-full min-w-0 bg-transparent outline-none placeholder:text-muted"
              />
            </label>
          )}
          <div
            id={`${id}-list`}
            role="listbox"
            aria-label={label}
            tabIndex={searchable ? undefined : -1}
            aria-activedescendant={searchable ? undefined : activeId}
            className="max-h-72 space-y-0.5 overflow-y-auto outline-none"
          >
            {shown.map((option, index) => {
              const selected = option.value === value
              return (
                <button
                  key={option.value}
                  id={`${id}-${index}`}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  aria-disabled={option.disabled}
                  tabIndex={-1}
                  onClick={() => pick(option)}
                  onMouseEnter={() => setActive(index)}
                  className={`flex w-full items-center justify-between gap-2 rounded-xl px-3.5 py-2.5 text-left text-sm font-medium transition-all duration-200 ease-out ${
                    selected ? 'bg-yellow font-semibold text-forest' : index === active ? 'bg-menu-hover' : ''
                  } ${option.disabled ? 'cursor-default opacity-40' : 'cursor-pointer'}`}
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    {option.icon}
                    <span className="min-w-0">
                      <span className="block truncate">{option.label}</span>
                      {option.detail && (
                        <span className={`block truncate text-xs font-normal ${selected ? 'text-forest/75' : 'text-muted'}`}>{option.detail}</span>
                      )}
                    </span>
                  </span>
                  {selected && <CheckIcon className="size-4 shrink-0" />}
                </button>
              )
            })}
            {!shown.length && <p className="px-3.5 py-2.5 text-sm text-muted">Nada coincide con tu búsqueda.</p>}
          </div>
        </div>
      )}
    </div>
  )
}
