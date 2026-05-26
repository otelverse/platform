import type { ReactNode } from 'react'

type BadgeVariant = 'neutral' | 'error' | 'warning' | 'success' | 'info'

interface BadgeProps {
  children: ReactNode
  variant?: BadgeVariant
  className?: string
}

const variantStyles: Record<BadgeVariant, string> = {
  neutral: 'bg-gray-70 text-gray-0',
  error: 'bg-error-bg text-error-base',
  warning: 'bg-warning-bg text-warning-base',
  success: 'bg-success-bg text-success-base',
  info: 'bg-info-bg text-info-base',
}

export function Badge({ children, variant = 'neutral', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
