import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Spinner, TraceWaterfall, SessionReplayPlayer } from '@otelverse/ui-kit'
import { useTrace, useSessionReplay } from '@otelverse/api-hooks'
import type { SpanData } from '@otelverse/ui-kit'
import type { Span } from '@otelverse/api-hooks'

function mapSpans(spans: Span[]): SpanData[] {
  return spans.map((s) => ({
    spanId: s.spanId,
    parentSpanId: s.parentSpanId ?? null,
    operationName: s.operationName,
    serviceName: s.serviceName,
    startTime: s.startTime,
    duration: s.duration,
    statusCode: s.statusCode,
    attributes: s.attributes,
    events: s.events,
  }))
}

export default function TraceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading, error } = useTrace(id ?? '')
  const [showReplay, setShowReplay] = useState(false)

  const trace = data?.trace
  const spans = trace?.spans ?? []
  
  // Find root span and check for session.id
  const rootSpan = spans.find((s) => !s.parentSpanId)
  const sessionIdAttr = rootSpan?.attributes?.find((a) => a.key === 'session.id')
  const sessionId = sessionIdAttr?.value?.stringValue

  const { data: replayData, isLoading: replayLoading, error: replayError } = useSessionReplay(showReplay ? (sessionId ?? '') : '')

  if (isLoading) return <Spinner />
  if (error) return <div className="p-4 text-error-base">Error loading trace: {error.message}</div>
  if (!trace) return <div className="p-4 text-text-secondary">Trace not found</div>

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">
            Trace: <span className="font-mono text-sm">{trace.traceId}</span>
          </h1>
          <p className="text-sm text-text-secondary">
            {spans.length} span{spans.length !== 1 ? 's' : ''}
          </p>
        </div>
        {sessionId && (
          <button
            onClick={() => setShowReplay(!showReplay)}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-base rounded hover:bg-primary-hover"
          >
            {showReplay ? 'Hide Session Replay' : 'View Session Replay'}
          </button>
        )}
      </div>

      {showReplay && (
        <div className="mb-6">
          <h2 className="text-md font-semibold mb-2">Session Replay</h2>
          {replayLoading ? (
            <Spinner />
          ) : replayError ? (
            <div className="text-error-base">Error loading replay: {replayError.message}</div>
          ) : (
            <SessionReplayPlayer events={replayData ?? []} width={800} height={450} />
          )}
        </div>
      )}

      <TraceWaterfall spans={mapSpans(spans)} />
    </div>
  )
}

