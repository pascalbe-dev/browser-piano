import type { ReactNode } from 'react'

export function Shortcut({ children }: { children: ReactNode }) {
  return (
    <kbd className="rounded border border-current px-[5px] py-px text-[10px] leading-[1.3] opacity-50">
      {children}
    </kbd>
  )
}
