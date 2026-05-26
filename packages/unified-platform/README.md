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

## Components

- **Go Backend** (`main.go`): HTTP server with `/healthz` and `/graphql` endpoints
- **OTLP Receiver** (`otlp_receiver.go`): gRPC server implementing TraceService and LogsService
- **ClickHouse Migration** (`migration.go`): Embedded SQL migration runner
- **GraphQL Resolver** (`graphql.go`): Query resolver backed by ClickHouse
- **Frontend** (`web/`): React SPA with trace list and detail pages
- **API Hooks** (`libs/api-hooks/`): TanStack Query hooks for GraphQL

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
├── web/                      # React frontend
├── BUILD.bazel               # Bazel build
├── main.go                   # Entry point
├── migration.go              # Migration runner
├── otlp_receiver.go          # OTLP gRPC server
├── graphql.go                # GraphQL resolver
├── go.mod
└── go.sum
```
