import * as Tone from 'tone'
import { noteOff, noteOn } from './audio'

export interface SequenceConfig {
  bpm: number
  beatsPerChord: 2 | 4
  chordAt: (step: number) => number[]
  onStep: (step: number) => void
}

let eventId: number | null = null
let held: number[] = []

export function startSequence(config: SequenceConfig): void {
  stopSequence()
  const transport = Tone.getTransport()
  transport.bpm.value = config.bpm
  let step = 0
  eventId = transport.scheduleRepeat(
    (time) => {
      held.forEach((midi) => noteOff(midi, time))
      const current = step++
      held = config.chordAt(current)
      held.forEach((midi) => noteOn(midi, time))
      Tone.getDraw().schedule(() => config.onStep(current), time)
    },
    config.beatsPerChord === 4 ? '1m' : '2n',
  )
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
