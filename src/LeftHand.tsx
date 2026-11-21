import { Button } from './Button'
import { HandPanel, OptionButton, OptionRow } from './HandPanel'
import { type Scale, chordName } from './notes'
import { PATTERNS } from './patterns'
import { PROGRESSIONS } from './progressions'
import { RangeRow } from './RangeRow'
import { MAX_BPM, MIN_BPM, patternShortcut, progressionShortcut } from './usePlayback'

interface LeftHandProps {
  scale: Scale
  progressionId: string
  onProgression: (id: string) => void
  patternId: string
  onPattern: (id: string) => void
  bpm: number
  onBpm: (bpm: number) => void
  volume: number
  onVolume: (volume: number) => void
  playing: boolean
  onToggle: () => void
}

export function LeftHand({
  scale,
  progressionId,
  onProgression,
  patternId,
  onPattern,
  bpm,
  onBpm,
  volume,
  onVolume,
  playing,
  onToggle,
}: LeftHandProps) {
  return (
    <HandPanel
      title="Linke Hand"
      hint="Leertaste"
      action={
        <Button selected className="px-3.5 py-2 text-[14px]" onClick={onToggle}>
          {playing ? '■ Stopp' : '▶ Start'}
        </Button>
      }
    >
      <OptionRow label="Akkorde">
        {PROGRESSIONS.map((progression, position) => (
          <OptionButton
            key={progression.id}
            selected={progression.id === progressionId}
            shortcut={progressionShortcut(position)}
            onClick={() => onProgression(progression.id)}
          >
            {progression.degrees.map((degree) => chordName(scale, degree)).join(' – ')}
          </OptionButton>
        ))}
      </OptionRow>

      <OptionRow label="Anschlag">
        {PATTERNS.map((pattern, position) => (
          <OptionButton
            key={pattern.id}
            selected={pattern.id === patternId}
            shortcut={patternShortcut(position)}
            hint={pattern.hint}
            onClick={() => onPattern(pattern.id)}
          >
            {pattern.label}
          </OptionButton>
        ))}
      </OptionRow>

      <RangeRow label="Tempo" value={bpm} min={MIN_BPM} max={MAX_BPM} unit="BPM" shortcut="← →" onChange={onBpm} />
      <RangeRow label="Lautstärke" value={volume} min={0} max={100} unit="%" shortcut="⇧ ↑ ↓" onChange={onVolume} />
    </HandPanel>
  )
}
