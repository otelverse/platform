#!/bin/bash

# Wait for collector to be ready
sleep 15

echo "Mock Robot running... Sending simulated traces to OTLP collector at http://otel-collector:4318/v1/traces"

# Infinite loop sending a trace every 5 seconds
while true; do
  # Generate a random 16-byte hex for traceId and 8-byte for spanId
  TRACE_ID=$(cat /dev/urandom | tr -dc 'a-f0-9' | fold -w 32 | head -n 1)
  SPAN_ID=$(cat /dev/urandom | tr -dc 'a-f0-9' | fold -w 16 | head -n 1)
  START_TIME=$(date +%s%N)
  END_TIME=$(($START_TIME + 15000000))

  JSON_PAYLOAD=$(cat <<EOF
{
  "resourceSpans": [
    {
      "resource": {
        "attributes": [
          { "key": "service.name", "value": { "stringValue": "gazebo" } }
        ]
      },
      "scopeSpans": [
        {
          "scope": { "name": "otelverse.robotics" },
          "spans": [
            {
              "traceId": "${TRACE_ID}",
              "spanId": "${SPAN_ID}",
              "name": "gazebo.physics.step",
              "kind": 2,
              "startTimeUnixNano": "${START_TIME}",
              "endTimeUnixNano": "${END_TIME}",
              "status": {}
            }
          ]
        }
      ]
    }
  ]
}
EOF
)

  curl -s -X POST http://otel-collector:4318/v1/traces \
    -H "Content-Type: application/json" \
    -d "$JSON_PAYLOAD" > /dev/null || echo "Failed to send trace"

  sleep 5
done
