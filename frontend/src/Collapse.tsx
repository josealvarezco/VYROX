import type { ReactNode } from 'react'

// Animates opening and closing height (grid rows 0fr ↔ 1fr); closed content leaves the tab order.
export function Collapse({ open, children }: { open: boolean; children: ReactNode }) {
  return (
    <div className={`grid transition-[grid-template-rows] duration-200 ease-out ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
      <div inert={!open} className="overflow-hidden">
        {children}
      </div>
    </div>
  )
}
