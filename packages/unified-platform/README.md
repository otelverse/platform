# Unified Platform

The OTelVerse Unified Platform is the central ingestion, storage, and query engine for observability telemetry data (traces, logs, and metrics).

## Architecture

```
┌──────────────┐     OTLP gRPC     ┌──────────────┐
│   OTel SDK   │ ────────────────> │   Platform   │
│   (Apps)     │                   │   (Go)       │
└──────────────┘                   │              │
                                   │  /healthz    │
┌──────────────┐     OTLP gRPC     │  /graphql    │
│  OTel        │ ────────────────> │  :4317 (gRPC)│
│  Collector   │                   └──────┬───────┘
└──────┬───────┘                           │
       │                           ┌───────▼───────┐
       │ PrometheusRW              │   ClickHouse  │
       └─────────────────────────> │               │
                                   └───────────────┘
┌──────────────┐     HTTP          ┌──────────────┐
│   Frontend   │ <── /graphql ───> │   Platform   │
│   (React)    │                   │   (same)     │
└──────────────┘                   └──────────────┘
```

## UQL Quick Reference

UQL (Unified Query Language) is a simple query language for traces and logs.

### Syntax

```
query = "traces" filter* limit? | "logs" filter* limit?
filter = "| where" field operator value
operator = "=" | "!=" | "contains"
limit = "| limit" integer
```

### Examples

```bash
# Get traces from a specific service
traces | where service.name = "api-gateway" | limit 20

# Find traces with errors
traces | where status.code != "0" | limit 10

# Search traces by operation name
traces | where span.name contains "health" | limit 5

# Get error logs
logs | where severity = "error" | limit 50

# Find logs by message content
logs | where message contains "timeout" | limit 10
```

### Supported Fields

| Field | Maps To | Applies To |
|-------|---------|------------|
| `service.name` | `ServiceName` | traces |
| `span.name` | `OperationName` | traces |
| `operation.name` | `OperationName` | traces |
| `trace.id` | `TraceId` | traces |
| `span.id` | `SpanId` | traces |
| `parent.span.id` | `ParentSpanId` | traces |
| `status.code` | `StatusCode` | traces |
| `severity` / `severity.text` | `SeverityText` | logs |
| `message` / `body` | `Body` | logs |

### Use via GraphQL

```graphql
query {
  uql(query: "traces | where service.name = \\"api\\" | limit 5") {
    ... on TraceList {
      traces { traceId spans { spanId operationName serviceName duration statusCode } }
    }
    ... on LogList {
      logs { timestamp severity body }
    }
  }
}
```

## Components

- **Go Backend** (`main.go`): HTTP server with `/healthz` and `/graphql` endpoints
- **OTLP Receiver** (`otlp_receiver.go`): gRPC server implementing TraceService and LogsService
- **ClickHouse Migration** (`migration.go`): Embedded SQL migration runner
- **GraphQL Resolver** (`graphql.go`): Query resolver backed by ClickHouse
- **Frontend** (`web/`): React SPA with trace list, waterfall visualization, and UQL query bar
- **TraceWaterfall** (`libs/ui-kit/`): Interactive span tree with virtualized rendering, expand/collapse, and detail panel
- **UQL Engine** (`uql/`): Unified Query Language parser and ClickHouse SQL translator
- **API Hooks** (`libs/api-hooks/`): TanStack Query hooks for GraphQL including `useUQL`

## Local Development

### Prerequisites

- Go 1.25+
- Node.js 20+
- pnpm
- Docker & docker-compose

### Quick Start

```bash
# 1. Start infrastructure with docker-compose
cd packages/unified-platform/docker
docker-compose up -d clickhouse victoria-metrics

# 2. Run migrations
cd ../..
CLICKHOUSE_DSN="clickhouse://localhost:9000?username=default&password=" \
  go run . --migrate

# 3. Start the platform
PORT=8080 go run .

# 4. Generate test traces
./scripts/generate-traces.sh

# 5. Start the frontend
cd web
pnpm install
pnpm dev
```

### Docker Compose (full stack)

```bash
cd packages/unified-platform/docker
docker-compose up --build
```

This starts: ClickHouse, VictoriaMetrics, OTel Collector, Platform (with migration), telemetrygen (generates test traces).

### Bazel

```bash
# Build the Go binary
bazel build //packages/unified-platform:platform

# Run unit tests
bazel test //packages/unified-platform:platform_test

# Run integration tests (requires Docker)
INTEGRATION=1 bazel test //packages/unified-platform:platform_test
```

### Test Data

```bash
# Generate test traces (requires OTLP endpoint)
OTLP_ENDPOINT=localhost:4317 ./scripts/generate-traces.sh
```

## API

### GraphQL

```graphql
# List traces
query {
  traces(serviceName: "test-service", startTime: "2024-01-01T00:00:00Z", endTime: "2024-12-31T23:59:59Z", limit: 10) {
    traceId
    spans { spanId operationName serviceName duration statusCode }
  }
}

# Get single trace
query {
  trace(id: "abc123") {
    traceId
    spans { spanId parentSpanId operationName serviceName startTime duration }
  }
}

# List logs
query {
  logs(severity: "ERROR", startTime: "2024-01-01T00:00:00Z", endTime: "2024-12-31T23:59:59Z") {
    timestamp severity body attributes { key value }
  }
}
```

### Health Check

```bash
curl http://localhost:8080/healthz
# {"status":"ok"}
```

## Project Structure

```
packages/unified-platform/
├── api/
│   └── schema.graphqls       # GraphQL schema
├── docker/
│   ├── docker-compose.yml    # Full stack
│   ├── Dockerfile            # Go backend
│   └── otel-collector-config.yml
├── migrations/
│   ├── 001_create_traces.sql
│   ├── 002_create_logs.sql
│   └── 003_create_materialized_views.sql
├── scripts/
│   └── generate-traces.sh
├── uql/                      # UQL parser & translator
│   ├── parser.go
│   ├── translator.go
│   ├── parser_test.go
│   └── translator_test.go
├── web/                      # React frontend
├── BUILD.bazel               # Bazel build
├── main.go                   # Entry point
├── migration.go              # Migration runner
├── otlp_receiver.go          # OTLP gRPC server
├── graphql.go                # GraphQL resolver
├── go.mod
├── go.sum
├── uql_integration_test.go   # UQL integration tests
```
