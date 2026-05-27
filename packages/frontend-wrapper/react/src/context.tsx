import React, { createContext, useContext, useEffect, useRef } from 'react'
import { initOtel, getSessionId } from '@otelverse/web'
import type { OtelInstance } from '@otelverse/web'
import { trace } from '@opentelemetry/api'
import type { Tracer } from '@opentelemetry/api'

interface OtelVerseContextValue {
  otel: OtelInstance | null
  tracer: Tracer | null
  sessionId: string
}

const OtelVerseContext = createContext<OtelVerseContextValue>({
  otel: null,
  tracer: null,
  sessionId: '',
})

export interface OtelProviderProps {
  collectorUrl?: string
  serviceName?: string
  children: React.ReactNode
}

export function OtelProvider({
  collectorUrl,
  serviceName,
  children,
}: OtelProviderProps) {
  const initialized = useRef(false)
  const otelRef = useRef<OtelInstance | null>(null)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    const instance = initOtel({ collectorUrl, serviceName })
    otelRef.current = instance

    return () => {
      instance.shutdown()
    }
  }, [collectorUrl, serviceName])

  const tracer = trace.getTracer('otelverse-react')
  const sessionId = getSessionId()

  const value: OtelVerseContextValue = {
    otel: otelRef.current,
    tracer,
    sessionId,
  }

  return (
    <OtelVerseContext.Provider value={value}>
      {children}
    </OtelVerseContext.Provider>
  )
}

export function useOtelVerseContext(): OtelVerseContextValue {
  return useContext(OtelVerseContext)
}
