import { Suspense, lazy } from 'react'
import { Routes, Route, Navigate, Link } from 'react-router-dom'
import { Layout } from '@otelverse/ui-kit'
import TraceListPage from './pages/TraceListPage'
import TraceDetailPage from './pages/TraceDetailPage'

const PipelineBuilderPage = lazy(() => import('./pages/PipelineBuilder/PipelineBuilderPage'))
const SessionReplayPage = lazy(() => import('./pages/SessionReplayPage').then(m => ({ default: m.SessionReplayPage })))
const ChaosExperimentsPage = lazy(() => import('./pages/Chaos/ChaosExperimentsPage').then(m => ({ default: m.ChaosExperimentsPage })))
const ChaosExperimentDetailPage = lazy(() => import('./pages/Chaos/ChaosExperimentDetailPage').then(m => ({ default: m.ChaosExperimentDetailPage })))
const ChaosExperimentCreateForm = lazy(() => import('./pages/Chaos/ChaosExperimentCreateForm').then(m => ({ default: m.ChaosExperimentCreateForm })))

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
        <li className="mb-2">
          <Link to="/pipelines" className="text-blue-600 hover:underline">Pipelines</Link>
        </li>
        <li className="mb-2">
          <Link to="/chaos" className="text-blue-600 hover:underline">Chaos Experiments</Link>
        </li>
      </ul>
    </nav>
  )
}

export default function App() {
  return (
    <Layout sidebar={<SidebarNav />}>
      <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading module...</div>}>
        <Routes>
          <Route path="/" element={<Navigate to="/traces" replace />} />
          <Route path="/traces" element={<TraceListPage />} />
          <Route path="/traces/:id" element={<TraceDetailPage />} />
          <Route path="/logs" element={<div>Logs page coming soon</div>} />
          <Route path="/metrics" element={<div>Metrics page coming soon</div>} />
          <Route path="/pipelines" element={<PipelineBuilderPage />} />
          <Route path="/pipelines/new" element={<PipelineBuilderPage />} />
          <Route path="/pipelines/:id" element={<PipelineBuilderPage />} />
          <Route path="/replays" element={<SessionReplayPage />} />
          <Route path="/chaos" element={<ChaosExperimentsPage />} />
          <Route path="/chaos/new" element={<ChaosExperimentCreateForm />} />
          <Route path="/chaos/:id" element={<ChaosExperimentDetailPage />} />
        </Routes>
      </Suspense>
    </Layout>
  )
}
