import { useCallback, useRef } from 'react'
import { trace, SpanStatusCode } from '@opentelemetry/api'
import type { Span, SpanOptions, Tracer } from '@opentelemetry/api'

interface SpanHelpers {
  addEvent: (name: string, attributes?: Record<string, string>) => void
  setAttribute: (key: string, value: string) => void
  end: () => void
}

export function useSpan(
  name: string,
  options?: SpanOptions,
): SpanHelpers {
  const spanRef = useRef<Span | null>(null)

  const tracer: Tracer = trace.getTracer('otelverse-react')

  const addEvent = useCallback(
    (eventName: string, attributes?: Record<string, string>) => {
      if (!spanRef.current) {
        spanRef.current = tracer.startSpan(name, options)
      }
      spanRef.current.addEvent(eventName, attributes)
    },
    [name, options, tracer],
  )

  const setAttribute = useCallback(
    (key: string, value: string) => {
      if (!spanRef.current) {
        spanRef.current = tracer.startSpan(name, options)
      }
      spanRef.current.setAttribute(key, value)
    },
    [name, options, tracer],
  )

  const end = useCallback(() => {
    if (spanRef.current) {
      spanRef.current.end()
      spanRef.current = null
    }
  }, [])

  return { addEvent, setAttribute, end }
}

export function useErrorSpan(
  name: string,
  error: Error,
  options?: SpanOptions,
): void {
  const tracer: Tracer = trace.getTracer('otelverse-react')
  const span = tracer.startSpan(name, options)
  span.recordException(error)
  span.setStatus({ code: SpanStatusCode.ERROR, message: error.message })
  span.end()
}
