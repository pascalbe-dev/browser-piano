export const STEPS_PER_BAR = 8

export type Voice = 'chord' | 0 | 1 | 2 | 3

export interface Pattern {
  id: string
  label: string
  hint: string
  steps: (Voice | null)[]
}

export const PATTERNS: Pattern[] = [
  {
    id: 'chord',
    label: 'Akkord',
    hint: '1× pro Takt',
    steps: ['chord', null, null, null, null, null, null, null],
  },
  {
    id: 'chord-twice',
    label: 'Akkord 2×',
    hint: '2× pro Takt',
    steps: ['chord', null, null, null, 'chord', null, null, null],
  },
  {
    id: 'arpeggio',
    label: 'Arpeggio',
    hint: '1 · 3 · 5 · 3',
    steps: [0, 1, 2, 1, 0, 1, 2, 1],
  },
  {
    id: 'root-fifth',
    label: 'Grundton–Quinte',
    hint: '1 · 5 · 8 · 5',
    steps: [0, 2, 3, 2, 0, 2, 3, 2],
  },
]

export function voiceKeys(chordKeys: number[], voice: Voice): number[] {
  if (voice === 'chord') return chordKeys
  if (voice === 3) return [chordKeys[0] + 12]
  return [chordKeys[voice]]
}

export function soundingKeys(chordKeys: number[], pattern: Pattern, position: number): number[] {
  for (let step = position; step >= 0; step--) {
    const voice = pattern.steps[step]
    if (voice !== null) return voiceKeys(chordKeys, voice)
  }
  return []
}
