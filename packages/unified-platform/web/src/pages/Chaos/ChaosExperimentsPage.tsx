import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Table, Badge, PageHeader } from '@otelverse/ui-kit';
import { useChaosExperiments } from '@otelverse/api-hooks';

export const ChaosExperimentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: experiments, isLoading } = useChaosExperiments();

  if (isLoading) return <div>Loading...</div>;

  const columns = [
    { key: 'name', title: 'Experiment Name' },
    { key: 'targetService', title: 'Target Service' },
    { key: 'faultType', title: 'Fault Type' },
    { 
      key: 'status', 
      title: 'Status',
      render: (val: string) => {
        const color = val === 'RUNNING' ? 'green' : val === 'CANCELLED' ? 'red' : 'gray';
        return <Badge color={color}>{val}</Badge>;
      }
    },
    { 
      key: 'actions', 
      title: '',
      render: (_: any, record: any) => (
        <Button variant="outline" size="sm" onClick={() => navigate(`/chaos/${record.id}`)}>
          View Details
        </Button>
      )
    }
  ];

  return (
    <div className="p-6">
      <PageHeader
        title="Chaos Engineering"
        description="Inject faults into your pipelines to test resiliency."
        actions={
          <Button onClick={() => navigate('/chaos/new')}>Create Experiment</Button>
        }
      />
      <Card>
        <Table columns={columns} data={experiments || []} rowKey="id" />
      </Card>
    </div>
  );
};
