import { useNavigate } from 'react-router-dom'
import { Table, Spinner, Badge } from '@otelverse/ui-kit'
import { useTraces } from '@otelverse/api-hooks'
import type { Trace } from '@otelverse/api-hooks'

const columns = [
  { key: 'traceId', label: 'Trace ID' },
  { key: 'serviceName', label: 'Service' },
  { key: 'operationName', label: 'Operation' },
  { key: 'startTime', label: 'Start Time' },
  { key: 'duration', label: 'Duration' },
  { key: 'statusCode', label: 'Status' },
]

export default function TraceListPage() {
  const navigate = useNavigate()
  const now = new Date()
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)

  const { data, isLoading, error } = useTraces({
    startTime: oneHourAgo.toISOString(),
    endTime: now.toISOString(),
    limit: 50,
  })

  if (isLoading) return <Spinner />
  if (error) return <div>Error loading traces: {error.message}</div>
  if (!data?.traces?.length) return <div>No traces found</div>

  const rows = data.traces.map((trace: Trace) => ({
    traceId: trace.traceId.slice(0, 16) + '...',
    serviceName: trace.spans[0]?.serviceName ?? 'unknown',
    operationName: trace.spans[0]?.operationName ?? 'unknown',
    startTime: new Date(trace.spans[0]?.startTime ?? '').toLocaleTimeString(),
    duration: `${(trace.spans[0]?.duration ?? 0) / 1_000_000}ms`,
    statusCode: (
      <Badge variant={trace.spans[0]?.statusCode === 0 ? 'success' : 'error'}>
        {trace.spans[0]?.statusCode === 0 ? 'OK' : 'ERROR'}
      </Badge>
    ),
    _onClick: () => navigate(`/traces/${trace.traceId}`),
  }))

  return <Table columns={columns} data={rows} />
}
