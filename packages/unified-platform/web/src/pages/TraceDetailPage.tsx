import { useParams } from 'react-router-dom'
import { Card, Spinner } from '@otelverse/ui-kit'
import { useTrace } from '@otelverse/api-hooks'

export default function TraceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading, error } = useTrace(id ?? '')

  if (isLoading) return <Spinner />
  if (error) return <div>Error loading trace: {error.message}</div>
  if (!data?.trace) return <div>Trace not found</div>

  const trace = data.trace

  return (
    <Card title={`Trace: ${trace.traceId}`}>
      <div>
        <p><strong>Spans:</strong> {trace.spans.length}</p>
        <pre style={{ fontSize: '0.75rem', marginTop: '1rem', maxHeight: '400px', overflow: 'auto' }}>
          {JSON.stringify(trace, null, 2)}
        </pre>
      </div>
    </Card>
  )
}
