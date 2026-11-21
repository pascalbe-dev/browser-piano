import { HandPanel, OptionButton, OptionRow } from './HandPanel'
import { RangeRow } from './RangeRow'
import { SONGS } from './songs'
import { songShortcut } from './usePlayback'

interface RightHandProps {
  songId: string | null
  onSong: (id: string | null) => void
  volume: number
  onVolume: (volume: number) => void
}

export function RightHand({ songId, onSong, volume, onVolume }: RightHandProps) {
  return (
    <HandPanel title="Rechte Hand" hint="Hauptstimme eines Lieds, läuft mit der linken Hand">
      <OptionRow label="Lied">
        <OptionButton selected={songId === null} shortcut={songShortcut(0)} onClick={() => onSong(null)}>
          Aus
        </OptionButton>
        {SONGS.map((song, position) => (
          <OptionButton
            key={song.id}
            selected={song.id === songId}
            shortcut={songShortcut(position + 1)}
            hint={song.draft ? 'Entwurf' : undefined}
            onClick={() => onSong(song.id)}
          >
            {song.title}
          </OptionButton>
        ))}
      </OptionRow>

      <RangeRow label="Lautstärke" value={volume} min={0} max={100} unit="%" shortcut="⇧ ← →" onChange={onVolume} />
    </HandPanel>
  )
}
