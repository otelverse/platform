#!/bin/bash
set -e

ENDPOINT="${OTLP_ENDPOINT:-localhost:4317}"
DURATION="${DURATION:-30s}"
RATE="${RATE:-5}"
SERVICE="${SERVICE:-test-service}"

echo "Generating $SERVICE traces to $ENDPOINT at $RATE/sec for $DURATION..."

docker run --rm \
  ghcr.io/open-telemetry/opentelemetry-collector-contrib/telemetrygen:v0.95.0 \
  traces \
  --otlp-endpoint="$ENDPOINT" \
  --rate="$RATE" \
  --duration="$DURATION" \
  --service-name="$SERVICE"

echo "Traces generated successfully."
