import type { ReactNode } from 'react'
import { Button } from './Button'
import { SectionTitle } from './SectionTitle'
import { Shortcut } from './Shortcut'

interface HandPanelProps {
  title: string
  action?: ReactNode
  hint: string
  children: ReactNode
}

export function HandPanel({ title, action, hint, children }: HandPanelProps) {
  return (
    <section className="flex flex-auto flex-col gap-4 rounded-xl bg-panel px-6 py-5 only:grow-0">
      <div className="flex items-center gap-3">
        <SectionTitle>{title}</SectionTitle>
        {action}
        <span className="text-[12px] text-muted">{hint}</span>
      </div>
      {children}
    </section>
  )
}

export function OptionRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-4">
      <span className="w-18 shrink-0 text-[13px] text-muted">{label}</span>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
}

interface OptionButtonProps {
  selected: boolean
  shortcut: string
  hint?: string
  onClick: () => void
  children: ReactNode
}

export function OptionButton({ selected, shortcut, hint, onClick, children }: OptionButtonProps) {
  return (
    <Button
      className="flex flex-col items-center gap-0.5 px-3.5 py-2 text-[14px]"
      selected={selected}
      onClick={onClick}
    >
      <Shortcut>{shortcut}</Shortcut>
      {children}
      {hint && <small className="text-[11px] opacity-70">{hint}</small>}
    </Button>
  )
}
