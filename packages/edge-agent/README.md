# OTel-as-a-Service Edge Agent

A lightweight (<2 MB) Rust-based telemetry agent for edge devices.

## Features
- **Offline Buffering:** Spans and metrics are buffered in a local SQLite database when the network is unavailable.
- **Store-and-Forward:** Automatically batches and forwards telemetry data to the OTelVerse Platform upon connection restoration.
- **OpAMP Polling:** Dynamically fetches configuration from the centralized Control Plane.
- **MQTT Ingestion:** Listens to MQTT brokers for telemetry traces from constrained IoT devices.

## Build and Run

### Edge Agent (Rust)
```bash
cd agent
cargo build --release
./target/release/edge-agent --config config.yaml
```

### Control Plane (Go)
```bash
cd control
bazel run //packages/edge-agent/control
```

## Cross-Compilation
To build for ARM edge devices (e.g., Raspberry Pi), use `cross`:
```bash
cross build --target aarch64-unknown-linux-gnu --release
```
