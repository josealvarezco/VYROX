// Screenshots of the running app for the presentation video: node docs/video/capture.mjs <chrome profile dir>
// Needs the dev servers up (frontend on 5173). Mis Jugadas is seeded with demo plays in the throwaway profile.
import { mkdirSync, writeFileSync } from 'node:fs'
import { setTimeout as sleep } from 'node:timers/promises'
import { openPage } from './cdp.mjs'

const APP = 'http://localhost:5173/'
const OUT = new URL('./shots/', import.meta.url)
mkdirSync(OUT, { recursive: true })

const page = await openPage({ width: 1440, height: 900, scale: 1.5, profile: process.argv[2] })
const click = (finder) => page.evaluate(`(() => { const el = ${finder}; if (!el) return false; el.click(); return true })()`)
const button = (text, scope = 'document') => `[...${scope}.querySelectorAll('button')].find((b) => b.textContent.trim().startsWith(${JSON.stringify(text)}))`
const shot = async (name) => {
  await sleep(700) // let transitions and images settle
  writeFileSync(new URL(`${name}.png`, OUT), Buffer.from(await page.screenshot(), 'base64'))
  console.log('shot', name)
}
const home = async (theme, storage = {}) => {
  await page.goto(APP)
  await page.evaluate(`localStorage.clear(); localStorage.setItem('vyrox_theme', '${theme}'); for (const [k, v] of Object.entries(${JSON.stringify(storage)})) localStorage.setItem(k, v)`)
  await page.goto(APP)
  await page.until(`document.querySelectorAll('main ul.divide-y > li').length > 0`, 30)
  await page.until(`document.querySelectorAll('main article').length >= 2 || document.body.innerText.includes('Ver Combinadas de Mañana')`, 60)
}
const step = async (name, run) => {
  try {
    await run()
  } catch (error) {
    console.log('FAILED', name, error.message)
  }
}

await step('home', async () => {
  await home('dark')
  console.log(await page.evaluate(`JSON.stringify({ rows: document.querySelectorAll('main ul.divide-y > li').length, cards: document.querySelectorAll('main article').length, live: document.querySelectorAll('main button[title^="Cuota en vivo"]').length, odds: document.querySelectorAll('main li button[aria-label^="Agregar al cupón"]').length })`))
  await click(`document.querySelector('main article button.bg-chip')`) // a whole parlay into the slip
  await shot('home-dark')
  await page.evaluate(`document.querySelector('main section ul.divide-y').closest('section').scrollIntoView({ block: 'start' }); scrollBy(0, -90)`)
  await shot('cartelera-dark')
})

await step('light', async () => {
  await home('light')
  await click(`document.querySelector('main article button.bg-chip')`)
  await shot('home-light')
})

await step('radar', async () => {
  await home('dark')
  await click(button('Radar IA', `document.querySelector('main')`))
  await page.until(`document.querySelectorAll('main article').length > 2 || document.body.innerText.includes('ALTA')`, 30)
  await shot('radar')
})

await step('comparador', async () => {
  await home('dark')
  const picked = await page.evaluate(`(() => { const all = [...document.querySelectorAll('main button[title="Comparar partido"]')]; all.slice(0, 2).forEach((b) => b.click()); return all.length })()`)
  if (picked < 2) throw new Error('fewer than 2 forecast matches')
  await page.until(`document.body.innerText.includes('VEREDICTO IA')`, 15)
  await shot('comparador')
})

await step('multivista', async () => {
  await home('dark')
  await click(button('Multivista', `document.querySelector('main')`))
  await sleep(400)
  const live = await click(`(() => { const b = ${button('Top 4 En Vivo')}; return b && !b.disabled ? b : null })()`)
  if (!live) {
    // No live matches right now: the first four of the list.
    await click(button('Todos', `document.querySelector('main')`))
    await sleep(300)
    await page.evaluate(`[...document.querySelectorAll('main li button[aria-label^="Añadir a Multivista"]')].slice(0, 4).forEach((b) => b.click())`)
    await click(button('Multivista', `document.querySelector('main')`))
  }
  await sleep(600)
  await shot('multivista')
})

await step('match center', async () => {
  await home('dark')
  // A finished match of the first league card: the likeliest to carry lineups.
  await click(`[...document.querySelectorAll('main section ul.divide-y > li')].find((li) => li.innerText.includes('Final'))?.querySelector('button')`)
  await page.until(`!!document.querySelector('dialog[open]')`, 10)
  await sleep(2500)
  await shot('match-resumen')
  await click(button('Alineaciones', `document.querySelector('dialog[open]')`))
  await page.until(`!!document.querySelector('dialog[open] svg circle')`, 10)
  await sleep(800)
  await shot('match-alineaciones')
  await click(button('Estadísticas', `document.querySelector('dialog[open]')`))
  await sleep(800)
  await shot('match-estadisticas')
})

await step('mis jugadas', async () => {
  // Demo plays, only to show the bankroll chart: (stake, odd, won, day)
  const plays = [[20000, 2.1, true, 1], [20000, 3.4, false, 2], [30000, 1.85, true, 3], [20000, 4.2, true, 4], [25000, 2.6, false, 5], [30000, 2.25, true, 6], [20000, 5.1, true, 7]]
  const leg = (i, status) => ({ match_id: 9000 + i, home_team: 'Millonarios', away_team: 'Atlético Nacional', kickoff_label: `0${i}/11 20:00`, market_selection: ['Más de 1.5 - Goles totales', 'Sí - Ambos anotan', 'Millonarios - Resultado del partido'][i % 3], market_category: ['over_1_5', 'btts', 'result'][i % 3], odd: 1.6, status })
  const tickets = plays
    .map(([stake, odd, won, day], i) => ({ id: `demo${i}`, createdAt: `2026-11-0${day}T20:00:00.000Z`, legs: [leg(day, won ? 'won' : 'lost')], total_odd: odd, stake, potential_return: Math.round(stake * odd), status: won ? 'won' : 'lost', settledAt: `2026-11-0${day}T23:00:00.000Z`, fromBank: true }))
    .reverse()
  await home('dark', { vyrox_saved_tickets: JSON.stringify(tickets), vyrox_user_bank: '338500' })
  await click(button('Bank', `document.querySelector('header')`))
  await sleep(1200)
  await shot('mis-jugadas')
})

page.close()
