# OTelVerse Session Replay Service

A scalable Go backend service to ingest, store, and serve browser session replays.

## Features
- Ingests `rrweb` events via REST API.
- Stores metadata in PostgreSQL and raw events to Local Disk / MinIO.
- Integrates seamlessly with OTelVerse trace IDs via Unified Platform.

## Environment Variables
- `PORT`: Service port (default: 8082)
- `POSTGRES_DSN`: PostgreSQL connection string
- `DATA_DIR`: Directory to store raw event chunks (default: /tmp/otelverse_replays)
