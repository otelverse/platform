import { ReactNode } from 'react'

interface PlatformStatus {
  port: number
  healthy: boolean
}

interface LayoutProps {
  children: ReactNode
  status: PlatformStatus | null
  graphqlEndpoint: string
}

export default function Layout({ children, status }: LayoutProps) {
  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <nav style={{
        width: 220,
        background: '#1a1a2e',
        color: '#e0e0e0',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <h2 style={{ margin: '0 0 24px', fontSize: '18px', color: '#fff' }}>OTelVerse</h2>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          <li style={{ marginBottom: 8 }}>
            <a href="/traces" style={{ color: '#e0e0e0', textDecoration: 'none' }}>Traces</a>
          </li>
          <li style={{ marginBottom: 8 }}>
            <a href="/pipelines" style={{ color: '#e0e0e0', textDecoration: 'none' }}>Pipelines</a>
          </li>
        </ul>
        <div style={{ marginTop: 'auto', fontSize: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: status?.healthy ? '#4caf50' : '#f44336',
              display: 'inline-block',
            }} />
            Platform: {status?.healthy ? 'Connected' : 'Disconnected'}
          </div>
          <div style={{ color: '#888', marginTop: 4 }}>
            Port: {status?.port ?? 'N/A'}
          </div>
        </div>
      </nav>
      <main style={{ flex: 1, padding: 24, overflow: 'auto', background: '#f5f5f5' }}>
        {children}
      </main>
    </div>
  )
}
