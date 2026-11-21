import { type Scale, chordName } from './notes'
import { PATTERNS } from './patterns'
import { PROGRESSIONS } from './progressions'
import { MAX_BPM, MIN_BPM, patternShortcut, progressionShortcut } from './usePlayback'
import './HandPanel.css'

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
    <section className="hand-panel">
      <div className="hand-header">
        <span className="hand-title">Linke Hand</span>
        <button type="button" tabIndex={-1} className="play" onClick={onToggle}>
          {playing ? '■ Stopp' : '▶ Start'}
        </button>
        <span className="hand-hint">Leertaste</span>
      </div>

      <div className="option-row">
        <span className="row-label">Akkorde</span>
        <div className="options">
          {PROGRESSIONS.map((progression, position) => (
            <button
              key={progression.id}
              type="button"
              tabIndex={-1}
              className={progression.id === progressionId ? 'selected' : ''}
              onClick={() => onProgression(progression.id)}
            >
              <kbd className="shortcut">{progressionShortcut(position)}</kbd>
              {progression.degrees.map((degree) => chordName(scale, degree)).join(' – ')}
            </button>
          ))}
        </div>
      </div>

      <div className="option-row">
        <span className="row-label">Anschlag</span>
        <div className="options">
          {PATTERNS.map((pattern, position) => (
            <button
              key={pattern.id}
              type="button"
              tabIndex={-1}
              className={pattern.id === patternId ? 'selected' : ''}
              onClick={() => onPattern(pattern.id)}
            >
              <kbd className="shortcut">{patternShortcut(position)}</kbd>
              {pattern.label}
              <small>{pattern.hint}</small>
            </button>
          ))}
        </div>
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
        <kbd className="shortcut">← →</kbd>
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
        <kbd className="shortcut">⇧ ↑ ↓</kbd>
      </label>
    </section>
  )
}
