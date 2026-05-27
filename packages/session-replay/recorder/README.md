# @otelverse/session-replay-recorder

A lightweight, privacy-focused browser session recorder for OTelVerse, powered by `rrweb`.

## Features
- Records DOM snapshots, mouse movements, and inputs.
- Automatically redacts PII and sensitive text (`maskText: true` by default).
- Ties sessions to OpenTelemetry traces via `@otelverse/web`.
- Buffers events and uploads them to the OTelVerse Session Replay Service.

## Usage
```typescript
import { startReplay } from '@otelverse/session-replay-recorder';

const recorder = startReplay({
  uploadUrl: 'http://localhost:8082/api/v1/replay/upload',
  flushIntervalMs: 5000,
});
```
