import { Button } from './Button'
import { type Scale, type ScaleMode, pitchClassName } from './notes'
import { SectionTitle } from './SectionTitle'

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
    <div className="flex flex-col items-stretch gap-2 text-center">
      <SectionTitle>Tonart</SectionTitle>
      <select
        aria-label="Grundton"
        className="cursor-pointer rounded-lg border border-line bg-surface px-0 py-2.5 text-center text-fg [text-align-last:center]"
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
      <div className="flex gap-1.5">
        {MODES.map(({ mode, label }) => (
          <Button
            key={mode}
            className="flex-1 px-0 py-2 text-[14px]"
            selected={value.mode === mode}
            onClick={() => onChange({ ...value, mode })}
          >
            {label}
          </Button>
        ))}
      </div>
    </div>
  )
}
