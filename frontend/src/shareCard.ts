// Shareable PNG cards in the brandbook's look, drawn on a canvas: a play from the bet slip or a VYROX IA forecast.
// They draw no image, only shapes and text: a crest from another site would taint the canvas and block the export.
import { pesos } from './money'
import type { Match, Prediction, SlipLeg, TicketStatus } from './types'

const W = 540 // logical width, drawn at 2x: a 1080 px wide PNG
const PAD = 36
const DEEP = '#071F12'
const FOREST = '#0D331E'
const YELLOW = '#F4D56D'
const CREAM = '#F7F5EB'
const ORANGE = '#EE761B'
const DIM = 'rgba(247, 245, 235, 0.68)'
const SANS = '"Inter Tight", system-ui, sans-serif'
const NUM = '"Space Grotesk", system-ui, sans-serif'

type Ctx = CanvasRenderingContext2D

// The longest start of `value` that fits `width`, with an ellipsis when cut.
function fit(ctx: Ctx, value: string, width: number) {
  if (ctx.measureText(value).width <= width) return value
  let end = value.length
  while (end > 0 && ctx.measureText(`${value.slice(0, end)}…`).width > width) end--
  return `${value.slice(0, end).trimEnd()}…`
}

function write(ctx: Ctx, value: string, x: number, y: number, font: string, color: string, align: CanvasTextAlign = 'left', width = W - 2 * PAD) {
  ctx.font = font
  ctx.fillStyle = color
  ctx.textAlign = align
  ctx.fillText(fit(ctx, value, width), x, y)
}

// The words of `value` over at most `lines` lines of `width` in the current font; the last one cut with an ellipsis.
function wrap(ctx: Ctx, value: string, width: number, lines: number) {
  const out: string[] = []
  for (const word of value.split(/\s+/)) {
    const line = out.length ? `${out[out.length - 1]} ${word}` : word
    if (out.length && ctx.measureText(line).width <= width) out[out.length - 1] = line
    else out.push(word)
  }
  return out.length > lines ? [...out.slice(0, lines - 1), fit(ctx, out.slice(lines - 1).join(' '), width)] : out
}

function box(ctx: Ctx, x: number, y: number, w: number, h: number, radius: number, color: string) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, radius)
  ctx.fill()
}

function pill(ctx: Ctx, label: string, right: number, y: number, background: string, color: string) {
  ctx.font = `800 12px ${SANS}`
  const w = ctx.measureText(label).width + 24
  box(ctx, right - w, y, w, 26, 13, background)
  write(ctx, label, right - w / 2, y + 17.5, `800 12px ${SANS}`, color, 'center')
}

// The night-match background, the yellow frame, the logo with its yellow X and the VYROX IA seal.
async function card(height: number, subtitle: string) {
  // Canvas text never downloads a web font: load the brand's first, or the card falls back to system fonts.
  await Promise.all([`800 32px ${SANS}`, `700 16px ${SANS}`, `500 13px ${SANS}`, `700 24px ${NUM}`].map((font) => document.fonts.load(font)))
  const canvas = document.createElement('canvas')
  canvas.width = W * 2
  canvas.height = height * 2
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('No 2D canvas')
  ctx.scale(2, 2)
  const ground = ctx.createLinearGradient(0, 0, 0, height)
  ground.addColorStop(0, DEEP)
  ground.addColorStop(1, FOREST)
  ctx.fillStyle = ground
  ctx.fillRect(0, 0, W, height)
  // Warm stadium floodlights from the top, as in the app's header.
  for (const [x, color] of [[0.12, 'rgba(244, 213, 109, 0.5)'], [0.88, 'rgba(251, 193, 147, 0.36)']] as const) {
    const light = ctx.createRadialGradient(W * x, -60, 0, W * x, -60, 340)
    light.addColorStop(0, color)
    light.addColorStop(1, 'rgba(244, 213, 109, 0)')
    ctx.fillStyle = light
    ctx.fillRect(0, 0, W, height)
  }
  ctx.strokeStyle = 'rgba(244, 213, 109, 0.4)'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.roundRect(14, 14, W - 28, height - 28, 24)
  ctx.stroke()
  write(ctx, 'VYRO', PAD, 68, `800 32px ${SANS}`, CREAM)
  write(ctx, 'X', PAD + ctx.measureText('VYRO').width, 68, `800 32px ${SANS}`, YELLOW)
  pill(ctx, 'VYROX IA', W - PAD, 46, YELLOW, FOREST)
  write(ctx, subtitle, PAD, 96, `600 14px ${SANS}`, DIM)
  return { canvas, ctx }
}

function footer(ctx: Ctx, height: number, note: string) {
  write(ctx, note, W / 2, height - 32, `500 11px ${SANS}`, 'rgba(247, 245, 235, 0.5)', 'center')
}

