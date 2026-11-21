import * as Tone from 'tone'

const SAMPLE_BASE_URL = 'https://tonejs.github.io/audio/salamander/'

const SAMPLE_URLS: Record<string, string> = {
  A1: 'A1.mp3',
  C2: 'C2.mp3',
  'D#2': 'Ds2.mp3',
  'F#2': 'Fs2.mp3',
  A2: 'A2.mp3',
  C3: 'C3.mp3',
  'D#3': 'Ds3.mp3',
  'F#3': 'Fs3.mp3',
  A3: 'A3.mp3',
  C4: 'C4.mp3',
  'D#4': 'Ds4.mp3',
  'F#4': 'Fs4.mp3',
  A4: 'A4.mp3',
  C5: 'C5.mp3',
  'D#5': 'Ds5.mp3',
  'F#5': 'Fs5.mp3',
  A5: 'A5.mp3',
  C6: 'C6.mp3',
  'D#6': 'Ds6.mp3',
  'F#6': 'Fs6.mp3',
}

type Instrument = Tone.PolySynth | Tone.Sampler

let instrument: Instrument | null = null
let startPromise: Promise<void> | null = null

export type AudioStatus = 'idle' | 'loading' | 'ready' | 'fallback'

export function startAudio(onStatus: (status: AudioStatus) => void): Promise<void> {
  startPromise ??= initAudio(onStatus)
  return startPromise
}

async function initAudio(onStatus: (status: AudioStatus) => void): Promise<void> {
  await Tone.start()

  const fallback = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.005, decay: 0.4, sustain: 0.2, release: 1 },
  }).toDestination()
  instrument = fallback
  onStatus('loading')

  const sampler = new Tone.Sampler({
    urls: SAMPLE_URLS,
    baseUrl: SAMPLE_BASE_URL,
    release: 1,
    onload: () => {
      sampler.toDestination()
      instrument = sampler
      fallback.releaseAll()
      fallback.dispose()
      onStatus('ready')
    },
    onerror: () => onStatus('fallback'),
  })
}

export function noteOn(midi: number): void {
  instrument?.triggerAttack(Tone.Frequency(midi, 'midi').toFrequency(), Tone.now())
}

export function noteOff(midi: number): void {
  instrument?.triggerRelease(Tone.Frequency(midi, 'midi').toFrequency(), Tone.now())
}

export function releaseAll(): void {
  instrument?.releaseAll()
}
