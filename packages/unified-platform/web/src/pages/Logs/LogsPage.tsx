import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogViewer } from '@otelverse/ui-kit';
import { useLogs } from '@otelverse/api-hooks';

export const LogsPage: React.FC = () => {
  const navigate = useNavigate();

  // Again, for demo purposes hardcoding a 1 hour window
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  const logsQuery = useLogs({
    startTime: oneHourAgo.toISOString(),
    endTime: now.toISOString(),
    limit: 500,
  });

  const handleViewTrace = (traceId: string) => {
    navigate(`/traces/${traceId}`);
  };

  if (logsQuery.isLoading) {
    return <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>Loading logs...</div>;
  }

  if (logsQuery.isError) {
    return (
      <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center', color: 'var(--color-error)' }}>
        Failed to load logs: {String(logsQuery.error)}
      </div>
    );
  }

  return (
    <div style={{ padding: 'var(--spacing-lg)', height: 'calc(100vh - 64px)' }}>
      <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 600, marginBottom: 'var(--spacing-lg)' }}>
        Logs
      </h1>
      <div style={{ height: 'calc(100% - 80px)' }}>
        <LogViewer
          logs={logsQuery.data?.logs || []}
          onViewTrace={handleViewTrace}
        />
      </div>
    </div>
  );
};