// A play: each pick with its odd, the multiplied odd, the stake and the return in the yellow box.
export async function playCard(legs: SlipLeg[], total: number, stake: number, potentialReturn: number, status: TicketStatus | null = null) {
  const ROW = 64
  const height = Math.max(675, 140 + legs.length * (ROW + 10) + 250)
  const { canvas, ctx } = await card(height, `Mi jugada · ${legs.length} ${legs.length === 1 ? 'selección' : 'selecciones'}`)
  let y = 122
  for (const leg of legs) {
    box(ctx, PAD, y, W - 2 * PAD, ROW, 16, 'rgba(247, 245, 235, 0.07)')
    write(ctx, leg.market_selection, PAD + 16, y + 27, `700 16px ${SANS}`, CREAM, 'left', W - 2 * PAD - 112)
    write(ctx, `${leg.home_team} vs ${leg.away_team} · ${leg.kickoff_label}`, PAD + 16, y + 48, `500 12.5px ${SANS}`, DIM, 'left', W - 2 * PAD - 112)
    write(ctx, leg.odd.toFixed(2), W - PAD - 16, y + 41, `700 24px ${NUM}`, YELLOW, 'right')
    y += ROW + 10
  }
  y = Math.max(y + 22, height - 210) // the totals sit at the bottom, above the footer
  write(ctx, 'Cuota total multiplicada', PAD, y, `600 15px ${SANS}`, DIM)
  write(ctx, total.toFixed(2), W - PAD, y + 3, `700 28px ${NUM}`, CREAM, 'right')
  y += 36
  write(ctx, 'Monto apostado', PAD, y, `600 15px ${SANS}`, DIM)
  write(ctx, `${pesos(stake)} COP`, W - PAD, y, `700 18px ${NUM}`, CREAM, 'right')
  y += 22
  box(ctx, PAD, y, W - 2 * PAD, 92, 20, YELLOW)
  const label = status === 'won' ? 'Retorno' : status === 'lost' ? 'Retorno potencial · jugada perdida' : 'Retorno potencial'
  write(ctx, label, PAD + 22, y + 33, `700 14px ${SANS}`, FOREST)
  write(ctx, `${pesos(potentialReturn)} COP`, PAD + 22, y + 73, `700 32px ${NUM}`, FOREST)
  footer(ctx, height, 'Cuotas estimadas de mercado · Sin dinero real · +18 Juega con responsabilidad')
  if (status === 'won') {
    // A tilted stamp over the top right, drawn last so it sits on the picks.
    ctx.save()
    ctx.translate(W - PAD - 96, 112)
    ctx.rotate(-0.12)
    box(ctx, -100, -21, 200, 42, 10, ORANGE)
    ctx.strokeStyle = CREAM
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.roundRect(-95, -16, 190, 32, 7)
    ctx.stroke()
    write(ctx, 'JUGADA GANADORA', 0, 6, `800 16px ${SANS}`, FOREST, 'center')
    ctx.restore()
  }
  return canvas
}

// A forecast: the match, the 1X2 probabilities and VYROX IA's recommended play with its estimated market odd and confidence.
export async function forecastCard(match: Match, league: string, forecast: Extract<Prediction, { fallback: false }>) {
  const height = 675
  const { canvas, ctx } = await card(height, 'Pronóstico VYROX IA')
  const home = match.homeTeam.shortName
  const away = match.awayTeam.shortName
  const kickoff = new Date(match.utcDate).toLocaleString('es-CO', { dateStyle: 'long', timeStyle: 'short', timeZone: 'America/Bogota' })
  write(ctx, `${league} · ${kickoff}`, PAD, 134, `500 13px ${SANS}`, DIM)
  write(ctx, home, PAD, 172, `800 26px ${SANS}`, CREAM)
  write(ctx, 'vs', PAD, 206, `600 18px ${SANS}`, DIM)
  write(ctx, away, PAD + 30, 206, `800 26px ${SANS}`, CREAM, 'left', W - 2 * PAD - 30)
  let y = 252
  const { probabilities: chance } = forecast
  for (const [label, value] of [[home, chance.home], ['Empate', chance.draw], [away, chance.away]] as const) {
    write(ctx, label, PAD, y, `600 14px ${SANS}`, CREAM, 'left', W - 2 * PAD - 60)
    write(ctx, `${value}%`, W - PAD, y, `700 16px ${NUM}`, YELLOW, 'right')
    box(ctx, PAD, y + 9, W - 2 * PAD, 9, 4.5, 'rgba(247, 245, 235, 0.14)')
    if (value > 0) box(ctx, PAD, y + 9, Math.max(9, ((W - 2 * PAD) * value) / 100), 9, 4.5, YELLOW)
    y += 48
  }
  y += 4
  box(ctx, PAD, y, W - 2 * PAD, 156, 22, YELLOW)
  write(ctx, 'Jugada recomendada por VYROX IA', PAD + 22, y + 32, `700 13px ${SANS}`, FOREST)
  ctx.font = `800 21px ${SANS}`
  wrap(ctx, forecast.recommended_bet, W - 2 * PAD - 44, 2).forEach((line, index) =>
    write(ctx, line, PAD + 22, y + 64 + index * 27, `800 21px ${SANS}`, FOREST, 'left', W - 2 * PAD - 44),
  )
  write(ctx, 'Cuota estimada', PAD + 22, y + 132, `600 13px ${SANS}`, FOREST)
  const odd = forecast.market_odds.recommended
  write(ctx, odd ? odd.toFixed(2) : '-', PAD + 30 + ctx.measureText('Cuota estimada').width, y + 134, `700 24px ${NUM}`, FOREST)
  pill(ctx, `CONFIANZA ${forecast.confidence.toUpperCase()}`, W - PAD - 22, y + 112, FOREST, YELLOW)
  footer(ctx, height, 'Análisis de VYROX IA con fines informativos; no garantiza resultados · +18')
  return canvas
}
