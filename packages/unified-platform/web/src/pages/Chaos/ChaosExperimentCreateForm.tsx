import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, PageHeader } from '@otelverse/ui-kit';
import { useCreateChaosExperiment } from '@otelverse/api-hooks';

export const ChaosExperimentCreateForm: React.FC = () => {
  const navigate = useNavigate();
  const createMutation = useCreateChaosExperiment();

  const [name, setName] = useState('');
  const [targetService, setTargetService] = useState('');
  const [faultType, setFaultType] = useState<'LATENCY' | 'ERROR'>('LATENCY');
  const [latencyMs, setLatencyMs] = useState(100);
  const [errorCode, setErrorCode] = useState(500);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      name,
      targetService,
      faultType,
      config: faultType === 'LATENCY' ? { latencyMs } : { errorStatusCode: errorCode },
    }, {
      onSuccess: () => navigate('/chaos')
    });
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <PageHeader title="Create Chaos Experiment" onBack={() => navigate('/chaos')} />
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Experiment Name</label>
            <input 
              type="text" 
              className="w-full p-2 border rounded-md" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              required 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Service</label>
            <input 
              type="text" 
              className="w-full p-2 border rounded-md" 
              value={targetService} 
              onChange={e => setTargetService(e.target.value)} 
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fault Type</label>
            <select 
              className="w-full p-2 border rounded-md" 
              value={faultType} 
              onChange={e => setFaultType(e.target.value as any)}
            >
              <option value="LATENCY">Latency Injection</option>
              <option value="ERROR">Error Injection</option>
            </select>
          </div>

          {faultType === 'LATENCY' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Latency (ms)</label>
              <input 
                type="number" 
                className="w-full p-2 border rounded-md" 
                value={latencyMs} 
                onChange={e => setLatencyMs(Number(e.target.value))} 
                required 
              />
            </div>
          )}

          {faultType === 'ERROR' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">HTTP Status Code</label>
              <input 
                type="number" 
                className="w-full p-2 border rounded-md" 
                value={errorCode} 
                onChange={e => setErrorCode(Number(e.target.value))} 
                required 
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" type="button" onClick={() => navigate('/chaos')}>Cancel</Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create Experiment'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
