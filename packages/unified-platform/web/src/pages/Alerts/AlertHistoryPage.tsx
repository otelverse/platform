import { Link } from 'react-router-dom'
import { Card, Table } from '@otelverse/ui-kit'
import { useAlertHistory } from '@otelverse/api-hooks'

export function AlertHistoryPage() {
  const { history, isLoading } = useAlertHistory()

  if (isLoading) return <div className="p-8">Loading alert history...</div>

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Global Alert History</h1>
      </div>

      <Card className="p-6">
        <Table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Rule ID</th>
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
                  <Link to={`/alerts/${event.alertRuleId}`} className="text-blue-600 hover:underline">
                    {event.alertRuleId.substring(0, 8)}...
                  </Link>
                </td>
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
                <td colSpan={5} className="text-center text-gray-500 py-4">No events found.</td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>
    </div>
  )
}
