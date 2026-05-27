import { useState, useMemo, useCallback, memo } from 'react'
import { List } from 'react-window'
import type { ReactNode } from 'react'

export interface SpanData {
  spanId: string
  parentSpanId?: string | null
  operationName: string
  serviceName: string
  startTime: string
  duration: number
  statusCode: number
  attributes?: { key: string; value: string }[]
  events?: { name: string; timestamp: string; attributes?: { key: string; value: string }[] }[]
  links?: { traceId: string; spanId: string }[]
}

interface SpanNode {
  span: SpanData
  children: SpanNode[]
  depth: number
}

interface FlatRow {
  node: SpanNode
  depth: number
  hasChildren: boolean
}

interface TraceWaterfallProps {
  spans: SpanData[]
  className?: string
}

interface RowData {
  rows: FlatRow[]
  expanded: Set<string>
  selectedId: string | null
  traceDuration: number
  traceStart: number
  onToggleExpand: (spanId: string) => void
  onSelect: (spanId: string | null) => void
}

function buildTree(spans: SpanData[]): SpanNode[] {
  const map = new Map<string, SpanNode>()
  const roots: SpanNode[] = []

  for (const span of spans) {
    map.set(span.spanId, { span, children: [], depth: 0 })
  }

  for (const node of map.values()) {
    const parentId = node.span.parentSpanId
    if (parentId && map.has(parentId)) {
      map.get(parentId)!.children.push(node)
    } else {
      roots.push(node)
    }
  }

  const assignDepth = (nodes: SpanNode[], depth: number) => {
    for (const node of nodes) {
      node.depth = depth
      assignDepth(node.children, depth + 1)
    }
  }
  assignDepth(roots, 0)

  return roots
}

function flattenTree(
  nodes: SpanNode[],
  expanded: Set<string>,
  rows: FlatRow[] = [],
): FlatRow[] {
  for (const node of nodes) {
    const hasChildren = node.children.length > 0
    rows.push({ node, depth: node.depth, hasChildren })
    if (hasChildren && expanded.has(node.span.spanId)) {
      flattenTree(node.children, expanded, rows)
    }
  }
  return rows
}

function getStatusColor(code: number): string {
  switch (code) {
    case 0:
      return 'bg-success-base'
    case 1:
      return 'bg-error-base'
    case 2:
      return 'bg-warning-base'
    default:
      return 'bg-gray-400'
  }
}

function getStatusLabel(code: number): string {
  switch (code) {
    case 0:
      return 'OK'
    case 1:
      return 'ERROR'
    case 2:
      return 'UNSET'
    default:
      return 'UNKNOWN'
  }
}

const ROW_HEIGHT = 36

function nsToMs(ns: number): string {
  return `${(ns / 1_000_000).toFixed(2)}ms`
}

