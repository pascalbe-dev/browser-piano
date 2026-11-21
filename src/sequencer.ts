import * as Tone from 'tone'
import { noteOff, noteOn } from './audio'

export interface Voice {
  velocity: () => number
  stepAt: (step: number) => number[] | null
}

export interface SequenceConfig {
  bpm: number
  voices: Voice[]
  onStep: (step: number) => void
}

let eventId: number | null = null
let held: number[][] = []

function heldByOthers(midi: number, voiceIndex: number): boolean {
  return held.some((notes, index) => index !== voiceIndex && notes.includes(midi))
}

export function startSequence(config: SequenceConfig): void {
  stopSequence()
  const transport = Tone.getTransport()
  transport.bpm.value = config.bpm
  held = config.voices.map(() => [])
  let step = 0
  eventId = transport.scheduleRepeat((time) => {
    const current = step++
    config.voices.forEach((voice, voiceIndex) => {
      const midis = voice.stepAt(current)
      if (midis === null) return
      held[voiceIndex].forEach((midi) => {
        if (!heldByOthers(midi, voiceIndex) || midis.includes(midi)) noteOff(midi, time)
      })
      held[voiceIndex] = midis
      const velocity = voice.velocity()
      midis.forEach((midi) => noteOn(midi, time, velocity))
    })
    Tone.getDraw().schedule(() => config.onStep(current), time)
  }, '8n')
  transport.start()
}

export function stopSequence(): void {
  const transport = Tone.getTransport()
  if (eventId !== null) transport.clear(eventId)
  eventId = null
  transport.stop()
  held.flat().forEach((midi) => noteOff(midi))
  held = []
}

export function setTempo(bpm: number): void {
  Tone.getTransport().bpm.value = bpm
}
