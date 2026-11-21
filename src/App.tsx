import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { type AudioStatus, noteOff, noteOn, releaseAll, startAudio } from './audio'
import { DEFAULT_SCALE, type Scale, buildKeyMap, keyMidi } from './notes'
import { LeftHand } from './LeftHand'
import { Piano } from './Piano'
import { RightHand } from './RightHand'
import { ScaleSelect } from './ScaleSelect'
import { SONGS_ENABLED } from './songs'
import { MAX_TRANSPOSE, Transpose } from './Transpose'
import { useKeyLabels } from './useKeyLabels'
import { usePlayback } from './usePlayback'
import './App.css'

const STATUS_TEXT: Record<AudioStatus, string> = {
  idle: 'Taste drücken oder klicken, um den Ton zu starten',
  loading: 'Klaviersamples laden … (Synth-Klang bis dahin)',
  ready: 'Klavier bereit',
  fallback: 'Samples nicht erreichbar – Synth-Klang',
}

function App() {
  const [transpose, setTranspose] = useState(0)
  const transposeRef = useRef(transpose)

  useEffect(() => {
    transposeRef.current = transpose
  }, [transpose])

  const [scale, setScale] = useState<Scale>(DEFAULT_SCALE)
  const keyMap = useMemo(() => buildKeyMap(scale), [scale])
  const heldCodes = useRef(new Map<string, number>())
  const playing = useRef(new Map<number, number>())
  const [activeKeys, setActiveKeys] = useState<ReadonlySet<number>>(new Set())
  const [status, setStatus] = useState<AudioStatus>('idle')
  const keyLabels = useKeyLabels()
  const playback = usePlayback(scale, setScale, transpose, setStatus)
  const { toggle: togglePlayback, handleShortcut: handlePlaybackShortcut } = playback

  const syncActive = useCallback(() => {
    setActiveKeys(new Set(playing.current.keys()))
  }, [])

  const press = useCallback(
    (index: number) => {
      if (playing.current.has(index)) return
      const midi = keyMidi(index, transposeRef.current)
      playing.current.set(index, midi)
      syncActive()
      void startAudio(setStatus).then(() => {
        if (playing.current.get(index) === midi) noteOn(midi)
      })
    },
    [syncActive],
  )

  const release = useCallback(
    (index: number) => {
      const midi = playing.current.get(index)
      if (midi === undefined) return
      playing.current.delete(index)
      syncActive()
      noteOff(midi)
    },
    [syncActive],
  )

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      if (handlePlaybackShortcut(event)) {
        event.preventDefault()
        return
      }
      if (event.code === 'ArrowUp' || event.code === 'ArrowDown') {
        event.preventDefault()
        const step = event.code === 'ArrowUp' ? 1 : -1
        setTranspose((value) => Math.max(-MAX_TRANSPOSE, Math.min(MAX_TRANSPOSE, value + step)))
        return
      }
      if (event.code === 'Space') {
        event.preventDefault()
        if (!event.repeat) void togglePlayback()
        return
      }
      const index = keyMap.codeToIndex.get(event.code)
      if (index === undefined) return
      event.preventDefault()
      if (event.repeat || heldCodes.current.has(event.code)) return
      heldCodes.current.set(event.code, index)
      press(index)
    }
    const onKeyUp = (event: KeyboardEvent) => {
      const index = heldCodes.current.get(event.code)
      if (index === undefined) return
      heldCodes.current.delete(event.code)
      const stillHeld = [...heldCodes.current.values()].includes(index)
      if (!stillHeld) release(index)
    }
    const onBlur = () => {
      heldCodes.current.clear()
      playing.current.clear()
      syncActive()
      releaseAll()
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', onBlur)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', onBlur)
    }
  }, [keyMap, press, release, syncActive, togglePlayback, handlePlaybackShortcut])

  return (
    <main className="app">
      <h1>
        <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="" width={36} height={36} />
        Browser Piano
      </h1>
      <div className="stage">
        <div className="sidebar">
          <ScaleSelect value={scale} onChange={setScale} />
          <Transpose value={transpose} onChange={setTranspose} />
        </div>
        <Piano
          transpose={transpose}
          activeKeys={activeKeys}
          autoKeys={playback.autoKeys}
          songKeys={playback.songKeys}
          keyLabels={keyLabels}
          keyCodes={keyMap.indexToCodes}
          onPress={press}
          onRelease={release}
        />
      </div>
      <div className="mt-4 flex flex-wrap items-stretch gap-4">
        <LeftHand
          scale={scale}
          progressionId={playback.progressionId}
          onProgression={playback.setProgressionId}
          bpm={playback.bpm}
          onBpm={playback.setBpm}
          volume={playback.volume}
          onVolume={playback.setVolume}
          patternId={playback.patternId}
          onPattern={playback.setPatternId}
          playing={playback.playing}
          onToggle={() => void togglePlayback()}
        />
        {SONGS_ENABLED && (
          <RightHand
            songId={playback.songId}
            onSong={playback.selectSong}
            volume={playback.rightVolume}
            onVolume={playback.setRightVolume}
          />
        )}
      </div>
      <p className="status">{STATUS_TEXT[status]}</p>
    </main>
  )
}

export default App
