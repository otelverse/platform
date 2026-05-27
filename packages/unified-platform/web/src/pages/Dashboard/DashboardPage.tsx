import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardGrid, MetricWidget } from '@otelverse/ui-kit';
import { useMetrics } from '@otelverse/api-hooks';

// A pre-built dashboard page
export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  // For a real dashboard, time range would be controlled by a date picker.
  // We'll just hardcode a default 1-hour window for this demo.
  const now = Math.floor(Date.now() / 1000);
  const startTime = (now - 3600).toString(); // 1 hour ago
  const endTime = now.toString();
  const step = 60; // 1 minute resolution

  // Fetch some metrics for OTel Collector health (Prometheus self-metrics exposed via VictoriaMetrics)
  const httpReqsQuery = useMetrics({
    query: 'rate(prometheus_http_requests_total[5m])',
    startTime,
    endTime,
    step,
  });

  const goRoutinesQuery = useMetrics({
    query: 'go_goroutines',
    startTime,
    endTime,
    step,
  });

  const handleDataPointClick = (timestamp: string, labels: Record<string, string>, metricName: string) => {
    // If a user clicks a data point on a metric, drill down to traces
    // Example: pass service name or other labels into the trace filter
    const searchParams = new URLSearchParams();
    
    // Attempt to map labels to trace filters
    if (labels['job']) {
      searchParams.set('serviceName', labels['job']);
    }
    
    // We could set startTime / endTime to window around the clicked point
    // but for now just navigate to traces view with service filtered
    navigate(`/traces?${searchParams.toString()}`);
  };

  return (
    <div style={{ padding: 'var(--spacing-lg)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--spacing-lg)' }}>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 600 }}>System Dashboard</h1>
        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-tertiary)' }}>
          Last 1 hour
        </div>
      </div>

      <DashboardGrid>
        <div key="http-reqs">
          <MetricWidget
            title="HTTP Requests Rate"
            data={httpReqsQuery.data?.metrics || []}
            onDataPointClick={handleDataPointClick}
          />
        </div>
        <div key="goroutines">
          <MetricWidget
            title="Go Routines"
            data={goRoutinesQuery.data?.metrics || []}
            onDataPointClick={handleDataPointClick}
          />
        </div>
      </DashboardGrid>
    </div>
  );
};
