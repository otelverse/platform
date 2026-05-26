import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

interface Span {
  spanId: string
  parentSpanId: string | null
  operationName: string
  serviceName: string
  startTime: string
  duration: number
  statusCode: number
}

export default function TraceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [spans, setSpans] = useState<Span[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `query($id: String!) { trace(id: $id) { traceId spans { spanId parentSpanId operationName serviceName startTime duration statusCode } } }`,
        variables: { id },
      }),
    })
      .then(r => r.json())
      .then(data => setSpans(data.data?.trace?.spans ?? []))
      .catch(() => setSpans([]))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <Link to="/traces" style={{ color: '#0f3460', marginBottom: 16, display: 'block' }}>&larr; Back to Traces</Link>
      <h1 style={{ margin: '0 0 16px', fontSize: 20 }}>Trace: <code style={{ fontSize: 14 }}>{id}</code></h1>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '2px solid #ddd' }}>
            <th style={{ padding: 8 }}>Span ID</th>
            <th style={{ padding: 8 }}>Operation</th>
            <th style={{ padding: 8 }}>Service</th>
            <th style={{ padding: 8 }}>Duration (ns)</th>
            <th style={{ padding: 8 }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {spans.map(s => (
            <tr key={s.spanId} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: 8, fontFamily: 'monospace', fontSize: 12 }}>{s.spanId.slice(0, 16)}</td>
              <td style={{ padding: 8 }}>{s.operationName}</td>
              <td style={{ padding: 8 }}>{s.serviceName}</td>
              <td style={{ padding: 8 }}>{(s.duration / 1000).toFixed(1)}µs</td>
              <td style={{ padding: 8 }}>{s.statusCode === 0 ? 'OK' : 'ERROR'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
