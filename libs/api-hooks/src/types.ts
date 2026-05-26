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
