import { useEffect, useState } from 'react'
import { KEYS } from './notes'

const US_LABELS: Record<string, string> = {
  Comma: ',',
  Period: '.',
  Slash: '/',
  Semicolon: ';',
  BracketLeft: '[',
  Minus: '-',
}

function fallbackLabel(code: string): string {
  if (code in US_LABELS) return US_LABELS[code]
  return code.replace(/^(Key|Digit)/, '')
}

function display(label: string): string {
  return label === 'ß' ? label : label.toUpperCase()
}

function buildLabels(layout?: Map<string, string>): ReadonlyMap<string, string> {
  return new Map(
    KEYS.map((key) => [key.code, display(layout?.get(key.code) ?? fallbackLabel(key.code))]),
  )
}

interface KeyboardWithLayout {
  getLayoutMap?: () => Promise<Map<string, string>>
}

export function useKeyLabels(): ReadonlyMap<string, string> {
  const [labels, setLabels] = useState(() => buildLabels())

  useEffect(() => {
    const keyboard = (navigator as Navigator & { keyboard?: KeyboardWithLayout }).keyboard
    keyboard?.getLayoutMap?.().then((layout) => setLabels(buildLabels(layout)), () => {})
  }, [])

  return labels
}
