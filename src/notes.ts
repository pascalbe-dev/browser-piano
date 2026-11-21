export const BASE_MIDI = 48
export const OCTAVES = 3
export const KEY_COUNT = OCTAVES * 12

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const BLACK_PITCH_CLASSES = new Set([1, 3, 6, 8, 10])

export type ScaleMode = 'major' | 'minor'

export interface Scale {
  root: number
  mode: ScaleMode
}

export const DEFAULT_SCALE: Scale = { root: 0, mode: 'major' }

const MODE_INTERVALS: Record<ScaleMode, number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
}

interface KeyRow {
  start: number
  codes: string[]
}

export const ROWS: KeyRow[] = [
  {
    start: 0,
    codes: ['KeyZ', 'KeyX', 'KeyC', 'KeyV', 'KeyB', 'KeyN', 'KeyM', 'Comma', 'Period', 'Slash'],
  },
  {
    start: 5,
    codes: [
      'KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG', 'KeyH', 'KeyJ', 'KeyK', 'KeyL', 'Semicolon', 'Quote',
    ],
  },
  {
    start: 10,
    codes: [
      'KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT', 'KeyY', 'KeyU', 'KeyI', 'KeyO', 'KeyP', 'BracketLeft',
    ],
  },
]

export const ALL_CODES: string[] = ROWS.flatMap((row) => row.codes)

export interface PianoKey {
  index: number
  isBlack: boolean
  whiteIndex: number
}

export const KEYS: PianoKey[] = buildKeys()

export const WHITE_KEY_COUNT = KEYS.filter((key) => !key.isBlack).length

export interface KeyMap {
  codeToIndex: ReadonlyMap<string, number>
  indexToCodes: ReadonlyMap<number, string[]>
}

export function noteName(midi: number): string {
  const octave = Math.floor(midi / 12) - 1
  return `${NOTE_NAMES[((midi % 12) + 12) % 12]}${octave}`
}

export function keyMidi(index: number, transpose: number): number {
  return BASE_MIDI + index + transpose
}

export function pitchClassName(pitchClass: number): string {
  return NOTE_NAMES[pitchClass]
}

export function scaleKeyIndices(scale: Scale): number[] {
  const pitchClasses = new Set(MODE_INTERVALS[scale.mode].map((step) => (step + scale.root) % 12))
  return KEYS.filter((key) => pitchClasses.has((BASE_MIDI + key.index) % 12)).map(
    (key) => key.index,
  )
}

export function chordKeyIndices(scale: Scale, degree: number): number[] {
  const scaleIndices = scaleKeyIndices(scale)
  const rootPosition = scaleIndices.findIndex((index) => index % 12 === scale.root)
  const position = (rootPosition + degree) % 7
  return [position, position + 2, position + 4].map((p) => scaleIndices[p])
}

export function chordName(scale: Scale, degree: number): string {
  const [root, third, fifth] = chordKeyIndices(scale, degree)
  const thirdSize = third - root
  const fifthSize = fifth - root
  const quality = thirdSize === 4 ? '' : fifthSize === 7 ? 'm' : 'dim'
  return `${NOTE_NAMES[root % 12]}${quality}`
}

export function buildKeyMap(scale: Scale): KeyMap {
  const scaleIndices = scaleKeyIndices(scale)

  const codeToIndex = new Map<string, number>()
  const indexToCodes = new Map<number, string[]>()
  for (const row of ROWS) {
    row.codes.forEach((code, position) => {
      const index = scaleIndices[row.start + position]
      if (index === undefined) return
      codeToIndex.set(code, index)
      indexToCodes.set(index, [...(indexToCodes.get(index) ?? []), code])
    })
  }
  return { codeToIndex, indexToCodes }
}

function buildKeys(): PianoKey[] {
  const keys: PianoKey[] = []
  let whiteCount = 0
  for (let index = 0; index < KEY_COUNT; index++) {
    const isBlack = BLACK_PITCH_CLASSES.has(index % 12)
    if (isBlack) {
      keys.push({ index, isBlack, whiteIndex: whiteCount - 1 })
    } else {
      keys.push({ index, isBlack, whiteIndex: whiteCount++ })
    }
  }
  return keys
}
