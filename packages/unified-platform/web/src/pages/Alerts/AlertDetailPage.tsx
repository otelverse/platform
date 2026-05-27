import { useParams, Link } from 'react-router-dom'
import { Card, Table } from '@otelverse/ui-kit'
import { useAlertRule, useAlertHistory } from '@otelverse/api-hooks'

export function AlertDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { alertRule, isLoading } = useAlertRule(id || '')
  const { history, isLoading: historyLoading } = useAlertHistory(id)

  if (isLoading || historyLoading) return <div className="p-8">Loading alert details...</div>
  if (!alertRule) return <div className="p-8 text-red-600">Alert not found</div>

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Link to="/alerts" className="text-blue-600 hover:underline">&larr; Back to Alerts</Link>
        <h1 className="text-2xl font-bold text-gray-900">{alertRule.name}</h1>
        <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
          alertRule.state === 'ALERTING' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
        }`}>
          {alertRule.state}
        </span>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Configuration</h3>
        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">UQL Query</dt>
            <dd className="mt-1 text-sm text-gray-900 font-mono">{alertRule.query}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Evaluation Interval</dt>
            <dd className="mt-1 text-sm text-gray-900">{alertRule.intervalSeconds} seconds</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Last Evaluated</dt>
            <dd className="mt-1 text-sm text-gray-900">{alertRule.lastEvaluatedAt ? new Date(alertRule.lastEvaluatedAt).toLocaleString() : 'Never'}</dd>
          </div>
        </dl>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Evaluation History</h3>
        <Table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>State</th>
              <th>Result Count</th>
              <th>Notification Sent</th>
            </tr>
          </thead>
          <tbody>
            {history?.map(event => (
              <tr key={event.id}>
                <td>{new Date(event.timestamp).toLocaleString()}</td>
                <td>
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    event.state === 'ALERTING' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {event.state}
                  </span>
                </td>
                <td>{event.queryResultCount}</td>
                <td>{event.notificationSent ? 'Yes' : 'No'}</td>
              </tr>
            ))}
            {(!history || history.length === 0) && (
              <tr>
                <td colSpan={4} className="text-center text-gray-500 py-4">No history available.</td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>
    </div>
  )
}
