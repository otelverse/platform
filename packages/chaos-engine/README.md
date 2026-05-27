# OTelVerse Chaos Engine

An OpenTelemetry-native chaos engineering framework that injects faults directly into your distributed tracing pipeline.

## Overview
Unlike traditional chaos engineering tools that require sidecars with complex network routing or eBPF, OTelVerse Chaos Engine operates natively on the OTLP protocol. It acts as an OTLP proxy between your instrumented applications and the OpenTelemetry Collector.

### Features
- **Latency Injection**: Modifies `span.endTime` and calculates precise delays without actually pausing your application threads (logical latency).
- **Error Injection**: Forces span status codes to `Error` and injects `http.status_code=500` to simulate backend failures downstream.
- **Blast Radius Analysis**: Automatically tracks affected spans using `chaos.experiment_id` and visualizes the exact impact area in the Unified Platform UI using ClickHouse analytics.

## Architecture
- **Control Plane**: Managed by the Unified Platform (GraphQL).
- **Chaos Agent**: A lightweight Go proxy `packages/chaos-engine/agent` that polls the Platform for active experiments and mutates OTLP payloads in real-time before forwarding them to the upstream collector.

## Deployment
See `packages/integration-kits/compose/otelverse-kit/docker-compose.chaos.yml` for an example of deploying the Chaos Agent.
