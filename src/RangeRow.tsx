import { Shortcut } from './Shortcut'

interface RangeRowProps {
  label: string
  value: number
  min: number
  max: number
  unit: string
  shortcut: string
  onChange: (value: number) => void
}

export function RangeRow({ label, value, min, max, unit, shortcut, onChange }: RangeRowProps) {
  return (
    <label className="flex items-center gap-3 text-[14px]">
      <span>{label}</span>
      <input
        type="range"
        className="w-60 accent-accent-strong"
        min={min}
        max={max}
        value={value}
        tabIndex={-1}
        onChange={(event) => {
          onChange(Number(event.target.value))
          event.target.blur()
        }}
      />
      <output className="min-w-17.5 tabular-nums">
        {value} {unit}
      </output>
      <Shortcut>{shortcut}</Shortcut>
    </label>
  )
}
