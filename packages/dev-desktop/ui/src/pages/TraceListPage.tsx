import { useState } from 'react'

interface Span {
  spanId: string
  operationName: string
  serviceName: string
  startTime: string
  duration: number
  statusCode: number
}

interface Trace {
  traceId: string
  spans: Span[]
}

export default function TraceListPage() {
  const [traces, setTraces] = useState<Trace[]>([])
  const [loading, setLoading] = useState(false)

  const fetchTraces = async () => {
    setLoading(true)
    try {
      const resp = await fetch('/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `{ traces(limit: 50) { traceId spans { spanId operationName serviceName startTime duration statusCode } } }`,
        }),
      })
      const data = await resp.json()
      setTraces(data.data?.traces ?? [])
    } catch {
      setTraces([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ margin: 0, fontSize: 24 }}>Traces</h1>
        <button onClick={fetchTraces} disabled={loading}
          style={{
            padding: '8px 16px', background: '#0f3460', color: '#fff',
            border: 'none', borderRadius: 6, cursor: 'pointer',
          }}>
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>
      {traces.length === 0 ? (
        <p style={{ color: '#888' }}>No traces yet. Send some telemetry to <code>localhost:4317</code>.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '2px solid #ddd' }}>
              <th style={{ padding: 8 }}>Trace ID</th>
              <th style={{ padding: 8 }}>Spans</th>
              <th style={{ padding: 8 }}>Services</th>
              <th style={{ padding: 8 }}>First Seen</th>
            </tr>
          </thead>
          <tbody>
            {traces.map(t => (
              <tr key={t.traceId} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: 8, fontFamily: 'monospace', fontSize: 12 }}>{t.traceId.slice(0, 16)}...</td>
                <td style={{ padding: 8 }}>{t.spans.length}</td>
                <td style={{ padding: 8 }}>
                  {[...new Set(t.spans.map(s => s.serviceName))].join(', ')}
                </td>
                <td style={{ padding: 8, fontSize: 12 }}>
                  {t.spans[0]?.startTime ?? 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
