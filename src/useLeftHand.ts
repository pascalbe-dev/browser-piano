import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { type AudioStatus, startAudio } from './audio'
import { type Scale, chordKeyIndices, keyMidi } from './notes'
import { PROGRESSIONS } from './progressions'
import { setTempo, startSequence, stopSequence } from './sequencer'

export const MIN_BPM = 40
export const MAX_BPM = 200

const NO_KEYS: ReadonlySet<number> = new Set()

export function useLeftHand(
  scale: Scale,
  transpose: number,
  onAudioStatus: (status: AudioStatus) => void,
) {
  const [progressionId, setProgressionId] = useState(PROGRESSIONS[0].id)
  const [bpm, setBpm] = useState(90)
  const [beatsPerChord, setBeatsPerChord] = useState<2 | 4>(4)
  const [playing, setPlaying] = useState(false)
  const [step, setStep] = useState<number | null>(null)

  const progression = PROGRESSIONS.find((item) => item.id === progressionId) ?? PROGRESSIONS[0]
  const degrees = progression.degrees

  const latest = useRef({ scale, transpose, degrees, bpm })
  useEffect(() => {
    latest.current = { scale, transpose, degrees, bpm }
  }, [scale, transpose, degrees, bpm])

  useEffect(() => {
    if (!playing) return
    startSequence({
      bpm: latest.current.bpm,
      beatsPerChord,
      chordAt: (index) => {
        const { scale: currentScale, transpose: currentTranspose, degrees: currentDegrees } =
          latest.current
        const degree = currentDegrees[index % currentDegrees.length]
        return chordKeyIndices(currentScale, degree).map((key) => keyMidi(key, currentTranspose))
      },
      onStep: setStep,
    })
    return () => stopSequence()
  }, [playing, progressionId, beatsPerChord])

  useEffect(() => {
    if (playing) setTempo(bpm)
  }, [bpm, playing])

  const toggle = useCallback(async () => {
    if (playing) {
      setPlaying(false)
      setStep(null)
      return
    }
    await startAudio(onAudioStatus)
    setPlaying(true)
  }, [playing, onAudioStatus])

  const currentChord = step === null ? null : step % degrees.length

  const autoKeys = useMemo<ReadonlySet<number>>(() => {
    if (currentChord === null) return NO_KEYS
    return new Set(chordKeyIndices(scale, degrees[currentChord]))
  }, [currentChord, scale, degrees])

  return {
    progressionId,
    setProgressionId,
    bpm,
    setBpm,
    beatsPerChord,
    setBeatsPerChord,
    playing,
    toggle,
    degrees,
    currentChord,
    autoKeys,
  }
}
