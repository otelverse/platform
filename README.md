<div align="center">
  <img src="./assets/logo.png" alt="OTelVerse Logo" width="200" />
  <h1>OTelVerse Platform</h1>
  <p><em>The ultimate unified observability experience built purely on OpenTelemetry.</em></p>

  [![Build Status](https://github.com/otelverse/platform/actions/workflows/ci.yml/badge.svg)](https://github.com/otelverse/platform/actions)
  [![Documentation](https://img.shields.io/badge/docs-docusaurus-blue)](https://docs.otelverse.io)
  [![Discord](https://img.shields.io/discord/123456789012345678?label=Discord&logo=discord&color=5865F2)](https://discord.gg/otelverse)
</div>

Welcome to the **OTelVerse Platform** monorepo! This repository contains the backend and frontend components that make up the unified platform for managing, visualizing, and optimizing your OpenTelemetry data.

## Getting Started

1. Install [Bazelisk](https://github.com/bazelbuild/bazelisk) (manages Bazel version automatically)
2. Clone the repo: `git clone https://github.com/otelverse/platform.git`
3. Run all tests: `bazel test //...`

## Packages

- `libs/ui-kit` — Shared React component library with design tokens
- `libs/api-hooks` — GraphQL hooks for platform APIs
- `packages/frontend-wrapper/core` — `@otelverse/web`: browser auto-instrumentation (OTLP export, Web Vitals, error tracking)
- `packages/frontend-wrapper/react` — `@otelverse/react`: React hooks (`OtelProvider`, `useSpan`, `useSession`)
- `packages/unified-platform` — Go ingestion service (OTLP receiver, GraphQL API, UQL query engine)
- `packages/pipeline-builder` — React Flow-based pipeline editor for telemetry processing
- `packages/session-replay` — Session replay recording and playback
- `packages/edge-agent` — Lightweight telemetry collection agent
- `packages/chaos-engine` — Chaos engineering experimentation platform
- `packages/dev-desktop` — Desktop development environment
- `packages/integration-kits` — Third-party integrations
- `packages/pipeline-optimizer` — Pipeline performance optimization

See [docs](./docs) for detailed guides.
