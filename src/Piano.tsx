import { KEYS, WHITE_KEY_COUNT, keyMidi, noteName } from './notes'
import './Piano.css'

interface PianoProps {
  transpose: number
  activeKeys: ReadonlySet<number>
  autoKeys: ReadonlySet<number>
  keyLabels: ReadonlyMap<string, string>
  keyCodes: ReadonlyMap<number, string[]>
  onPress: (index: number) => void
  onRelease: (index: number) => void
}

export function Piano({
  transpose,
  activeKeys,
  autoKeys,
  keyLabels,
  keyCodes,
  onPress,
  onRelease,
}: PianoProps) {
  return (
    <div className="piano" style={{ '--white-count': WHITE_KEY_COUNT } as React.CSSProperties}>
      {KEYS.map((key) => {
        const codes = keyCodes.get(key.index)
        return (
          <button
            key={key.index}
            type="button"
            tabIndex={-1}
            className={[
              'piano-key',
              key.isBlack ? 'black' : 'white',
              codes ? '' : 'muted',
              autoKeys.has(key.index) ? 'auto' : '',
              activeKeys.has(key.index) ? 'active' : '',
            ].join(' ')}
            style={{ '--position': key.whiteIndex } as React.CSSProperties}
            onPointerDown={(event) => {
              event.currentTarget.releasePointerCapture(event.pointerId)
              onPress(key.index)
            }}
            onPointerUp={() => onRelease(key.index)}
            onPointerLeave={() => onRelease(key.index)}
            onPointerCancel={() => onRelease(key.index)}
          >
            <span className="key-labels">
              {codes?.map((code) => (
                <span key={code} className="key-label">
                  {keyLabels.get(code)}
                </span>
              ))}
            </span>
            <span className="note-name">{noteName(keyMidi(key.index, transpose))}</span>
          </button>
        )
      })}
    </div>
  )
}
