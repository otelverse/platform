import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Badge, Table, PageHeader } from '@otelverse/ui-kit';
import { useChaosExperiment, useChaosBlastRadius, useStartChaosExperiment, useCancelChaosExperiment } from '@otelverse/api-hooks';

export const ChaosExperimentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: experiment, isLoading } = useChaosExperiment(id!);
  const { data: blastRadius } = useChaosBlastRadius(id!);
  
  const startMutation = useStartChaosExperiment();
  const cancelMutation = useCancelChaosExperiment();

  if (isLoading || !experiment) return <div>Loading...</div>;

  const affectedCols = [
    { key: 'serviceName', title: 'Service' },
    { key: 'spanCount', title: 'Affected Spans' },
    { key: 'errorCount', title: 'Errors' },
    { 
      key: 'latencyIncreasePct', 
      title: 'Latency Inc. (ms)',
      render: (val: number) => val.toFixed(2)
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title={experiment.name}
        description={`Target: ${experiment.targetService}`}
        onBack={() => navigate('/chaos')}
        actions={
          <div className="flex gap-2">
            {experiment.status === 'SCHEDULED' && (
              <Button onClick={() => startMutation.mutate(experiment.id)}>Start Experiment</Button>
            )}
            {experiment.status === 'RUNNING' && (
              <Button variant="danger" onClick={() => cancelMutation.mutate(experiment.id)}>Cancel Experiment</Button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-6">
        <Card title="Configuration">
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-500">Status</div>
              <Badge color={experiment.status === 'RUNNING' ? 'green' : 'gray'}>{experiment.status}</Badge>
            </div>
            <div>
              <div className="text-sm text-gray-500">Fault Type</div>
              <div className="font-mono">{experiment.faultType}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Config</div>
              <pre className="p-2 bg-gray-50 rounded text-sm">{JSON.stringify(experiment.config, null, 2)}</pre>
            </div>
          </div>
        </Card>

        <Card title="Blast Radius Analysis">
          {blastRadius ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-4 bg-red-50 rounded-lg">
                  <div className="text-sm text-red-600">Total Affected Spans</div>
                  <div className="text-2xl font-bold text-red-900">{blastRadius.totalAffectedSpans}</div>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <div className="text-sm text-orange-600">Avg. Latency Increase</div>
                  <div className="text-2xl font-bold text-orange-900">{blastRadius.averageLatencyIncrease.toFixed(2)}ms</div>
                </div>
              </div>
              <Table 
                columns={affectedCols} 
                data={blastRadius.affectedServices || []} 
                rowKey="serviceName"
              />
            </div>
          ) : (
            <div className="text-gray-500 text-center p-8">No blast radius data available yet.</div>
          )}
        </Card>
      </div>
    </div>
  );
};
