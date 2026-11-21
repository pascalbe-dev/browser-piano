import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { type AudioStatus, startAudio } from './audio'
import { type Scale, chordKeyIndices, keyMidi } from './notes'
import { PATTERNS, STEPS_PER_BAR, soundingKeys, voiceKeys } from './patterns'
import { PROGRESSIONS } from './progressions'
import { type Voice, setTempo, startSequence, stopSequence } from './sequencer'
import { SONGS, buildTimeline } from './songs'

export const MIN_BPM = 40
export const MAX_BPM = 200

const NO_KEYS: ReadonlySet<number> = new Set()

const STEP = 5

const digitLabel = (index: number): string => (index < 9 ? String(index + 1) : index === 9 ? '0' : '')

export const progressionShortcut = (position: number): string => digitLabel(position)
export const patternShortcut = (position: number): string =>
  digitLabel(PROGRESSIONS.length + position)
export const songShortcut = (position: number): string =>
  digitLabel(PROGRESSIONS.length + PATTERNS.length + position)

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value))

export function usePlayback(
  scale: Scale,
  onScaleChange: (scale: Scale) => void,
  transpose: number,
  onAudioStatus: (status: AudioStatus) => void,
) {
  const [progressionId, setProgressionId] = useState(PROGRESSIONS[0].id)
  const [patternId, setPatternId] = useState(PATTERNS[0].id)
  const [songId, setSongId] = useState<string | null>(null)
  const [bpm, setBpm] = useState(110)
  const [volume, setVolume] = useState(70)
  const [rightVolume, setRightVolume] = useState(80)
  const [playing, setPlaying] = useState(false)
  const [step, setStep] = useState<number | null>(null)

  const progression = PROGRESSIONS.find((item) => item.id === progressionId) ?? PROGRESSIONS[0]
  const pattern = PATTERNS.find((item) => item.id === patternId) ?? PATTERNS[0]
  const song = SONGS.find((item) => item.id === songId) ?? null
  const timeline = useMemo(() => (song ? buildTimeline(song) : null), [song])
  const degrees = progression.degrees

  const latest = useRef({ scale, transpose, degrees, bpm, volume, rightVolume })
  useEffect(() => {
    latest.current = { scale, transpose, degrees, bpm, volume, rightVolume }
  }, [scale, transpose, degrees, bpm, volume, rightVolume])

  useEffect(() => {
    if (!playing) return
    const leftHand: Voice = {
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
    }
    const voices = [leftHand]
    if (song && timeline) {
      voices.push({
        velocity: () => (latest.current.rightVolume / 100) ** 2,
        stepAt: (index) => {
          const slot = index % song.loopSlots
          const key = timeline.onsets.get(slot)
          if (key !== undefined) return [keyMidi(key, latest.current.transpose)]
          return timeline.ends.has(slot) ? [] : null
        },
      })
    }
    startSequence({ bpm: latest.current.bpm, voices, onStep: setStep })
    return () => stopSequence()
  }, [playing, progressionId, pattern, song, timeline])

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

  const selectSong = useCallback(
    (id: string | null) => {
      setSongId(id)
      const selected = SONGS.find((item) => item.id === id)
      if (!selected) return
      setProgressionId(selected.progressionId)
      if (selected.bpm !== undefined) setBpm(selected.bpm)
      onScaleChange(selected.scale)
    },
    [onScaleChange],
  )

  const handleShortcut = useCallback(
    (event: KeyboardEvent): boolean => {
      const digit = /^Digit(\d)$/.exec(event.code)
      if (digit && !event.shiftKey) {
        const position = (Number(digit[1]) + 9) % 10
        const progressionOption = PROGRESSIONS[position]
        if (progressionOption) {
          setProgressionId(progressionOption.id)
          return true
        }
        const patternPosition = position - PROGRESSIONS.length
        const patternOption = PATTERNS[patternPosition]
        if (patternOption) {
          setPatternId(patternOption.id)
          return true
        }
        const songPosition = patternPosition - PATTERNS.length
        if (songPosition === 0) {
          selectSong(null)
          return true
        }
        const songOption = SONGS[songPosition - 1]
        if (songOption) {
          selectSong(songOption.id)
          return true
        }
        return false
      }
      if (event.code === 'ArrowLeft' || event.code === 'ArrowRight') {
        const direction = event.code === 'ArrowRight' ? 1 : -1
        if (event.shiftKey) {
          setRightVolume((value) => clamp(value + direction * STEP, 0, 100))
        } else {
          setBpm((value) => clamp(value + direction * STEP, MIN_BPM, MAX_BPM))
        }
        return true
      }
      if (event.shiftKey && (event.code === 'ArrowUp' || event.code === 'ArrowDown')) {
        const delta = event.code === 'ArrowUp' ? STEP : -STEP
        setVolume((value) => clamp(value + delta, 0, 100))
        return true
      }
      return false
    },
    [selectSong],
  )

  const currentChord = step === null ? null : Math.floor(step / STEPS_PER_BAR) % degrees.length

  const autoKeys = useMemo<ReadonlySet<number>>(() => {
    if (step === null || currentChord === null) return NO_KEYS
    const chordKeys = chordKeyIndices(scale, degrees[currentChord])
    return new Set(soundingKeys(chordKeys, pattern, step % STEPS_PER_BAR))
  }, [step, currentChord, scale, degrees, pattern])

  const songKeys = useMemo<ReadonlySet<number>>(() => {
    if (step === null || !song || !timeline) return NO_KEYS
    const key = timeline.sounding[step % song.loopSlots]
    return key === null ? NO_KEYS : new Set([key])
  }, [step, song, timeline])

  return {
    progressionId,
    setProgressionId,
    patternId,
    setPatternId,
    songId,
    selectSong,
    bpm,
    setBpm,
    volume,
    setVolume,
    rightVolume,
    setRightVolume,
    playing,
    toggle,
    handleShortcut,
    autoKeys,
    songKeys,
  }
}
