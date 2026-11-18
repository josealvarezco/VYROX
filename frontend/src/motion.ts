// VYROX's motion, taken from plush-ui's tokens (registry/tokens/tokens.css): its three mass-spring steps at its default
// tempo of 0.7, which shortens every spring by that factor (stiffness / 0.7², damping / 0.7, so they keep their
// overshoot), its smoothstep fade and its press scales. Transforms and opacity only, so a long list never relayouts.
import type { Transition, Variants } from 'motion/react'

// Switches, icons, presses: 220/22, about 3 % overshoot.
export const snappySpring: Transition = { type: 'spring', stiffness: 449, damping: 31.4, mass: 1 }
// Widths, sliding pills: 170/20, about 2 %.
export const softSpring: Transition = { type: 'spring', stiffness: 347, damping: 28.6, mass: 1 }
// Big, slow moves: 120/18, about 1 %.
export const calmSpring: Transition = { type: 'spring', stiffness: 245, damping: 25.7, mass: 1 }
// Opacity and colour never overshoot: smoothstep, 200 ms.
export const gentleEase: Transition = { duration: 0.2, ease: [0.333, 0, 0.667, 1] }

// How far things give while pressed: pills, wide shapes and whole rows.
export const PRESS = { pill: 0.95, wide: 0.93, row: 0.97 } as const
export const tap = { whileTap: { scale: PRESS.pill }, transition: snappySpring }

// A card or view coming in: it rises a little while it fades in.
export const cardIn: Variants = {
  hidden: { opacity: 0, y: 8 },
  shown: { opacity: 1, y: 0, transition: { y: softSpring, opacity: gentleEase } },
}
// A list whose items come in one after another, 45 ms apart (plush-ui's stagger at its tempo).
export const staggerList: Variants = { hidden: {}, shown: { transition: { staggerChildren: 0.045 } } }
// A popover, menu or modal: a slight grow and fade in, and the same way out, a little quicker.
export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  shown: { opacity: 1, scale: 1, transition: { scale: snappySpring, opacity: gentleEase } },
  gone: { opacity: 0, scale: 0.96, transition: { duration: 0.15, ease: [0.333, 0, 0.667, 1] } },
}
