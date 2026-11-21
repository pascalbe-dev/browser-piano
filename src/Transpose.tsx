import { Button } from './Button'
import { SectionTitle } from './SectionTitle'

export const MAX_TRANSPOSE = 12

interface TransposeProps {
  value: number
  onChange: (value: number) => void
}

function formatValue(value: number): string {
  return value > 0 ? `+${value}` : `${value}`
}

export function Transpose({ value, onChange }: TransposeProps) {
  const set = (next: number) => onChange(Math.max(-MAX_TRANSPOSE, Math.min(MAX_TRANSPOSE, next)))

  return (
    <div className="flex flex-col items-stretch gap-2 text-center">
      <SectionTitle>Transpose</SectionTitle>
      <Button
        className="px-0 py-3"
        aria-label="Halbton höher"
        disabled={value >= MAX_TRANSPOSE}
        onClick={() => set(value + 1)}
      >
        ▲
      </Button>
      <Button
        className="px-0 py-4 text-[24px] font-semibold tabular-nums"
        aria-label="Transpose zurücksetzen"
        title="Zurücksetzen"
        onClick={() => set(0)}
      >
        {formatValue(value)}
      </Button>
      <Button
        className="px-0 py-3"
        aria-label="Halbton tiefer"
        disabled={value <= -MAX_TRANSPOSE}
        onClick={() => set(value - 1)}
      >
        ▼
      </Button>
      <span className="text-[12px] text-muted">Halbtöne · ↑ ↓</span>
    </div>
  )
}
