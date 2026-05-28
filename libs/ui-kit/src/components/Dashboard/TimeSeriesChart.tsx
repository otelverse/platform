import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { styled } from '../../theme';

export interface TimeSeriesPoint {
  timestamp: string;
  value: number;
}

export interface MetricData {
  metricName: string;
  labels: Record<string, string>;
  values: TimeSeriesPoint[];
}

export interface TimeSeriesChartProps {
  data: MetricData[];
  onDataPointClick?: (timestamp: string, labels: Record<string, string>, metricName: string) => void;
  colors?: string[];
}

const ChartContainer = styled.div`
  width: 100%;
  height: 100%;
  min-height: 200px;
  background-color: var(--surface-primary);
  font-family: var(--font-sans);
`;

const DEFAULT_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({
  data,
  onDataPointClick,
  colors = DEFAULT_COLORS,
}) => {
  if (!data || data.length === 0) {
    return (
      <ChartContainer style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: 'var(--text-tertiary)' }}>No data available</span>
      </ChartContainer>
    );
  }

  // Transform data for recharts: we need a single array of objects where each object represents a timestamp
  // { timestamp: '12:00', 'metric1': 100, 'metric2': 200 }
  
  // Find all unique timestamps
  const timestampSet = new Set<string>();
  data.forEach((series) => {
    series.values.forEach((point) => {
      timestampSet.add(point.timestamp);
    });
  });

  const sortedTimestamps = Array.from(timestampSet).sort();

  const chartData = sortedTimestamps.map((ts) => {
    const dataPoint: any = { timestamp: ts };
    // Format timestamp for X axis display
    const date = new Date(ts);
    // if timestamp string is unix (e.g. from promql, parse it)
    let displayTs = ts;
    if (!isNaN(Number(ts))) {
      // unix seconds
      const d = new Date(Number(ts) * 1000);
      displayTs = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
      dataPoint.timestampValue = d.toISOString();
    } else {
      displayTs = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
      dataPoint.timestampValue = ts;
    }
    dataPoint.displayTs = displayTs;

    data.forEach((series, idx) => {
      const match = series.values.find((p) => p.timestamp === ts);
      if (match) {
        dataPoint[`series_${idx}`] = match.value;
      }
    });

    return dataPoint;
  });

  const getSeriesName = (series: MetricData) => {
    if (Object.keys(series.labels).length > 0) {
      return Object.entries(series.labels)
        .map(([k, v]) => `${k}="${v}"`)
        .join(', ');
    }
    return series.metricName;
  };

  const handleClick = (pointData: any) => {
    if (!onDataPointClick || !pointData || !pointData.activePayload) return;
    
    // First active payload item
    const payload = pointData.activePayload[0];
    if (payload) {
      const seriesIdxMatch = payload.dataKey.match(/series_(\d+)/);
      if (seriesIdxMatch) {
        const idx = parseInt(seriesIdxMatch[1]);
        const series = data[idx];
        const timestamp = pointData.activePayload[0].payload.timestampValue;
        onDataPointClick(timestamp, series.labels, series.metricName);
      }
    }
  };

  return (
    <ChartContainer>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} onClick={handleClick}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
          <XAxis 
            dataKey="displayTs" 
            stroke="var(--text-tertiary)"
            fontSize={12}
            tickMargin={10}
          />
          <YAxis 
            stroke="var(--text-tertiary)"
            fontSize={12}
            tickFormatter={(val) => {
              if (val >= 1000000) return `${(val / 1000000).toFixed(1)}m`;
              if (val >= 1000) return `${(val / 1000).toFixed(1)}k`;
              return val;
            }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'var(--surface-secondary)', 
              borderColor: 'var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '12px'
            }}
            labelStyle={{ color: 'var(--text-primary)' }}
            formatter={(value: number, name: string, props: any) => {
              const seriesIdxMatch = props.dataKey.match(/series_(\d+)/);
              if (seriesIdxMatch) {
                const idx = parseInt(seriesIdxMatch[1]);
                return [value, getSeriesName(data[idx])];
              }
              return [value, name];
            }}
          />
          {data.map((series, idx) => (
            <Line
              key={idx}
              type="monotone"
              dataKey={`series_${idx}`}
              stroke={colors[idx % colors.length]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, cursor: onDataPointClick ? 'pointer' : 'default' }}
              name={getSeriesName(series)}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};
