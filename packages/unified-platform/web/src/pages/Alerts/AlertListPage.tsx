import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Card, Table } from '@otelverse/ui-kit'
import { useAlertRules, createAlertRule, deleteAlertRule } from '@otelverse/api-hooks'

export function AlertListPage() {
  const { alertRules, isLoading, mutate } = useAlertRules()
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [query, setQuery] = useState('')

  if (isLoading) return <div className="p-8">Loading alerts...</div>

  const handleCreate = async () => {
    await createAlertRule({
      name,
      description: 'Created from UI',
      query,
      intervalSeconds: 60,
      condition: { type: 'COUNT_GT', threshold: 5 }
    })
    setShowForm(false)
    mutate()
  }

  const handleDelete = async (id: string) => {
    await deleteAlertRule(id)
    mutate()
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Alert Rules</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'New Alert Rule'}
        </Button>
      </div>

      {showForm && (
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Create New Alert Rule</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">UQL Query</label>
              <input 
                type="text" 
                value={query} 
                onChange={e => setQuery(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                placeholder="FIND traces WHERE status.code = 2"
              />
            </div>
            <Button onClick={handleCreate} disabled={!name || !query}>Create Rule</Button>
          </div>
        </Card>
      )}

      <Table>
        <thead>
          <tr>
            <th>Name</th>
            <th>State</th>
            <th>Query</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {alertRules?.map(rule => (
            <tr key={rule.id}>
              <td>
                <Link to={`/alerts/${rule.id}`} className="text-blue-600 hover:underline">
                  {rule.name}
                </Link>
              </td>
              <td>
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  rule.state === 'ALERTING' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                }`}>
                  {rule.state}
                </span>
              </td>
              <td className="font-mono text-sm">{rule.query}</td>
              <td>
                <Button variant="danger" size="sm" onClick={() => handleDelete(rule.id)}>Delete</Button>
              </td>
            </tr>
          ))}
          {(!alertRules || alertRules.length === 0) && (
            <tr>
              <td colSpan={4} className="text-center text-gray-500 py-4">No alert rules found.</td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  )
}
