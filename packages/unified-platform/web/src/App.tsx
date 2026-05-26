import { Routes, Route, Navigate, Link } from 'react-router-dom'
import { Layout } from '@otelverse/ui-kit'
import TraceListPage from './pages/TraceListPage'
import TraceDetailPage from './pages/TraceDetailPage'

function SidebarNav() {
  return (
    <nav>
      <h2 className="mb-4 text-lg font-semibold">OTelVerse</h2>
      <ul>
        <li className="mb-2">
          <Link to="/traces" className="text-blue-600 hover:underline">Traces</Link>
        </li>
        <li className="mb-2">
          <Link to="/logs" className="text-blue-600 hover:underline">Logs</Link>
        </li>
        <li className="mb-2">
          <Link to="/metrics" className="text-blue-600 hover:underline">Metrics</Link>
        </li>
      </ul>
    </nav>
  )
}

export default function App() {
  return (
    <Layout sidebar={<SidebarNav />}>
      <Routes>
        <Route path="/" element={<Navigate to="/traces" replace />} />
        <Route path="/traces" element={<TraceListPage />} />
        <Route path="/traces/:id" element={<TraceDetailPage />} />
        <Route path="/logs" element={<div>Logs page coming soon</div>} />
        <Route path="/metrics" element={<div>Metrics page coming soon</div>} />
      </Routes>
    </Layout>
  )
}
