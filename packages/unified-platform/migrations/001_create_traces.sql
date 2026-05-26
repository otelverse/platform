CREATE TABLE IF NOT EXISTS otel_traces (
  TraceId String,
  SpanId String,
  ParentSpanId String,
  OperationName String,
  ServiceName String,
  StartTime DateTime64(9),
  Duration UInt64,
  StatusCode Int32,
  StatusMessage String,
  Attributes Map(String, String),
  Events Nested(
    Name String,
    Timestamp DateTime64(9),
    Attributes Map(String, String)
  ),
  Links Nested(
    LinkedTraceId String,
    LinkedSpanId String,
    Attributes Map(String, String)
  ),
  ResourceAttributes Map(String, String),
  INDEX idx_service_name ServiceName TYPE bloom_filter GRANULARITY 1,
  INDEX idx_operation_name OperationName TYPE bloom_filter GRANULARITY 1
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(StartTime)
ORDER BY (ServiceName, OperationName, StartTime, TraceId)
SETTINGS index_granularity = 8192;
