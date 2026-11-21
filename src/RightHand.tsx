import { SONGS } from './songs'
import { songShortcut } from './usePlayback'
import './HandPanel.css'

interface RightHandProps {
  songId: string | null
  onSong: (id: string | null) => void
  volume: number
  onVolume: (volume: number) => void
}

export function RightHand({ songId, onSong, volume, onVolume }: RightHandProps) {
  return (
    <section className="hand-panel">
      <div className="hand-header">
        <span className="hand-title">Rechte Hand</span>
        <span className="hand-hint">Hauptstimme eines Lieds, läuft mit der linken Hand</span>
      </div>

      <div className="option-row">
        <span className="row-label">Lied</span>
        <div className="options">
          <button
            type="button"
            tabIndex={-1}
            className={songId === null ? 'selected' : ''}
            onClick={() => onSong(null)}
          >
            <kbd className="shortcut">{songShortcut(0)}</kbd>
            Aus
          </button>
          {SONGS.map((song, position) => (
            <button
              key={song.id}
              type="button"
              tabIndex={-1}
              className={song.id === songId ? 'selected' : ''}
              onClick={() => onSong(song.id)}
            >
              <kbd className="shortcut">{songShortcut(position + 1)}</kbd>
              {song.title}
              {song.notes.length === 0 && <small>nur Akkorde</small>}
              {song.notes.length > 0 && song.draft && <small>Entwurf</small>}
            </button>
          ))}
        </div>
      </div>

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
        <kbd className="shortcut">⇧ ← →</kbd>
      </label>
    </section>
  )
}
