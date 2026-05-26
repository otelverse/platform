CREATE TABLE IF NOT EXISTS otel_traces (
    TraceId VARCHAR,
    SpanId VARCHAR,
    ParentSpanId VARCHAR,
    OperationName VARCHAR,
    ServiceName VARCHAR,
    StartTime TIMESTAMP,
    Duration BIGINT,
    StatusCode INTEGER,
    StatusMessage VARCHAR,
    Attributes JSON,
    ResourceAttributes JSON
);

CREATE TABLE IF NOT EXISTS otel_logs (
    Timestamp TIMESTAMP,
    TraceId VARCHAR,
    SpanId VARCHAR,
    SeverityText VARCHAR,
    SeverityNumber INTEGER,
    Body VARCHAR,
    ServiceName VARCHAR,
    Attributes JSON,
    ResourceAttributes JSON
);
