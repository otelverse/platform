interface PlatformStatus {
  port: number
  healthy: boolean
}

interface WelcomePageProps {
  onStart: () => void
  status: PlatformStatus | null
}

import { invoke } from '@tauri-apps/api/core'
import { useState } from 'react'

export default function WelcomePage({ onStart, status }: WelcomePageProps) {
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleStartSampleApp = async () => {
    setStarting(true)
    setError(null)
    try {
      const resp = await invoke<{ status: string, error?: string }>('start_sample_app')
      if (resp.status === 'ok') {
        onStart() // navigate to traces
      } else {
        setError(resp.error || 'Failed to start sample app')
        setStarting(false)
      }
    } catch (err: any) {
      setError(err.toString())
      setStarting(false)
    }
  }
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      fontFamily: 'system-ui, sans-serif',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      color: '#fff',
      textAlign: 'center',
      padding: 32,
    }}>
      <h1 style={{ fontSize: 36, marginBottom: 8 }}>OTelVerse Dev Desktop</h1>
      <p style={{ fontSize: 16, color: '#aaa', marginBottom: 12, maxWidth: 500 }}>
        Run the complete OTelVerse observability stack locally with one click.
        Instrument your code, see traces, and validate pipelines offline.
      </p>
      <div style={{
        display: 'flex', gap: 8, alignItems: 'center', marginBottom: 32,
        fontSize: 14, color: status?.healthy ? '#4caf50' : '#ff9800',
      }}>
        <span style={{
          width: 10, height: 10, borderRadius: '50%',
          background: status?.healthy ? '#4caf50' : '#ff9800',
          display: 'inline-block',
        }} />
        {status?.healthy ? 'Platform running' : 'Starting platform...'}
      </div>
      <div style={{ display: 'flex', gap: 16 }}>
        <button onClick={onStart}
          style={{
            padding: '12px 32px', fontSize: 16, background: '#0f3460',
            color: '#fff', border: '1px solid #1a5276', borderRadius: 8,
            cursor: 'pointer',
          }}>
          Start Exploring (Custom App)
        </button>
        <button onClick={handleStartSampleApp} disabled={starting}
          style={{
            padding: '12px 32px', fontSize: 16, background: '#4caf50',
            color: '#fff', border: '1px solid #2e7d32', borderRadius: 8,
            cursor: starting ? 'wait' : 'pointer', opacity: starting ? 0.7 : 1
          }}>
          {starting ? 'Starting...' : 'Start Sample App'}
        </button>
      </div>
      {error && <div style={{ color: '#ff5252', marginTop: 16, fontSize: 14 }}>{error}</div>}
      <div style={{ marginTop: 48, fontSize: 13, color: '#666' }}>
        <p>You can send traces to: <code style={{ background: '#333', padding: '2px 6px', borderRadius: 4 }}>localhost:4317</code></p>
        <p>GraphQL API: <code style={{ background: '#333', padding: '2px 6px', borderRadius: 4 }}>localhost:{status?.port ?? 8080}/graphql</code></p>
      </div>
    </div>
  )
}
