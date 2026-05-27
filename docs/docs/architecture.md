---
id: architecture
title: Core Architecture
sidebar_position: 2
---

# OTelVerse Architecture

OTelVerse operates on a microservice architecture built strictly around native OpenTelemetry (`OTLP`) and powerful OLAP databases like ClickHouse.

## Components

- **Unified Platform**: A Go-based GraphQL backend and React dashboard. It serves as the control plane for traces, logs, chaos experiments, and pipeline configurations.
- **Chaos Engine**: A lightweight Go proxy speaking `OTLP`. It sits between your instrumented apps and the Collector, injecting `latencyMs` and `statusCode` alterations dynamically based on GraphQL state.
- **Optimizer Engine**: Runs heuristics over ClickHouse span data to intelligently calculate probabilistic sampling ratios and detect PII.
- **Pipeline Builder**: A visual canvas (`ReactFlow`) that transpiles visual nodes down to standard OpenTelemetry Collector YAML configurations.

## Flow
1. **Instrumented App** -> **Chaos Agent** (applies faults)
2. **Chaos Agent** -> **OTel Collector** (processes, batches)
3. **OTel Collector** -> **ClickHouse** (stores)
4. **Unified Platform** queries **ClickHouse** and serves to the **Web Dashboard**.
