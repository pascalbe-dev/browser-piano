import { type Scale, chordName } from './notes'
import { PATTERNS } from './patterns'
import { PROGRESSIONS } from './progressions'
import { MAX_BPM, MIN_BPM } from './useLeftHand'
import './LeftHand.css'

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
  degrees: number[]
  currentChord: number | null
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

      <div className="option-row">
        <span className="row-label">Akkorde</span>
        <div className="options">
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
      </div>

      <div className="option-row">
        <span className="row-label">Anschlag</span>
        <div className="options">
          {PATTERNS.map((pattern) => (
            <button
              key={pattern.id}
              type="button"
              tabIndex={-1}
              className={pattern.id === patternId ? 'selected' : ''}
              onClick={() => onPattern(pattern.id)}
            >
              {pattern.label}
              <small>{pattern.hint}</small>
            </button>
          ))}
        </div>
      </div>

      <div className="chord-strip">
        {degrees.map((degree, position) => (
          <span key={position} className={position === currentChord ? 'current' : ''}>
            {chordName(scale, degree)}
          </span>
        ))}
      </div>

      <label className="tempo">
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

      <label className="tempo">
        <span>Lautstärke</span>
        <input
          type="range"
          min={0}
          max={100}
          value={volume}
          tabIndex={-1}
          onChange={(event) => {
            onVolume(Number(event.target.value))
            event.target.blur()
          }}
        />
        <output>{volume} %</output>
      </label>
    </section>
  )
}
