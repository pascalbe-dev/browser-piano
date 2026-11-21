import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { type AudioStatus, startAudio } from './audio'
import { type Scale, chordKeyIndices, keyMidi } from './notes'
import { PATTERNS, STEPS_PER_BAR, soundingKeys, voiceKeys } from './patterns'
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
  const [patternId, setPatternId] = useState(PATTERNS[0].id)
  const [bpm, setBpm] = useState(90)
  const [volume, setVolume] = useState(70)
  const [playing, setPlaying] = useState(false)
  const [step, setStep] = useState<number | null>(null)

  const progression = PROGRESSIONS.find((item) => item.id === progressionId) ?? PROGRESSIONS[0]
  const pattern = PATTERNS.find((item) => item.id === patternId) ?? PATTERNS[0]
  const degrees = progression.degrees

  const latest = useRef({ scale, transpose, degrees, bpm, volume })
  useEffect(() => {
    latest.current = { scale, transpose, degrees, bpm, volume }
  }, [scale, transpose, degrees, bpm, volume])

  useEffect(() => {
    if (!playing) return
    startSequence({
      bpm: latest.current.bpm,
      velocity: () => (latest.current.volume / 100) ** 2,
      stepAt: (index) => {
        const voice = pattern.steps[index % STEPS_PER_BAR]
        if (voice === null) return null
        const { scale: currentScale, transpose: currentTranspose, degrees: currentDegrees } =
          latest.current
        const bar = Math.floor(index / STEPS_PER_BAR)
        const degree = currentDegrees[bar % currentDegrees.length]
        const chordKeys = chordKeyIndices(currentScale, degree)
        return voiceKeys(chordKeys, voice).map((key) => keyMidi(key, currentTranspose))
      },
      onStep: setStep,
    })
    return () => stopSequence()
  }, [playing, progressionId, pattern])

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

  const currentChord = step === null ? null : Math.floor(step / STEPS_PER_BAR) % degrees.length

  const autoKeys = useMemo<ReadonlySet<number>>(() => {
    if (step === null || currentChord === null) return NO_KEYS
    const chordKeys = chordKeyIndices(scale, degrees[currentChord])
    return new Set(soundingKeys(chordKeys, pattern, step % STEPS_PER_BAR))
  }, [step, currentChord, scale, degrees, pattern])

  return {
    progressionId,
    setProgressionId,
    patternId,
    setPatternId,
    bpm,
    setBpm,
    volume,
    setVolume,
    playing,
    toggle,
    degrees,
    currentChord,
    autoKeys,
  }
}
