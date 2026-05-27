import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Table, Spinner, Badge, Input, Button } from '@otelverse/ui-kit'
import { useTraces, useUQL } from '@otelverse/api-hooks'
import type { Trace } from '@otelverse/api-hooks'

const columns = [
  { key: 'traceId', label: 'Trace ID' },
  { key: 'serviceName', label: 'Service' },
  { key: 'operationName', label: 'Operation' },
  { key: 'startTime', label: 'Start Time' },
  { key: 'duration', label: 'Duration' },
  { key: 'statusCode', label: 'Status' },
]

const logColumns = [
  { key: 'timestamp', label: 'Timestamp' },
  { key: 'severity', label: 'Severity' },
  { key: 'body', label: 'Message' },
]

export default function TraceListPage() {
  const navigate = useNavigate()
  const [uqlInput, setUqlInput] = useState('')
  const [activeUql, setActiveUql] = useState('')

  const now = new Date()
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)

  const defaultQuery = useTraces({
    startTime: oneHourAgo.toISOString(),
    endTime: now.toISOString(),
    limit: 50,
  })

  const uqlQuery = useUQL(activeUql)

  const handleRun = () => {
    setActiveUql(uqlInput.trim())
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRun()
    }
  }

  // UQL mode
  if (activeUql) {
    if (uqlQuery.isLoading) return <Spinner />
    if (uqlQuery.error) return <div className="p-4 text-error-base">UQL error: {(uqlQuery.error as Error).message}</div>

    const result = uqlQuery.data?.uql

    // UQL returned traces
    if (result?.traces) {
      const rows = result.traces.map((trace) => ({
        traceId: trace.traceId.slice(0, 16) + '...',
        serviceName: trace.spans[0]?.serviceName ?? 'unknown',
        operationName: trace.spans[0]?.operationName ?? 'unknown',
        startTime: new Date(trace.spans[0]?.startTime ?? '').toLocaleTimeString(),
        duration: `${(trace.spans[0]?.duration ?? 0) / 1_000_000}ms`,
        statusCode: (
          <Badge variant={trace.spans[0]?.statusCode === 0 ? 'success' : 'error'}>
            {trace.spans[0]?.statusCode === 0 ? 'OK' : 'ERROR'}
          </Badge>
        ),
        _onClick: () => navigate(`/traces/${trace.traceId}`),
      }))

      if (rows.length === 0) {
        return (
          <div className="p-4">
            <UqlBar value={uqlInput} onChange={setUqlInput} onRun={handleRun} onKeyDown={handleKeyDown} />
            <div className="mt-4 text-text-secondary">No results found</div>
          </div>
        )
      }

      return (
        <div className="p-4">
          <UqlBar value={uqlInput} onChange={setUqlInput} onRun={handleRun} onKeyDown={handleKeyDown} />
          <div className="mt-4">
            <Table columns={columns} data={rows} />
          </div>
        </div>
      )
    }

    // UQL returned logs
    if (result?.logs) {
      const rows = result.logs.map((log) => ({
        timestamp: new Date(log.timestamp).toLocaleString(),
        severity: (
          <Badge variant={log.severity === 'error' ? 'error' : log.severity === 'warn' ? 'warning' : 'info'}>
            {log.severity}
          </Badge>
        ),
        body: log.body,
      }))

      if (rows.length === 0) {
        return (
          <div className="p-4">
            <UqlBar value={uqlInput} onChange={setUqlInput} onRun={handleRun} onKeyDown={handleKeyDown} />
            <div className="mt-4 text-text-secondary">No logs found</div>
          </div>
        )
      }

      return (
        <div className="p-4">
          <UqlBar value={uqlInput} onChange={setUqlInput} onRun={handleRun} onKeyDown={handleKeyDown} />
          <div className="mt-4">
            <Table columns={logColumns} data={rows} />
          </div>
        </div>
      )
    }

    return (
      <div className="p-4">
        <UqlBar value={uqlInput} onChange={setUqlInput} onRun={handleRun} onKeyDown={handleKeyDown} />
        <div className="mt-4 text-text-secondary">No results</div>
      </div>
    )
  }

  // Default trace list mode
  if (defaultQuery.isLoading) return <Spinner />
  if (defaultQuery.error) return <div className="p-4 text-error-base">Error loading traces: {defaultQuery.error.message}</div>

  const rows = (defaultQuery.data?.traces ?? []).map((trace: Trace) => ({
    traceId: trace.traceId.slice(0, 16) + '...',
    serviceName: trace.spans[0]?.serviceName ?? 'unknown',
    operationName: trace.spans[0]?.operationName ?? 'unknown',
    startTime: new Date(trace.spans[0]?.startTime ?? '').toLocaleTimeString(),
    duration: `${(trace.spans[0]?.duration ?? 0) / 1_000_000}ms`,
    statusCode: (
      <Badge variant={trace.spans[0]?.statusCode === 0 ? 'success' : 'error'}>
        {trace.spans[0]?.statusCode === 0 ? 'OK' : 'ERROR'}
      </Badge>
    ),
    _onClick: () => navigate(`/traces/${trace.traceId}`),
  }))

  return (
    <div className="p-4">
      <UqlBar value={uqlInput} onChange={setUqlInput} onRun={handleRun} onKeyDown={handleKeyDown} />
      <div className="mt-4">
        {rows.length === 0 ? (
          <div className="text-text-secondary">No traces found</div>
        ) : (
          <Table columns={columns} data={rows} />
        )}
      </div>
    </div>
  )
}

interface UqlBarProps {
  value: string
  onChange: (v: string) => void
  onRun: () => void
  onKeyDown: (e: React.KeyboardEvent) => void
}

function UqlBar({ value, onChange, onRun, onKeyDown }: UqlBarProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1">
        <Input
          placeholder='e.g. traces | where service.name = "api" | limit 10'
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
        />
      </div>
      <Button variant="primary" size="md" onClick={onRun}>
        Run
      </Button>
    </div>
  )
}
