import { BASE_MIDI, type Scale } from './notes'

export const SONGS_ENABLED = false

export interface SongNote {
  start: number
  length: number
  key: number
}

export interface Song {
  id: string
  title: string
  draft: boolean
  scale: Scale
  progressionId: string
  bpm?: number
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

interface TranscriptionOptions {
  loopStart: number
  loopSlots: number
  slotScale: number
}

function buildNotes(raw: string, options: TranscriptionOptions): SongNote[] {
  const { loopStart, loopSlots, slotScale } = options
  const tokens = raw.trim().split(/\s+/).filter(Boolean)
  if (tokens.length === 0) return []
  const onsets = tokens
    .map((token) => {
      const [, slot, name, octave, length] = /^(\d+)([a-g])(\d)(?::(\d+))?$/.exec(token) ?? []
      return {
        start: (Number(slot) - loopStart) * slotScale,
        key: keyOf(name, Number(octave)),
        length: length === undefined ? null : Number(length),
      }
    })
  return onsets.map((note, index) => {
    const next = onsets[index + 1]?.start ?? onsets[0].start + loopSlots
    const length = note.length ?? Math.min(next - note.start, MAX_NOTE_SLOTS * slotScale)
    return { start: note.start, key: note.key, length }
  })
}

const localData = import.meta.glob<{ default: Record<string, string> }>('./songData.local.ts', {
  eager: true,
})
const transcriptions: Record<string, string> = Object.values(localData)[0]?.default ?? {}

const SAVE_TONIGHT_LOOP_SLOTS = 512

const IMS_YOURS_LOOP_SLOTS = 512

const COMPLICATED_LOOP_SLOTS = 512

export const SONGS: Song[] = [
  {
    id: 'save-tonight',
    title: 'Save Tonight',
    draft: true,
    scale: { root: 0, mode: 'major' },
    progressionId: 'minor-pop',
    loopSlots: SAVE_TONIGHT_LOOP_SLOTS,
    notes: buildNotes(transcriptions['save-tonight'] ?? '', {
      loopStart: 32,
      loopSlots: SAVE_TONIGHT_LOOP_SLOTS,
      slotScale: 2,
    }),
  },
  {
    id: 'im-yours',
    title: "I'm Yours",
    draft: true,
    scale: { root: 0, mode: 'major' },
    progressionId: 'pop',
    bpm: 76,
    loopSlots: IMS_YOURS_LOOP_SLOTS,
    notes: buildNotes(transcriptions['im-yours'] ?? '', {
      loopStart: 64,
      loopSlots: IMS_YOURS_LOOP_SLOTS,
      slotScale: 1,
    }),
  },
  {
    id: 'complicated',
    title: 'Complicated',
    draft: true,
    scale: { root: 0, mode: 'major' },
    progressionId: 'pop',
    bpm: 78,
    loopSlots: COMPLICATED_LOOP_SLOTS,
    notes: buildNotes(transcriptions['complicated'] ?? '', {
      loopStart: 0,
      loopSlots: COMPLICATED_LOOP_SLOTS,
      slotScale: 1,
    }),
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
