export interface Progression {
  id: string
  degrees: number[]
}

export const PROGRESSIONS: Progression[] = [
  { id: 'pop', degrees: [0, 4, 5, 3] },
  { id: 'minor-pop', degrees: [5, 3, 0, 4] },
  { id: 'fifties', degrees: [0, 5, 3, 4] },
  { id: 'rock', degrees: [0, 3, 4, 3] },
  { id: 'jazz', degrees: [1, 4, 0, 5] },
]
