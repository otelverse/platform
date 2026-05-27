export interface Trace {
  traceId: string
  spans: Span[]
}

export interface Span {
  spanId: string
  parentSpanId?: string
  operationName: string
  serviceName: string
  startTime: string
  duration: number
  statusCode: number
  attributes: Attribute[]
  events: Event[]
}

export interface Log {
  timestamp: string
  severity: string
  body: string
  attributes: Attribute[]
}

export interface Attribute {
  key: string
  value: string
}

export interface Event {
  name: string
  timestamp: string
  attributes: Attribute[]
}

export interface TraceFilters {
  serviceName?: string
  operationName?: string
  startTime: string
  endTime: string
  limit?: number
}

export interface LogFilters {
  severity?: string
  message?: string
  startTime: string
  endTime: string
  limit?: number
}

export interface Pipeline {
  id: string
  name: string
  nodes: PipelineNode[]
  edges: PipelineEdge[]
}

export interface PipelineNode {
  id: string
  type: string
  label: string
  properties: Record<string, unknown>
  position: Position
}

export interface Position {
  x: number
  y: number
}

export interface PipelineEdge {
  id: string
  source: string
  target: string
  sourceHandle?: string
  targetHandle?: string
}

export interface PipelineInput {
  name: string
  nodes: PipelineNodeInput[]
  edges: PipelineEdgeInput[]
}

export interface PipelineNodeInput {
  id: string
  type: string
  label: string
  properties: Record<string, unknown>
  position: PositionInput
}

export interface PositionInput {
  x: number
  y: number
}

export interface PipelineEdgeInput {
  id: string
  source: string
  target: string
  sourceHandle?: string
  targetHandle?: string
}

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

export interface DeployResult {
  containerId: string
  status: string
}
