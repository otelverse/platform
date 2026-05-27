# OTelVerse Docker Compose Integration Kit

The OTelVerse Docker Compose kit provides a one-command local demo environment to showcase instant-on observability.

## Architecture

```
┌──────────────┐     HTTP Fetch    ┌──────────────┐
│  React App   │ ────────────────> │ Express App  │
│  (Frontend)  │                   │  (Backend)   │
└──────┬───────┘                   └──────┬───────┘
       │                                  │
       │ OTLP (HTTP)                      │ OTLP (gRPC)
       ▼                                  ▼
┌─────────────────────────────────────────────────┐
│              OpenTelemetry Collector            │
└──────┬──────────────────────────────────┬───────┘
       │ OTLP                             │ PrometheusRW
       ▼                                  ▼
┌──────────────┐                   ┌──────────────┐
│  ClickHouse  │                   │ VictoriaMet. │
│ (Traces/Logs)│                   │  (Metrics)   │
└──────┬───────┘                   └──────┬───────┘
       │                                  │
       │            ┌──────────────┐      │
       └──────────> │   Platform   │ <────┘
                    │   Backend &  │
                    │   Frontend   │
                    └──────────────┘
```

## Quick Start

1. **Start the environment:**
   ```bash
   make up
   ```

2. **Generate Traffic:**
   Navigate to the React application in your browser at `http://localhost:5173`.
   Click the buttons to generate traces via fetch requests to the Express backend.

3. **View Traces:**
   Open the Platform UI at `http://localhost:8080`.
   Navigate to the Pipeline Builder and try out the **Optimizer** tab to analyze the traffic you just generated!

## Cleanup

```bash
make down
```
