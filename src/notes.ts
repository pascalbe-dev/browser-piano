export const BASE_MIDI = 48
export const OCTAVES = 3
export const KEY_COUNT = OCTAVES * 12

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const BLACK_PITCH_CLASSES = new Set([1, 3, 6, 8, 10])

const WHITE_CODES = [
  'KeyZ', 'KeyX', 'KeyC', 'KeyV', 'KeyB', 'KeyN', 'KeyM', 'Comma', 'Period', 'Slash',
  'KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT', 'KeyY', 'KeyU', 'KeyI', 'KeyO', 'KeyP', 'BracketLeft',
]

const BLACK_CODES = [
  'KeyS', 'KeyD', 'KeyG', 'KeyH', 'KeyJ', 'KeyL', 'Semicolon',
  'Digit2', 'Digit3', 'Digit4', 'Digit6', 'Digit7', 'Digit9', 'Digit0', 'Minus',
]

export interface PianoKey {
  index: number
  isBlack: boolean
  whiteIndex: number
  code: string
}

export const KEYS: PianoKey[] = buildKeys()

export const WHITE_KEY_COUNT = KEYS.filter((key) => !key.isBlack).length

export const KEY_BY_CODE: ReadonlyMap<string, PianoKey> = new Map(
  KEYS.map((key) => [key.code, key]),
)

export function noteName(midi: number): string {
  const octave = Math.floor(midi / 12) - 1
  return `${NOTE_NAMES[((midi % 12) + 12) % 12]}${octave}`
}

export function keyMidi(index: number, transpose: number): number {
  return BASE_MIDI + index + transpose
}

function buildKeys(): PianoKey[] {
  const keys: PianoKey[] = []
  let whiteCount = 0
  let blackCount = 0
  for (let index = 0; index < KEY_COUNT; index++) {
    const isBlack = BLACK_PITCH_CLASSES.has(index % 12)
    if (isBlack) {
      keys.push({ index, isBlack, whiteIndex: whiteCount - 1, code: BLACK_CODES[blackCount++] })
    } else {
      keys.push({ index, isBlack, whiteIndex: whiteCount, code: WHITE_CODES[whiteCount++] })
    }
  }
  return keys
}
