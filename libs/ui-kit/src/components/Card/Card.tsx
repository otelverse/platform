import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  title?: string
  className?: string
}

export function Card({ children, title, className = '' }: CardProps) {
  return (
    <div className={`rounded border border-border-default bg-bg-default p-4 ${className}`}>
      {title && <h3 className="mb-3 text-base font-semibold text-text-primary">{title}</h3>}
      {children}
    </div>
  )
}
