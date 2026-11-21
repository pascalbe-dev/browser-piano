import type { CSSProperties } from 'react'
import { KEYS, WHITE_KEY_COUNT, keyMidi, noteName } from './notes'

interface PianoProps {
  transpose: number
  activeKeys: ReadonlySet<number>
  autoKeys: ReadonlySet<number>
  songKeys: ReadonlySet<number>
  keyLabels: ReadonlyMap<string, string>
  keyCodes: ReadonlyMap<number, string[]>
  onPress: (index: number) => void
  onRelease: (index: number) => void
}

type Tone = 'idle' | 'muted' | 'auto' | 'song'
type Colors = readonly [background: string, ink: string]

const WHITE_COLORS: Record<Tone, Colors> = {
  idle: ['bg-key', 'text-key-ink'],
  muted: ['bg-key-muted', 'text-key-muted-ink'],
  auto: ['bg-chord', 'text-chord-ink'],
  song: ['bg-melody', 'text-melody-ink'],
}

const BLACK_COLORS: Record<Tone, Colors> = {
  idle: ['bg-key-dark', 'text-key-dark-ink'],
  muted: ['bg-key-dark-muted', 'text-key-dark-muted-ink'],
  auto: ['bg-chord-dark', 'text-chord-dark-ink'],
  song: ['bg-melody-dark', 'text-melody-dark-ink'],
}

const KEY_BASE =
  'absolute top-0 flex cursor-pointer touch-none flex-col items-center justify-end gap-0.5 border border-key-edge px-0 pt-0 pb-2.5'
const WHITE_SHAPE =
  'left-[calc(var(--position)*var(--white-width))] h-full w-(--white-width) rounded-b-md'
const BLACK_SHAPE =
  'left-[calc((var(--position)_+_1)_*_var(--white-width)_-_var(--black-width)_/_2)] z-1 h-[62%] w-(--black-width) rounded-b-sm'

export function Piano({
  transpose,
  activeKeys,
  autoKeys,
  songKeys,
  keyLabels,
  keyCodes,
  onPress,
  onRelease,
}: PianoProps) {
  return (
    <div
      className="relative h-65 min-w-0 flex-1 [--black-width:calc(var(--white-width)*0.6)] [--white-width:calc(100%/var(--white-count))]"
      style={{ '--white-count': WHITE_KEY_COUNT } as CSSProperties}
    >
      {KEYS.map((key) => {
        const codes = keyCodes.get(key.index)
        const tone: Tone = songKeys.has(key.index)
          ? 'song'
          : autoKeys.has(key.index)
            ? 'auto'
            : codes
              ? 'idle'
              : 'muted'
        const [background, ink] = (key.isBlack ? BLACK_COLORS : WHITE_COLORS)[tone]
        const activeBackground = key.isBlack ? 'bg-accent-strong' : 'bg-accent'

        return (
          <button
            key={key.index}
            type="button"
            tabIndex={-1}
            className={[
              KEY_BASE,
              key.isBlack ? BLACK_SHAPE : WHITE_SHAPE,
              activeKeys.has(key.index) ? activeBackground : background,
              ink,
            ].join(' ')}
            style={{ '--position': key.whiteIndex } as CSSProperties}
            onPointerDown={(event) => {
              event.currentTarget.releasePointerCapture(event.pointerId)
              onPress(key.index)
            }}
            onPointerUp={() => onRelease(key.index)}
            onPointerLeave={() => onRelease(key.index)}
            onPointerCancel={() => onRelease(key.index)}
          >
            <span className="flex flex-col items-center gap-0.5">
              {codes?.map((code) => (
                <span
                  key={code}
                  className="min-w-4.5 rounded-sm border border-current px-1 py-px text-[10px] leading-[1.3] font-normal opacity-45"
                >
                  {keyLabels.get(code)}
                </span>
              ))}
            </span>
            <span className={`mt-1 font-semibold ${key.isBlack ? 'text-[12px]' : 'text-[15px]'}`}>
              {noteName(keyMidi(key.index, transpose))}
            </span>
          </button>
        )
      })}
    </div>
  )
}
