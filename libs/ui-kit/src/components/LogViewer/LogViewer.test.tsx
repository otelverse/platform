import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LogViewer } from './LogViewer';

const mockLogs = [
  {
    timestamp: '2024-05-27T10:00:00Z',
    severity: 'ERROR',
    body: 'Failed to connect to database',
    traceId: 'trace-123',
  },
  {
    timestamp: '2024-05-27T10:01:00Z',
    severity: 'INFO',
    body: 'User logged in',
  },
];

describe('LogViewer', () => {
  it('renders correctly', () => {
    render(<LogViewer logs={mockLogs} />);
    expect(screen.getByText('Failed to connect to database')).toBeInTheDocument();
    expect(screen.getByText('User logged in')).toBeInTheDocument();
  });

  it('filters by search text', () => {
    render(<LogViewer logs={mockLogs} />);
    const searchInput = screen.getByPlaceholderText('Search logs...');
    fireEvent.change(searchInput, { target: { value: 'database' } });
    
    expect(screen.getByText('Failed to connect to database')).toBeInTheDocument();
    expect(screen.queryByText('User logged in')).not.toBeInTheDocument();
  });

  it('filters by severity', () => {
    render(<LogViewer logs={mockLogs} />);
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'ERROR' } });
    
    expect(screen.getByText('Failed to connect to database')).toBeInTheDocument();
    expect(screen.queryByText('User logged in')).not.toBeInTheDocument();
  });

  it('calls onViewTrace when button is clicked', () => {
    const handleViewTrace = jest.fn();
    render(<LogViewer logs={mockLogs} onViewTrace={handleViewTrace} />);
    
    const button = screen.getByText('View Trace');
    fireEvent.click(button);
    
    expect(handleViewTrace).toHaveBeenCalledWith('trace-123');
  });
});
