import './Transpose.css'

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
    <div className="transpose">
      <span className="transpose-title">Transpose</span>
      <button
        type="button"
        tabIndex={-1}
        aria-label="Halbton höher"
        disabled={value >= MAX_TRANSPOSE}
        onClick={() => set(value + 1)}
      >
        ▲
      </button>
      <button
        type="button"
        tabIndex={-1}
        className="transpose-value"
        aria-label="Transpose zurücksetzen"
        title="Zurücksetzen"
        onClick={() => set(0)}
      >
        {formatValue(value)}
      </button>
      <button
        type="button"
        tabIndex={-1}
        aria-label="Halbton tiefer"
        disabled={value <= -MAX_TRANSPOSE}
        onClick={() => set(value - 1)}
      >
        ▼
      </button>
      <span className="transpose-hint">Halbtöne · ↑ ↓</span>
    </div>
  )
}
