import type { LucideIcon } from 'lucide-react'

interface TraceWaterfallProps {
  className?: string
}

export function TraceWaterfall({ className = '' }: TraceWaterfallProps) {
  return (
    <div className={`flex flex-col items-center justify-center rounded border border-border-default bg-bg-elevated p-12 text-center ${className}`}>
      <svg
        className="mb-4 text-text-muted"
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2 12h20" />
        <path d="M8 4l-4 4 4 4" />
        <path d="M16 4l4 4-4 4" />
        <path d="M2 16h20" />
        <path d="M8 12l-4 4 4 4" />
        <path d="M16 12l4 4-4 4" />
      </svg>
      <p className="text-sm text-text-secondary">Trace Waterfall</p>
      <p className="mt-1 text-xs text-text-muted">Interactive trace visualization coming soon</p>
    </div>
  )
}
