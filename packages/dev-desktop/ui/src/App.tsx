import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { invoke } from '@tauri-apps/api/core'
import Layout from './Layout'
import WelcomePage from './pages/WelcomePage'
import TraceListPage from './pages/TraceListPage'
import TraceDetailPage from './pages/TraceDetailPage'
import PipelineBuilderPage from './pages/PipelineBuilderPage'

interface PlatformStatus {
  port: number
  healthy: boolean
}

export default function App() {
  const [status, setStatus] = useState<PlatformStatus | null>(null)
  const [showWelcome, setShowWelcome] = useState(true)

  useEffect(() => {
    invoke<PlatformStatus>('get_platform_status')
      .then(setStatus)
      .catch(() => setStatus({ port: 8080, healthy: false }))
  }, [])

  const graphqlEndpoint = status
    ? `http://localhost:${status.port}/graphql`
    : 'http://localhost:8080/graphql'

  if (showWelcome) {
    return (
      <WelcomePage
        onStart={() => setShowWelcome(false)}
        status={status}
      />
    )
  }

  return (
    <Layout status={status} graphqlEndpoint={graphqlEndpoint}>
      <Routes>
        <Route path="/" element={<Navigate to="/traces" replace />} />
        <Route path="/traces" element={<TraceListPage />} />
        <Route path="/traces/:id" element={<TraceDetailPage />} />
        <Route path="/pipelines" element={<PipelineBuilderPage />} />
      </Routes>
    </Layout>
  )
}
