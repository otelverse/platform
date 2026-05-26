import { type InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, className = '', ...props }, ref) => (
    <div className="flex flex-col gap-1">
      <input
        ref={ref}
        className={`rounded border bg-bg-default px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-base ${
          error ? 'border-error-base' : 'border-border-default'
        } ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-error-base">{error}</span>}
    </div>
  ),
)

Input.displayName = 'Input'
