// Motion's animation engine, layout animations included (the sliding pills), in its own file: loaded after the
// page's first paint, so it never delays the match list.
import { domMax } from 'motion/react'

export default domMax
