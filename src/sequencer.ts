import * as Tone from 'tone'
import { noteOff, noteOn } from './audio'

export interface SequenceConfig {
  bpm: number
  velocity: () => number
  stepAt: (step: number) => number[] | null
  onStep: (step: number) => void
}

let eventId: number | null = null
let held: number[] = []

export function startSequence(config: SequenceConfig): void {
  stopSequence()
  const transport = Tone.getTransport()
  transport.bpm.value = config.bpm
  let step = 0
  eventId = transport.scheduleRepeat((time) => {
    const current = step++
    const midis = config.stepAt(current)
    if (midis !== null) {
      held.forEach((midi) => noteOff(midi, time))
      held = midis
      const velocity = config.velocity()
      held.forEach((midi) => noteOn(midi, time, velocity))
    }
    Tone.getDraw().schedule(() => config.onStep(current), time)
  }, '8n')
  transport.start()
}

export function stopSequence(): void {
  const transport = Tone.getTransport()
  if (eventId !== null) transport.clear(eventId)
  eventId = null
  transport.stop()
  held.forEach((midi) => noteOff(midi))
  held = []
}

export function setTempo(bpm: number): void {
  Tone.getTransport().bpm.value = bpm
}
