import { useState } from 'react'

interface CodeBlockProps {
  code: string
  language?: string
  className?: string
}

export function CodeBlock({ code, className = '' }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className={`group relative rounded border border-border-default bg-bg-elevated ${className}`}>
      <pre className="overflow-x-auto p-4 text-sm">
        <code className="font-code text-text-primary">{code}</code>
      </pre>
      <button
        onClick={copy}
        className="absolute right-2 top-2 rounded px-2 py-1 text-xs text-text-muted opacity-0 transition-opacity hover:bg-bg-default group-hover:opacity-100"
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  )
}
