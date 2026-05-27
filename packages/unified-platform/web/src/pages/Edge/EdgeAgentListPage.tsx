import React, { useState, useEffect } from 'react';
import { Card, Button } from '@otelverse/ui-kit';

interface EdgeAgent {
  id: string;
  status: string;
  last_heartbeat: string;
  config_yaml: string;
}

export const EdgeAgentListPage: React.FC = () => {
  const [agents, setAgents] = useState<EdgeAgent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<EdgeAgent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'query { agents { id status last_heartbeat config_yaml } }' })
    })
      .then(res => res.json())
      .then(data => {
        if (data.data?.agents) {
          setAgents(data.data.agents);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch agents:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="p-8">Loading Edge Agents...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Edge Agents</h1>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {agents.map(agent => (
          <Card key={agent.id} className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50" onClick={() => setSelectedAgent(agent)}>
            <div>
              <div className="font-semibold text-lg">{agent.id}</div>
              <div className="text-sm text-gray-500">Last Heartbeat: {new Date(agent.last_heartbeat).toLocaleString()}</div>
            </div>
            <div>
              <span className={`px-3 py-1 rounded-full text-sm ${agent.status === 'online' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {agent.status}
              </span>
            </div>
          </Card>
        ))}
        {agents.length === 0 && (
          <div className="text-gray-500">No edge agents registered.</div>
        )}
      </div>

      {selectedAgent && (
        <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-xl border-l p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Agent Details</h2>
            <Button onClick={() => setSelectedAgent(null)}>Close</Button>
          </div>
          <div className="mb-4">
            <div className="text-sm font-semibold text-gray-500">Agent ID</div>
            <div>{selectedAgent.id}</div>
          </div>
          <div className="mb-4">
            <div className="text-sm font-semibold text-gray-500">Status</div>
            <div className={`inline-block px-2 py-1 rounded text-sm ${selectedAgent.status === 'online' ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
              {selectedAgent.status}
            </div>
          </div>
          <div className="mb-4">
            <div className="text-sm font-semibold text-gray-500">Configuration (YAML)</div>
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto whitespace-pre-wrap mt-1">
              {selectedAgent.config_yaml}
            </pre>
          </div>
          {/* Add Telemetry Throughput stats mockup here if needed */}
        </div>
      )}
    </div>
  );
};
