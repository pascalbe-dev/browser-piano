export interface Progression {
  id: string
  degrees: number[]
}

export const PROGRESSIONS: Progression[] = [
  { id: 'pop', degrees: [0, 4, 5, 3] },
  { id: 'minor-pop', degrees: [5, 3, 0, 4] },
]
