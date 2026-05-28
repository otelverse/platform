<div align="center">
  <img src="./assets/logo.png" alt="OTelVerse Logo" width="200" />
  <h1>OTelVerse Platform</h1>
  <p><em>The ultimate unified observability experience built purely on OpenTelemetry.</em></p>

  [![Build Status](https://github.com/otelverse/platform/actions/workflows/ci.yml/badge.svg)](https://github.com/otelverse/platform/actions)
  [![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
  [![Documentation](https://img.shields.io/badge/docs-docusaurus-blue)](https://docs.otelverse.io)
  [![Discord](https://img.shields.io/discord/1234567890?color=7289da&label=Discord&logo=discord&logoColor=white)](https://discord.gg/otelverse)
</div>

Welcome to the **OTelVerse Platform** monorepo! This repository contains the backend and frontend components that make up the unified platform for managing, visualizing, and optimizing your OpenTelemetry data.

## Getting Started

1. Install [Bazelisk](https://github.com/bazelbuild/bazelisk) (manages Bazel version automatically)
2. Clone the repo: `git clone https://github.com/otelverse/platform.git`
3. Run all tests: `bazel test //...`

### Running the Full Stack
You can start the full environment using the Docker Compose kit:
```bash
cd packages/integration-kits/compose/otelverse-kit
make up-all
```

### Authentication
By default, the Platform runs without authentication (suitable for local Dev Desktop usage). For production deployments, we support protecting the Platform and APIs behind an OAuth2 reverse proxy.

To enable authentication:
1. Configure your OAuth provider credentials (e.g. GitHub) in `.env` based on the `.env.example` file.
2. Generate a secure `OAUTH2_PROXY_COOKIE_SECRET`.
3. Start the stack with the auth override:
```bash
docker compose -f docker-compose.yml -f docker-compose.auth.yml up -d
```
All traffic will now be routed through the OAuth2 proxy on port `4180`.

## Unified Query Language (UQL)

UQL is our custom query language designed specifically for OpenTelemetry data. It supports advanced filtering, cross-signal joins, and aggregations.

### Examples

**Search traces:**
`traces | where service.name = "api-gateway" | limit 10`

**Aggregation:**
`traces | by service.name | avg(duration)`

**Cross-signal joins:**
`traces | join logs on traceId`

You can use the **Visual Query Builder** in the web interface to construct these queries dynamically!

## Packages

- `libs/ui-kit` — Shared React component library with design tokens
- `libs/api-hooks` — GraphQL hooks for platform APIs
- `packages/frontend-wrapper/core` — `@otelverse/web`: browser auto-instrumentation (OTLP export, Web Vitals, error tracking)
- `packages/frontend-wrapper/react` — `@otelverse/react`: React hooks (`OtelProvider`, `useSpan`, `useSession`)
- `packages/unified-platform` — Go ingestion service (OTLP receiver, GraphQL API, UQL query engine)
- `packages/pipeline-builder` — React Flow-based pipeline editor for telemetry processing
- `packages/session-replay` — Session replay recording and playback
- `packages/edge-agent` — Lightweight telemetry collection agent
- `packages/robotics-sdk` — Observability SDK for ROS 2 and Gazebo with Digital Twin correlation
- `packages/chaos-engine` — Chaos engineering experimentation platform
- `packages/dev-desktop` — Desktop development environment
- `packages/integration-kits` — Third-party integrations
- `packages/pipeline-optimizer` — Pipeline performance optimization

See [docs](./docs) for detailed guides.
