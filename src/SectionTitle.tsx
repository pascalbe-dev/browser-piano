import type { ReactNode } from 'react'

export function SectionTitle({ children }: { children: ReactNode }) {
  return <span className="text-[13px] tracking-[0.08em] text-muted uppercase">{children}</span>
}
