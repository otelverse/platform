---
id: getting-started
title: Getting Started
sidebar_position: 1
---

# Getting Started with OTelVerse

OTelVerse provides an instant, production-grade OpenTelemetry environment out-of-the-box.

## Using the Docker Compose Integration Kit

The easiest way to get started is using our pre-built Docker Compose kit which spins up:
- ClickHouse (Traces and Logs)
- OpenTelemetry Collector
- OTelVerse Chaos Agent
- Unified Platform API & Web Dashboard
- Demo Application

### Steps

1. Clone the repository.
   ```bash
   git clone https://github.com/otelverse/platform.git
   cd platform/packages/integration-kits/compose/otelverse-kit
   ```
2. Start the environment.
   ```bash
   docker-compose -f docker-compose.chaos.yml up -d
   ```
3. Open your browser and navigate to `http://localhost:3000`.

You are now in the Unified Platform! Generate some traffic to the demo app at `http://localhost:8081` and watch the traces populate instantly.
