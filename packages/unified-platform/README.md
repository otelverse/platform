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

## Pipeline Builder

The Pipeline Builder is a visual editor for OTel Collector pipelines, accessible at `/pipelines` in the frontend.

### Features

- **Visual Canvas**: Drag-and-drop editor using React Flow with custom nodes for receivers, processors, and exporters
- **Node Palette**: Available node types:
  - `RECEIVER_OTLP` - OTLP gRPC receiver
  - `PROCESSOR_BATCH` - Batch processor
  - `PROCESSOR_MEMORY_LIMITER` - Memory limiting processor
  - `PROCESSOR_TAIL_SAMPLING` - Tail-based sampling processor
  - `EXPORTER_LOGGING` - Logging exporter
  - `EXPORTER_OTLP` - OTLP exporter
- **Properties Panel**: Edit node properties (endpoint, verbosity, etc.)
- **Validation**: Backend validates pipeline structure (receiver/exporter requirements, connection rules, required fields)
- **YAML Export**: Generate valid OTel Collector `config.yaml` for download
- **One-Click Deploy**: Deploy to local Docker as a running collector container

### Pipeline Optimizer

The Pipeline Optimizer is a heuristic engine that analyzes recent telemetry data stored in ClickHouse to generate smart recommendations for your pipeline:
- **Tail Sampling for Errors**: Automatically recommends a `tail_sampling` processor if high error rates are detected to ensure 100% of failed traces are kept while probabilistically downsampling healthy ones.
- **Latency-based Sampling**: Keeps high latency traces for performance optimization when a service exceeds a certain average duration threshold.
- **Low-value Downsampling**: Aggressively downsamples high-volume services that have low errors and low latencies.
- **PII Redaction**: Scans span attributes and generates an attribute hashing processor recommendation if emails, SSNs, or other sensitive patterns are detected.

You can run an analysis from the **Optimize** tab within the Pipeline Builder and apply recommendations with a single click.

### GraphQL API

```graphql
# List all pipelines
query { pipelines { id name nodes { id type label properties position { x y } } edges { id source target } } }

# Get single pipeline
query { pipeline(id: "default") { id name nodes { id type label } } }

# Create pipeline
mutation { pipelineCreate(input: { name: "My Pipeline", nodes: [], edges: [] }) { id name } }

# Validate pipeline
query { pipelineValidate(id: "default") { valid errors } }

# Export as YAML
query { pipelineExportYAML(id: "default") }

# Deploy to Docker
mutation { pipelineDeploy(id: "default") { containerId status } }
```

### Validation Rules

- Pipeline must have at least one receiver and one exporter
- All nodes must be connected by edges (no orphans)
- Receivers cannot have incoming edges
- Exporters cannot have outgoing edges
- OTLP receiver requires `endpoint` property

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
├── pipeline/                  # Pipeline builder logic
│   ├── store.go               # In-memory pipeline store
│   ├── validator.go           # Pipeline validation rules
│   ├── yaml.go                # OTel Collector YAML generation
│   ├── deploy.go              # Docker deployment
│   ├── pipeline_test.go
│   └── yaml_test.go
├── uql/                      # UQL parser & translator
│   ├── parser.go
│   ├── translator.go
│   ├── parser_test.go
│   └── translator_test.go
├── web/                      # React frontend
│   ├── cypress/              # E2E tests
│   └── src/pages/PipelineBuilder/  # Pipeline builder UI
├── BUILD.bazel               # Bazel build
├── main.go                   # Entry point
├── migration.go              # Migration runner
├── otlp_receiver.go          # OTLP gRPC server
├── graphql.go                # GraphQL resolver
├── go.mod
├── go.sum
├── uql_integration_test.go   # UQL integration tests
├── pipeline_integration_test.go  # Pipeline integration tests
└── pipeline_resolver_test.go     # Pipeline resolver tests
```
