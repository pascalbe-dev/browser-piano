import { BASE_MIDI, type Scale } from './notes'

export interface SongNote {
  start: number
  length: number
  key: number
}

export interface Song {
  id: string
  title: string
  scale: Scale
  progressionId: string
  loopSlots: number
  notes: SongNote[]
}

export interface Timeline {
  onsets: ReadonlyMap<number, number>
  ends: ReadonlySet<number>
  sounding: readonly (number | null)[]
}

const SEMITONES: Record<string, number> = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 }
const MAX_NOTE_SLOTS = 4

function keyOf(name: string, octave: number): number {
  return 12 * (octave + 1) + SEMITONES[name] - BASE_MIDI
}

function buildNotes(raw: string, loopStart: number, loopSlots: number): SongNote[] {
  const onsets = raw
    .trim()
    .split(/\s+/)
    .map((token) => {
      const [, slot, name, octave] = /^(\d+)([a-g])(\d)$/.exec(token) ?? []
      return { start: Number(slot) - loopStart, key: keyOf(name, Number(octave)) }
    })
  return onsets.map((note, index) => {
    const next = onsets[index + 1]?.start ?? onsets[0].start + loopSlots
    return { ...note, length: Math.min(next - note.start, MAX_NOTE_SLOTS) }
  })
}

const SAVE_TONIGHT_TRANSCRIPTION = `
`

const SAVE_TONIGHT_LOOP_START = 32
const SAVE_TONIGHT_LOOP_SLOTS = 256

export const SONGS: Song[] = [
  {
    id: 'save-tonight',
    title: 'Save Tonight',
    scale: { root: 0, mode: 'major' },
    progressionId: 'minor-pop',
    loopSlots: SAVE_TONIGHT_LOOP_SLOTS,
    notes: buildNotes(SAVE_TONIGHT_TRANSCRIPTION, SAVE_TONIGHT_LOOP_START, SAVE_TONIGHT_LOOP_SLOTS),
  },
]

export function buildTimeline(song: Song): Timeline {
  const onsets = new Map<number, number>()
  const ends = new Set<number>()
  const sounding: (number | null)[] = Array.from({ length: song.loopSlots }, () => null)
  for (const note of song.notes) {
    onsets.set(note.start, note.key)
    ends.add((note.start + note.length) % song.loopSlots)
    for (let offset = 0; offset < note.length; offset++) {
      sounding[(note.start + offset) % song.loopSlots] = note.key
    }
  }
  return { onsets, ends, sounding }
}
