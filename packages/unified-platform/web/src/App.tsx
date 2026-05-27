import { Suspense, lazy } from 'react'
import { Routes, Route, Navigate, Link } from 'react-router-dom'
import { Layout } from '@otelverse/ui-kit'
import TraceListPage from './pages/TraceListPage'
import TraceDetailPage from './pages/TraceDetailPage'
import { EdgeAgentListPage } from './pages/Edge/EdgeAgentListPage'

const PipelineBuilderPage = lazy(() => import('./pages/PipelineBuilder/PipelineBuilderPage'))
const SessionReplayPage = lazy(() => import('./pages/SessionReplayPage').then(m => ({ default: m.SessionReplayPage })))
const ChaosExperimentsPage = lazy(() => import('./pages/Chaos/ChaosExperimentsPage').then(m => ({ default: m.ChaosExperimentsPage })))
const ChaosExperimentDetailPage = lazy(() => import('./pages/Chaos/ChaosExperimentDetailPage').then(m => ({ default: m.ChaosExperimentDetailPage })))
const ChaosExperimentCreateForm = lazy(() => import('./pages/Chaos/ChaosExperimentCreateForm').then(m => ({ default: m.ChaosExperimentCreateForm })))

// Alert pages
const AlertListPage = lazy(() => import('./pages/Alerts/AlertListPage').then(m => ({ default: m.AlertListPage })))
const AlertDetailPage = lazy(() => import('./pages/Alerts/AlertDetailPage').then(m => ({ default: m.AlertDetailPage })))
const AlertHistoryPage = lazy(() => import('./pages/Alerts/AlertHistoryPage').then(m => ({ default: m.AlertHistoryPage })))

// Metrics & Logs pages
const DashboardPage = lazy(() => import('./pages/Dashboard/DashboardPage').then(m => ({ default: m.DashboardPage })))
const LogsPage = lazy(() => import('./pages/Logs/LogsPage').then(m => ({ default: m.LogsPage })))

// Robotics
const RoboticsDashboardPage = lazy(() => import('./pages/RoboticsDashboardPage').then(m => ({ default: m.RoboticsDashboardPage })))

function SidebarNav() {
  return (
    <nav>
      <h2 className="mb-4 text-lg font-semibold">OTelVerse</h2>
      <ul>
        <li className="mb-2">
          <Link to="/dashboard" className="text-blue-600 hover:underline">Dashboard</Link>
        </li>
        <li className="mb-2">
          <Link to="/traces" className="text-blue-600 hover:underline">Traces</Link>
        </li>
        <li className="mb-2">
          <Link to="/logs" className="text-blue-600 hover:underline">Logs</Link>
        </li>
        <li className="mb-2">
          <Link to="/pipelines" className="text-blue-600 hover:underline">Pipelines</Link>
        </li>
        <li className="mb-2">
          <Link to="/alerts" className="text-blue-600 hover:underline">Alerts</Link>
        </li>
        <li className="mb-2">
          <Link to="/alerts/history" className="text-blue-600 hover:underline">Alert History</Link>
        </li>
        <li className="mb-2">
          <Link to="/chaos" className="text-blue-600 hover:underline">Chaos Experiments</Link>
        </li>
        <li className="mb-2">
          <Link to="/edge" className="text-blue-600 hover:underline">Edge Agents</Link>
        </li>
        <li className="mb-2">
          <Link to="/robotics" className="text-blue-600 hover:underline">Robotics SDK</Link>
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
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/traces" element={<TraceListPage />} />
          <Route path="/traces/:id" element={<TraceDetailPage />} />
          <Route path="/logs" element={<LogsPage />} />
          <Route path="/pipelines" element={<PipelineBuilderPage />} />
          <Route path="/pipelines/new" element={<PipelineBuilderPage />} />
          <Route path="/pipelines/:id" element={<PipelineBuilderPage />} />
          <Route path="/alerts" element={<AlertListPage />} />
          <Route path="/alerts/history" element={<AlertHistoryPage />} />
          <Route path="/alerts/:id" element={<AlertDetailPage />} />
          <Route path="/replays" element={<SessionReplayPage />} />
          <Route path="/chaos" element={<ChaosExperimentsPage />} />
          <Route path="/chaos/new" element={<ChaosExperimentCreateForm />} />
          <Route path="/chaos/:id" element={<ChaosExperimentDetailPage />} />
          <Route path="/edge" element={<EdgeAgentListPage />} />
          <Route path="/robotics" element={<RoboticsDashboardPage />} />
        </Routes>
      </Suspense>
    </Layout>
  )
}

