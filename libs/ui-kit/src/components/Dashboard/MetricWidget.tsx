import React from 'react';
import { styled } from '../../theme';
import { TimeSeriesChart, MetricData } from './TimeSeriesChart';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

export interface MetricWidgetProps {
  title: string;
  data: MetricData[];
  onDataPointClick?: (timestamp: string, labels: Record<string, string>, metricName: string) => void;
}

const WidgetContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background-color: var(--surface-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
`;

const WidgetHeader = styled.div`
  display: flex;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
  background-color: var(--surface-secondary);
  font-weight: 500;
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  cursor: grab;
  
  &:active {
    cursor: grabbing;
  }
`;

const WidgetBody = styled.div`
  flex: 1;
  padding: var(--spacing-sm);
  min-height: 0;
`;

export const MetricWidget: React.FC<MetricWidgetProps> = ({ title, data, onDataPointClick }) => {
  return (
    <WidgetContainer>
      <WidgetHeader className="widget-drag-handle">
        {title}
      </WidgetHeader>
      <WidgetBody>
        <TimeSeriesChart data={data} onDataPointClick={onDataPointClick} />
      </WidgetBody>
    </WidgetContainer>
  );
};
