// A football referee's whistle signalling a goal, synthesized with the Web Audio API, so there is no sound file to
// download: a short blast, a breath, and a long one.

const PEAK = 0.25 // the two tones add up to twice this at most, well under clipping
const BREATH = 2 // the air's band is narrow, so it needs this lift to be heard under the tones

let audio: AudioContext | null = null // one context for the whole page; browsers cap how many can be open

// One blast of a pea whistle (a Fox 40 kind): two tones slightly out of tune for the chambers' metallic ring, the
// pea's trill shaking their pitch and loudness, and a little air, all under a 15 ms attack and a natural fall.
function blast(context: BaseAudioContext, at: number, length: number) {
  const end = at + length
  const envelope = context.createGain()
  envelope.gain.setValueAtTime(0.0001, at)
  envelope.gain.exponentialRampToValueAtTime(PEAK, at + 0.015)
  envelope.gain.setValueAtTime(PEAK, end - length * 0.3)
  envelope.gain.exponentialRampToValueAtTime(0.0001, end)
  envelope.connect(context.destination)

  // The trill: a 39 Hz wobble of ±95 Hz on the pitch, and of the loudness between 30 and 100 %.
  const trill = context.createOscillator()
  trill.frequency.value = 39
  const wobble = context.createGain()
  wobble.gain.value = 95
  trill.connect(wobble)
  const tremolo = context.createGain()
  tremolo.gain.value = 0.65
  const flutter = context.createGain()
  flutter.gain.value = 0.35
  trill.connect(flutter).connect(tremolo.gain)
  tremolo.connect(envelope)

  for (const [frequency, type] of [
    [2820, 'sine'],
    [2980, 'triangle'],
  ] as const) {
    const tone = context.createOscillator()
    tone.type = type
    tone.frequency.value = frequency
    wobble.connect(tone.frequency)
    tone.connect(tremolo)
    tone.start(at)
    tone.stop(end + 0.05)
  }

  // The air: white noise in a narrow band around the whistle's pitch, so it does not sound like a flat electronic beep.
  const noise = context.createBuffer(1, Math.ceil(context.sampleRate * (length + 0.05)), context.sampleRate)
  const samples = noise.getChannelData(0)
  for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1
  const air = context.createBufferSource()
  air.buffer = noise
  const band = context.createBiquadFilter()
  band.type = 'bandpass'
  band.frequency.value = 2850
  band.Q.value = 8
  const mix = context.createGain()
  mix.gain.value = BREATH
  air.connect(band).connect(mix).connect(envelope)

  air.start(at)
  trill.start(at)
  trill.stop(end + 0.05)
}

// The goal whistle on any audio context from `at` on: 0.16 s, a 0.07 s breath, then 0.48 s.
export function scheduleWhistle(context: BaseAudioContext, at: number) {
  blast(context, at, 0.16)
  blast(context, at + 0.23, 0.48)
}

// Browsers only let a page play sound after the user has interacted with it once; until then it stays silent.
export function playRefereeWhistle() {
  try {
    const context = (audio ??= new AudioContext())
    void context.resume() // a context created before any click starts suspended
    scheduleWhistle(context, context.currentTime + 0.02)
  } catch {
    // no Web Audio in this browser: the alert still shows
  }
}