const SpanRow = memo(function SpanRow({
  index,
  style,
  rows,
  expanded,
  selectedId,
  traceDuration,
  traceStart,
  onToggleExpand,
  onSelect,
}: {
  index: number
  style: React.CSSProperties
} & RowData) {
  const { node, depth, hasChildren } = rows[index]
  const { span } = node
  const isExpanded = expanded.has(span.spanId)
  const isSelected = span.spanId === selectedId
  const offset = ((new Date(span.startTime).getTime() - traceStart) / (traceDuration / 1_000_000)) * 100
  const left = (span.duration / traceDuration) * 100

  return (
    <div
      style={style}
      className={`flex items-center border-b border-border-muted px-2 text-xs cursor-pointer select-none ${
        isSelected ? 'bg-primary-base/10' : 'hover:bg-bg-elevated'
      }`}
      onClick={() => onSelect(span.spanId)}
    >
      <div className="flex items-center shrink-0" style={{ width: `${depth * 16 + 20}px` }}>
        {hasChildren ? (
          <button
            className="flex items-center justify-center w-4 h-4 mr-1 text-text-muted hover:text-text-primary"
            onClick={(e) => {
              e.stopPropagation()
              onToggleExpand(span.spanId)
            }}
          >
            <svg
              className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        ) : (
          <span className="w-4 mr-1" />
        )}
      </div>

      <span className="font-medium text-text-primary truncate min-w-[100px] max-w-[150px] mr-2">
        {span.serviceName}
      </span>

      <span className="text-text-secondary truncate min-w-[120px] max-w-[200px] mr-2">
        {span.operationName}
      </span>

      <div className="relative flex-1 h-4 mr-2 min-w-[80px]">
        <div className="absolute inset-y-0 left-0 w-full rounded bg-bg-elevated" />
        <div
          className={`absolute inset-y-0 left-0 rounded ${getStatusColor(span.statusCode)}`}
          style={{
            left: `${Math.max(0, offset)}%`,
            width: `${Math.max(2, left)}%`,
          }}
        />
      </div>

      <span className="text-text-muted w-16 text-right shrink-0 mr-2">
        {nsToMs(span.duration)}
      </span>

      <span className="shrink-0">
        <span
          className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
            span.statusCode === 0
              ? 'bg-success-bg text-success-base'
              : span.statusCode === 1
                ? 'bg-error-bg text-error-base'
                : 'bg-warning-bg text-warning-base'
          }`}
        >
          {getStatusLabel(span.statusCode)}
        </span>
      </span>
    </div>
  )
})

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h4 className="mb-1 text-xs font-semibold text-text-secondary uppercase tracking-wider">{title}</h4>
      <div className="space-y-0.5">{children}</div>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-text-muted shrink-0">{label}</span>
      <span className="text-text-primary text-right break-all">{value}</span>
    </div>
  )
}

export function TraceWaterfall({ spans, className = '' }: TraceWaterfallProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const tree = useMemo(() => buildTree(spans), [spans])

  const rows = useMemo(
    () => flattenTree(tree, expanded),
    [tree, expanded],
  )

  const toggleExpand = useCallback((spanId: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(spanId)) {
        next.delete(spanId)
      } else {
        next.add(spanId)
      }
      return next
    })
  }, [])

  const traceStart = useMemo(() => {
    if (spans.length === 0) return 0
    let min = Infinity
    for (const s of spans) {
      const t = new Date(s.startTime).getTime()
      if (t < min) min = t
    }
    return min
  }, [spans])

  const traceDuration = useMemo(() => {
    if (spans.length === 0) return 1
    let max = 0
    for (const s of spans) {
      if (s.duration > max) max = s.duration
    }
    return max || 1
  }, [spans])

  const selectedSpan = useMemo(
    () => spans.find((s) => s.spanId === selectedId) ?? null,
    [spans, selectedId],
  )

  const rowData: RowData = useMemo(
    () => ({
      rows,
      expanded,
      selectedId,
      traceDuration,
      traceStart,
      onToggleExpand: toggleExpand,
      onSelect: setSelectedId,
    }),
    [rows, expanded, selectedId, traceDuration, traceStart, toggleExpand],
  )

  return (
    <div className={`flex flex-col rounded border border-border-default bg-bg-default ${className}`}>
      <div className="flex items-center border-b border-border-default bg-bg-elevated px-2 py-1.5 text-xs font-medium text-text-secondary">
        <span className="shrink-0" style={{ width: '20px' }} />
        <span className="min-w-[100px] max-w-[150px] mr-2">Service</span>
        <span className="min-w-[120px] max-w-[200px] mr-2">Operation</span>
        <span className="flex-1 mr-2 min-w-[80px]">Duration</span>
        <span className="w-16 text-right mr-2">Time</span>
        <span className="shrink-0 w-12">Status</span>
      </div>

      <div className="flex flex-1" style={{ minHeight: '200px' }}>
        {rows.length === 0 ? (
          <div className="flex items-center justify-center w-full text-sm text-text-muted p-8">
            No spans to display
          </div>
        ) : (
          <div className="flex-1">
            <List
              rowCount={rows.length}
              rowHeight={ROW_HEIGHT}
              rowComponent={SpanRow}
              rowProps={rowData}
              style={{ maxHeight: 400 }}
            />
          </div>
        )}

        {selectedSpan && (
          <div className="w-80 border-l border-border-default overflow-y-auto p-3 bg-bg-elevated shrink-0">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-text-primary">Span Details</h3>
              <button
                className="text-text-muted hover:text-text-primary"
                onClick={() => setSelectedId(null)}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <Section title="Overview">
                <DetailRow label="Span ID" value={selectedSpan.spanId} />
                <DetailRow label="Parent Span ID" value={selectedSpan.parentSpanId ?? '(root)'} />
                <DetailRow label="Operation" value={selectedSpan.operationName} />
                <DetailRow label="Service" value={selectedSpan.serviceName} />
                <DetailRow label="Start Time" value={new Date(selectedSpan.startTime).toISOString()} />
                <DetailRow label="Duration" value={nsToMs(selectedSpan.duration)} />
                <DetailRow label="Status" value={getStatusLabel(selectedSpan.statusCode)} />
              </Section>

              {selectedSpan.attributes && selectedSpan.attributes.length > 0 && (
                <Section title={`Attributes (${selectedSpan.attributes.length})`}>
                  {selectedSpan.attributes.map((attr, i) => (
                    <DetailRow key={i} label={attr.key} value={attr.value} />
                  ))}
                </Section>
              )}

              {selectedSpan.events && selectedSpan.events.length > 0 && (
                <Section title={`Events (${selectedSpan.events.length})`}>
                  {selectedSpan.events.map((evt, i) => (
                    <div key={i} className="mb-2">
                      <div className="font-medium text-text-primary">{evt.name}</div>
                      <div className="text-text-muted">{new Date(evt.timestamp).toISOString()}</div>
                      {evt.attributes && evt.attributes.length > 0 && (
                        <div className="ml-2 mt-1">
                          {evt.attributes.map((a, j) => (
                            <DetailRow key={j} label={a.key} value={a.value} />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </Section>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
