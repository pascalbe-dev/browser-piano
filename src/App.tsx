import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { type AudioStatus, noteOff, noteOn, releaseAll, startAudio } from './audio'
import { DEFAULT_SCALE, type Scale, buildKeyMap, keyMidi } from './notes'
import { LeftHand } from './LeftHand'
import { Piano } from './Piano'
import { ScaleSelect } from './ScaleSelect'
import { MAX_TRANSPOSE, Transpose } from './Transpose'
import { useKeyLabels } from './useKeyLabels'
import { useLeftHand } from './useLeftHand'
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
  const leftHand = useLeftHand(scale, transpose, setStatus)
  const { toggle: toggleLeftHand } = leftHand

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
      if (event.code === 'ArrowUp' || event.code === 'ArrowDown') {
        event.preventDefault()
        const step = event.code === 'ArrowUp' ? 1 : -1
        setTranspose((value) => Math.max(-MAX_TRANSPOSE, Math.min(MAX_TRANSPOSE, value + step)))
        return
      }
      if (event.code === 'Space') {
        event.preventDefault()
        if (!event.repeat) void toggleLeftHand()
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
  }, [keyMap, press, release, syncActive, toggleLeftHand])

  return (
    <main className="app">
      <h1>Browser Piano</h1>
      <div className="stage">
        <div className="sidebar">
          <ScaleSelect value={scale} onChange={setScale} />
          <Transpose value={transpose} onChange={setTranspose} />
        </div>
        <Piano
          transpose={transpose}
          activeKeys={activeKeys}
          autoKeys={leftHand.autoKeys}
          keyLabels={keyLabels}
          keyCodes={keyMap.indexToCodes}
          onPress={press}
          onRelease={release}
        />
      </div>
      <LeftHand
        scale={scale}
        progressionId={leftHand.progressionId}
        onProgression={leftHand.setProgressionId}
        bpm={leftHand.bpm}
        onBpm={leftHand.setBpm}
        beatsPerChord={leftHand.beatsPerChord}
        onBeatsPerChord={leftHand.setBeatsPerChord}
        playing={leftHand.playing}
        onToggle={() => void toggleLeftHand()}
        degrees={leftHand.degrees}
        currentChord={leftHand.currentChord}
      />
      <p className="status">{STATUS_TEXT[status]}</p>
    </main>
  )
}

export default App
