import React from 'react';
import { render, screen } from '@testing-library/react';
import { TimeSeriesChart } from './TimeSeriesChart';
import { MetricWidget } from './MetricWidget';

// Mock recharts because ResponsiveContainer needs a DOM with width/height which JSDOM lacks
jest.mock('recharts', () => {
  const OriginalModule = jest.requireActual('recharts');
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: any) => (
      <div style={{ width: '800px', height: '600px' }}>{children}</div>
    ),
  };
});

describe('TimeSeriesChart', () => {
  it('renders "No data available" when data is empty', () => {
    render(<TimeSeriesChart data={[]} />);
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('renders the chart when data is provided', () => {
    const mockData = [
      {
        metricName: 'up',
        labels: { job: 'test' },
        values: [
          { timestamp: '1000', value: 1 },
          { timestamp: '2000', value: 0 },
        ],
      },
    ];
    
    // We expect it not to crash and not to show "No data available"
    const { container } = render(<TimeSeriesChart data={mockData} />);
    expect(screen.queryByText('No data available')).not.toBeInTheDocument();
    
    // Verify our recharts mock is working (div should be present)
    expect(container.querySelector('.recharts-wrapper')).toBeInTheDocument();
  });
});

describe('MetricWidget', () => {
  it('renders the title', () => {
    render(<MetricWidget title="Test Widget" data={[]} />);
    expect(screen.getByText('Test Widget')).toBeInTheDocument();
  });
});
