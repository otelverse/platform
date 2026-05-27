import React, { useState, useMemo } from 'react';
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { Input } from '../Input';
import { styled } from '../../theme';

export interface LogEntry {
  timestamp: string;
  severity: string;
  body: string;
  traceId?: string | null;
  attributes?: Array<{ key: string; value: string }>;
}

export interface LogViewerProps {
  logs: LogEntry[];
  onViewTrace?: (traceId: string) => void;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background-color: var(--surface-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  overflow: hidden;
`;

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
  background-color: var(--surface-secondary);
`;

const LogListContainer = styled.div`
  flex: 1;
  width: 100%;
  position: relative;
`;

const LogRow = styled.div<{ $index: number }>`
  display: flex;
  align-items: flex-start;
  padding: var(--spacing-xs) var(--spacing-md);
  background-color: ${({ $index }) => ($index % 2 === 0 ? 'var(--surface-primary)' : 'var(--surface-secondary)')};
  border-bottom: 1px solid var(--border-color);
  font-family: var(--font-mono, monospace);
  font-size: var(--font-size-sm);
  gap: var(--spacing-md);

  &:hover {
    background-color: var(--surface-hover);
  }
`;

const Timestamp = styled.span`
  color: var(--text-tertiary);
  white-space: nowrap;
  min-width: 200px;
`;

const Body = styled.div`
  flex: 1;
  color: var(--text-primary);
  word-break: break-all;
  white-space: pre-wrap;
`;

const ActionColumn = styled.div`
  min-width: 100px;
  display: flex;
  justify-content: flex-end;
`;

const getSeverityColor = (severity: string) => {
  const s = severity.toUpperCase();
  if (s.includes('ERR') || s.includes('FATAL')) return 'error';
  if (s.includes('WARN')) return 'warning';
  if (s.includes('INFO')) return 'info';
  return 'default';
};

export const LogViewer: React.FC<LogViewerProps> = ({ logs, onViewTrace }) => {
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (search && !log.body.toLowerCase().includes(search.toLowerCase())) return false;
      if (severityFilter && !log.severity.toUpperCase().includes(severityFilter.toUpperCase())) return false;
      return true;
    });
  }, [logs, search, severityFilter]);

  const Row = ({ index, style }: ListChildComponentProps) => {
    const log = filteredLogs[index];
    return (
      <LogRow style={style} $index={index}>
        <Timestamp>{new Date(log.timestamp).toLocaleString()}</Timestamp>
        <div style={{ minWidth: 80 }}>
          <Badge variant={getSeverityColor(log.severity)}>{log.severity}</Badge>
        </div>
        <Body>{log.body}</Body>
        <ActionColumn>
          {log.traceId && (
            <Button size="sm" variant="secondary" onClick={() => onViewTrace?.(log.traceId!)}>
              View Trace
            </Button>
          )}
        </ActionColumn>
      </LogRow>
    );
  };

  return (
    <Container>
      <Toolbar>
        <Input
          placeholder="Search logs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 300 }}
        />
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          style={{
            padding: 'var(--spacing-xs) var(--spacing-sm)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-color)',
            backgroundColor: 'var(--surface-primary)',
            color: 'var(--text-primary)',
          }}
        >
          <option value="">All Severities</option>
          <option value="INFO">Info</option>
          <option value="WARN">Warning</option>
          <option value="ERROR">Error</option>
        </select>
        <div style={{ marginLeft: 'auto', fontSize: 'var(--font-size-sm)', color: 'var(--text-tertiary)' }}>
          {filteredLogs.length} logs
        </div>
      </Toolbar>
      <LogListContainer>
        {filteredLogs.length > 0 ? (
          <List
            height={600} // TODO: make this responsive with AutoSizer if needed, using fixed for now
            itemCount={filteredLogs.length}
            itemSize={60} // estimated row height
            width="100%"
          >
            {Row}
          </List>
        ) : (
          <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center', color: 'var(--text-tertiary)' }}>
            No logs match the current filters.
          </div>
        )}
      </LogListContainer>
    </Container>
  );
};
