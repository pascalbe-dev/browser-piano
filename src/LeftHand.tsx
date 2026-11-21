import { type Scale, chordName } from './notes'
import { PROGRESSIONS } from './progressions'
import { MAX_BPM, MIN_BPM } from './useLeftHand'
import './LeftHand.css'

interface LeftHandProps {
  scale: Scale
  progressionId: string
  onProgression: (id: string) => void
  bpm: number
  onBpm: (bpm: number) => void
  beatsPerChord: 2 | 4
  onBeatsPerChord: (beats: 2 | 4) => void
  playing: boolean
  onToggle: () => void
  degrees: number[]
  currentChord: number | null
}

export function LeftHand({
  scale,
  progressionId,
  onProgression,
  bpm,
  onBpm,
  beatsPerChord,
  onBeatsPerChord,
  playing,
  onToggle,
  degrees,
  currentChord,
}: LeftHandProps) {
  return (
    <section className="left-hand">
      <div className="left-hand-header">
        <span className="left-hand-title">Linke Hand</span>
        <button type="button" tabIndex={-1} className="play" onClick={onToggle}>
          {playing ? '■ Stopp' : '▶ Start'}
        </button>
        <span className="left-hand-hint">Leertaste</span>
      </div>

      <div className="presets">
        {PROGRESSIONS.map((progression) => (
          <button
            key={progression.id}
            type="button"
            tabIndex={-1}
            className={progression.id === progressionId ? 'selected' : ''}
            onClick={() => onProgression(progression.id)}
          >
            {progression.degrees.map((degree) => chordName(scale, degree)).join(' – ')}
          </button>
        ))}
      </div>

      <div className="chord-strip">
        {degrees.map((degree, position) => (
          <span key={position} className={position === currentChord ? 'current' : ''}>
            {chordName(scale, degree)}
          </span>
        ))}
      </div>

      <div className="tempo">
        <label>
          <span>Tempo</span>
          <input
            type="range"
            min={MIN_BPM}
            max={MAX_BPM}
            value={bpm}
            tabIndex={-1}
            onChange={(event) => {
              onBpm(Number(event.target.value))
              event.target.blur()
            }}
          />
          <output>{bpm} BPM</output>
        </label>
        <div className="beats">
          {([4, 2] as const).map((beats) => (
            <button
              key={beats}
              type="button"
              tabIndex={-1}
              className={beats === beatsPerChord ? 'selected' : ''}
              onClick={() => onBeatsPerChord(beats)}
            >
              {beats} Schläge pro Akkord
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
