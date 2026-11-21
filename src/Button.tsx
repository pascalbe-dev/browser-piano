import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'tabIndex'> {
  selected?: boolean
}

const BASE = 'cursor-pointer rounded-lg border disabled:cursor-default disabled:opacity-35'
const IDLE = 'border-line bg-surface text-fg hover:enabled:bg-surface-hover'
const SELECTED = 'border-accent bg-accent-strong text-white'

export function Button({ selected = false, className = '', ...props }: ButtonProps) {
  return (
    <button
      type="button"
      tabIndex={-1}
      className={`${BASE} ${selected ? SELECTED : IDLE} ${className}`}
      {...props}
    />
  )
}
