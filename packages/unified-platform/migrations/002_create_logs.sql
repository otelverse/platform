CREATE TABLE IF NOT EXISTS otel_logs (
  Timestamp DateTime64(9),
  TraceId String,
  SpanId String,
  SeverityText String,
  SeverityNumber Int32,
  Body String,
  ServiceName String,
  Attributes Map(String, String),
  ResourceAttributes Map(String, String),
  INDEX idx_severity SeverityText TYPE bloom_filter GRANULARITY 1,
  INDEX idx_service_name ServiceName TYPE bloom_filter GRANULARITY 1
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(Timestamp)
ORDER BY (ServiceName, Timestamp, TraceId)
SETTINGS index_granularity = 8192;
