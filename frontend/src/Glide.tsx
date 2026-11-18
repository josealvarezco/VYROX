import { m } from 'motion/react'
import { softSpring } from './motion'

// The highlight of a group's active option, which slides on a soft spring from the option left to the one chosen.
// It goes inside the active option (positioned, with no transform of its own) of a group marked `isolate`: at z -1 it
// passes under the other options, whose own fill hides it, and shows through the active one, which has none.
export function Glide({ id, className = 'bg-yellow', radius = 9999 }: { id: string; className?: string; radius?: number }) {
  // The radius goes in style, so the layout animation keeps the corners round while the pill stretches.
  return <m.span layoutId={id} aria-hidden="true" transition={softSpring} style={{ borderRadius: radius }} className={`absolute inset-0 -z-10 ${className}`} />
}
