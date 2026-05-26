import { useParams } from 'react-router-dom'
import { Spinner, TraceWaterfall } from '@otelverse/ui-kit'
import { useTrace } from '@otelverse/api-hooks'
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

  if (isLoading) return <Spinner />
  if (error) return <div className="p-4 text-error-base">Error loading trace: {error.message}</div>
  if (!data?.trace) return <div className="p-4 text-text-secondary">Trace not found</div>

  const trace = data.trace
  const spans = trace.spans ?? []

  return (
    <div className="p-4">
      <h1 className="mb-4 text-lg font-semibold text-text-primary">
        Trace: <span className="font-mono text-sm">{trace.traceId}</span>
      </h1>
      <p className="mb-4 text-sm text-text-secondary">
        {spans.length} span{spans.length !== 1 ? 's' : ''}
      </p>
      <TraceWaterfall spans={mapSpans(spans)} />
    </div>
  )
}
