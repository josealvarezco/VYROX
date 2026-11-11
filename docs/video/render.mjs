// Renders vyrox.html to an H.264 MP4 with nothing but Chrome: node docs/video/render.mjs <chrome profile dir> [seconds]
// Each frame is a screenshot of the page at that moment, encoded by Chrome's own WebCodecs encoder and written into
// a minimal MP4 (one video track, no audio).
import { writeFileSync } from 'node:fs'
import { openPage } from './cdp.mjs'

const FPS = 30
const [WIDTH, HEIGHT] = [1920, 1080]
const OUT = new URL('./vyrox-presentacion.mp4', import.meta.url)

// Runs in the page: the encoder, and the MP4 around its output.
const ENCODER = `(async () => {
  const [W, H, FPS] = [${WIDTH}, ${HEIGHT}, ${FPS}]
  const samples = []
  let description, failure
  const encoder = new VideoEncoder({
    output: (chunk, meta) => {
      if (meta?.decoderConfig?.description) description = new Uint8Array(meta.decoderConfig.description)
      const bytes = new Uint8Array(chunk.byteLength)
      chunk.copyTo(bytes)
      samples.push({ bytes, key: chunk.type === 'key' })
    },
    error: (error) => (failure = String(error)),
  })
  // 1080p needs level 4.0; the first profile this Chrome encodes, best first.
  let config
  for (const codec of ['avc1.640028', 'avc1.4d0028', 'avc1.42e028', 'avc1.420028']) {
    const candidate = { codec, width: W, height: H, bitrate: 6_000_000, framerate: FPS, latencyMode: 'quality', avc: { format: 'avc' } }
    if ((await VideoEncoder.isConfigSupported(candidate)).supported) { config = candidate; break }
  }
  if (!config) throw new Error('this Chrome cannot encode H.264')
  encoder.configure(config)

  window.__frame = async (index, png) => {
    const bitmap = await createImageBitmap(await (await fetch('data:image/png;base64,' + png)).blob())
    const frame = new VideoFrame(bitmap, { timestamp: Math.round((index * 1e6) / FPS) })
    encoder.encode(frame, { keyFrame: index % (FPS * 2) === 0 })
    frame.close()
    bitmap.close()
    while (encoder.encodeQueueSize > 3) await new Promise((next) => setTimeout(next, 5))
    if (failure) throw new Error(failure)
    return true
  }

  const u16 = (n) => [(n >> 8) & 255, n & 255]
  const u32 = (n) => [n >>> 24, (n >>> 16) & 255, (n >>> 8) & 255, n & 255]
  const text = (s) => [...s].map((c) => c.charCodeAt(0))
  const zeros = (n) => new Array(n).fill(0)
  const box = (type, ...parts) => { const body = parts.flat(Infinity); return [...u32(body.length + 8), ...text(type), ...body] }
  const MATRIX = [0x10000, 0, 0, 0, 0x10000, 0, 0, 0, 0x40000000].map(u32)

  window.__finish = async () => {
    await encoder.flush()
    if (failure) throw new Error(failure)
    const count = samples.length
    const TICK = 1000 // one frame, in a media timescale of FPS * 1000
    const millis = Math.round((count * 1000) / FPS)
    const moov = (offset) =>
      box('moov',
        box('mvhd', u32(0), u32(0), u32(0), u32(1000), u32(millis), u32(0x10000), u16(0x100), zeros(10), MATRIX, zeros(24), u32(2)),
        box('trak',
          box('tkhd', u32(3), u32(0), u32(0), u32(1), u32(0), u32(millis), zeros(8), u16(0), u16(0), u16(0), u16(0), MATRIX, u32(W * 65536), u32(H * 65536)),
          box('mdia',
            box('mdhd', u32(0), u32(0), u32(0), u32(FPS * TICK), u32(count * TICK), u16(0x55c4), u16(0)),
            box('hdlr', u32(0), u32(0), text('vide'), zeros(12), text('VideoHandler'), 0),
            box('minf',
              box('vmhd', u32(1), zeros(8)),
              box('dinf', box('dref', u32(0), u32(1), box('url ', u32(1)))),
              box('stbl',
                box('stsd', u32(0), u32(1),
                  box('avc1', zeros(6), u16(1), zeros(16), u16(W), u16(H), u32(0x480000), u32(0x480000), u32(0), u16(1), zeros(32), u16(0x18), u16(0xffff), box('avcC', [...description]))),
                box('stts', u32(0), u32(1), u32(count), u32(TICK)),
                box('stss', u32(0), u32(samples.filter((s) => s.key).length), samples.flatMap((s, i) => (s.key ? [u32(i + 1)] : []))),
                box('stsc', u32(0), u32(1), u32(1), u32(count), u32(1)),
                box('stsz', u32(0), u32(0), u32(count), samples.map((s) => u32(s.bytes.length))),
                box('stco', u32(0), u32(1), u32(offset)))))))
    const ftyp = box('ftyp', text('isom'), u32(512), text('isomiso2avc1mp41'))
    const size = samples.reduce((sum, s) => sum + s.bytes.length, 0)
    const head = [...ftyp, ...moov(ftyp.length + moov(0).length + 8), ...u32(size + 8), ...text('mdat')] // moov first: plays while it downloads
    const file = new Uint8Array(head.length + size)
    file.set(head)
    let at = head.length
    for (const s of samples) { file.set(s.bytes, at); at += s.bytes.length }
    window.__file = file
    return { bytes: file.length, frames: count, codec: config.codec }
  }
  // The file in pieces: one DevTools message cannot carry it whole.
  window.__slice = (from, to) => {
    let binary = ''
    for (let at = from; at < to; at += 32768) binary += String.fromCharCode(...window.__file.subarray(at, Math.min(at + 32768, to)))
    return btoa(binary)
  }
  return config.codec
})()`

const page = await openPage({ width: WIDTH, height: HEIGHT, profile: process.argv[2], port: 9334 })
try {
  await page.goto(new URL('./vyrox.html', import.meta.url).href)
  await page.evaluate(`document.fonts.ready.then(() => Promise.all([...document.images].map((image) => image.decode()))).then(() => true)`)
  const seconds = Number(process.argv[3] ?? (await page.evaluate('DURATION')))
  const from = Number(process.argv[4] ?? 0) // a start second, for short test renders
  console.log('codec', await page.evaluate(ENCODER))
  const frames = Math.round(seconds * FPS)
  const started = Date.now()
  for (let index = 0; index < frames; index++) {
    await page.evaluate(`seek(${((from * FPS + index) * 1000) / FPS})`)
    await page.evaluate(`__frame(${index}, "${await page.screenshot()}")`)
    if (index % 60 === 0) console.log(`frame ${index}/${frames}, ${Math.round((Date.now() - started) / 1000)} s`)
  }
  const info = await page.evaluate('__finish()')
  const parts = []
  for (let at = 0; at < info.bytes; at += 3_000_000) parts.push(Buffer.from(await page.evaluate(`__slice(${at}, ${Math.min(at + 3_000_000, info.bytes)})`), 'base64'))
  writeFileSync(OUT, Buffer.concat(parts))
  console.log('done', JSON.stringify(info), `${Math.round((Date.now() - started) / 1000)} s`)
} finally {
  page.close()
}
