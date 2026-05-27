import React, { useState } from 'react'
import { Card, Table, Spinner, Badge } from '@otelverse/ui-kit'

// Mock useTraces hook since this is a frontend component testable file
function useTraces(query: string) {
  // Return mocked data
  return {
    isLoading: false,
    data: {
      traces: [
        {
          traceId: 'trace-robot-1234',
          spans: [
            {
              spanId: 'span-1',
              serviceName: 'gazebo',
              operationName: 'gazebo.physics.step',
              duration: 15000,
              startTime: new Date().toISOString()
            }
          ]
        }
      ]
    }
  }
}

export function RoboticsDashboardPage() {
  const [selectedRobot, setSelectedRobot] = useState<string | null>(null)
  const { data, isLoading } = useTraces('traces | where service.name = "gazebo"')

  const simulations = [
    { id: 'sim-1', name: 'TurtleBot3 Env', status: 'Running', throughput: '120 msg/s' },
    { id: 'sim-2', name: 'Drone Delivery', status: 'Stopped', throughput: '0 msg/s' },
  ]

  const columns = [
    { key: 'name', label: 'Simulation Name' },
    { key: 'status', label: 'Status' },
    { key: 'throughput', label: 'Telemetry Throughput' },
  ]

  const rows = simulations.map(sim => ({
    ...sim,
    status: <Badge variant={sim.status === 'Running' ? 'success' : 'neutral'}>{sim.status}</Badge>,
    _onClick: () => setSelectedRobot(sim.id)
  }))

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Robotics & IoT Simulator</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card title="Active Simulations">
            <Table columns={columns} data={rows} />
          </Card>
        </div>
        
        <div>
          <Card title="Robot Simulation Overview">
            <div className="p-4 flex flex-col gap-4">
              <div className="flex justify-between">
                <span className="text-gray-500">Total Robots</span>
                <span className="font-bold">2</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Active Sensors</span>
                <span className="font-bold">14</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Data Processed</span>
                <span className="font-bold">1.2 GB</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {selectedRobot && (
        <div className="mt-8">
          <Card title={`Digital Twin Correlation: ${selectedRobot}`}>
            {isLoading ? (
              <Spinner />
            ) : (
              <div className="p-4">
                <h3 className="font-semibold mb-2">Live Trace Waterfall (gazebo)</h3>
                {data.traces.map(trace => (
                  <div key={trace.traceId} className="border p-2 mb-2 rounded bg-gray-50">
                    <div className="font-mono text-sm text-gray-600">{trace.traceId}</div>
                    <div className="mt-2">
                      {trace.spans.map((span: any) => (
                        <div key={span.spanId} className="flex justify-between items-center text-sm">
                          <span className="text-blue-600 font-semibold">{span.operationName}</span>
                          <span className="text-gray-500">{span.duration / 1000} ms</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}
