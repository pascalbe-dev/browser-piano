import { type Scale, type ScaleMode, pitchClassName } from './notes'
import './ScaleSelect.css'

interface ScaleSelectProps {
  value: Scale
  onChange: (value: Scale) => void
}

const MODES: { mode: ScaleMode; label: string }[] = [
  { mode: 'major', label: 'Dur' },
  { mode: 'minor', label: 'Moll' },
]

export function ScaleSelect({ value, onChange }: ScaleSelectProps) {
  return (
    <div className="scale-select">
      <span className="scale-title">Tonart</span>
      <select
        aria-label="Grundton"
        value={value.root}
        onChange={(event) => {
          onChange({ ...value, root: Number(event.target.value) })
          event.target.blur()
        }}
      >
        {Array.from({ length: 12 }, (_, pitchClass) => (
          <option key={pitchClass} value={pitchClass}>
            {pitchClassName(pitchClass)}
          </option>
        ))}
      </select>
      <div className="scale-modes">
        {MODES.map(({ mode, label }) => (
          <button
            key={mode}
            type="button"
            tabIndex={-1}
            className={value.mode === mode ? 'selected' : ''}
            onClick={() => onChange({ ...value, mode })}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
