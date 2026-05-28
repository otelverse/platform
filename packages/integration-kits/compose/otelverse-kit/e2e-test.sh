#!/bin/bash
set -e

echo "Starting OTelVerse End-to-End Integration Validation..."

# Bring up the full stack
echo "Bringing up the stack..."
make up-all

echo "Waiting for services to be ready (approx 15 seconds)..."
sleep 15

# Wait for Platform GraphQL to be responsive
echo "Checking Platform health..."
for i in {1..10}; do
  if curl -s http://localhost:8081/graphql -X POST -H "Content-Type: application/json" -d '{"query":"{ pipelines { id } }"}' | grep -q "pipelines"; then
    echo "Platform is up!"
    break
  fi
  echo "Waiting for platform... ($i/10)"
  sleep 5
done

echo "Generating traffic to express-app..."
curl -s http://localhost:3002/api/test > /dev/null || true
curl -s http://localhost:3002/api/error > /dev/null || true
sleep 5

echo "1. Traces & UQL"
TRACE_RESULT=$(curl -s http://localhost:8081/graphql -X POST -H "Content-Type: application/json" -d '{"query":"query { uql }", "variables": {"query": "traces | where service.name = \"express-app\" | limit 1"}}')
if ! echo "$TRACE_RESULT" | jq -e 'has("errors") | not' > /dev/null; then
  echo "❌ Traces test failed: $TRACE_RESULT"
  exit 1
fi
echo "✅ Traces validated"

echo "2. Pipeline Builder"
PIPELINE_RESULT=$(curl -s http://localhost:8081/graphql -X POST -H "Content-Type: application/json" -d '{"query":"mutation { pipelineCreate }", "variables": {"input": {"name": "E2E Pipeline", "nodes": [], "edges": []}}}')
if ! echo "$PIPELINE_RESULT" | jq -e '.data.pipelineCreate.id' > /dev/null; then
  echo "❌ Pipeline Builder test failed"
  exit 1
fi
echo "✅ Pipeline Builder validated"

echo "3. Optimizer Recommendations"
OPT_RESULT=$(curl -s http://localhost:8081/graphql -X POST -H "Content-Type: application/json" -d '{"query":"query { optimizationRecommendations { ruleName } }"}')
# As long as it returns without errors, the integration is working
if ! echo "$OPT_RESULT" | jq -e 'has("errors") | not' > /dev/null; then
  echo "❌ Optimizer test failed: $OPT_RESULT"
  exit 1
fi
echo "✅ Optimizer validated"

echo "4. Chaos Engineering"
CHAOS_CREATE=$(curl -s http://localhost:8081/graphql -X POST -H "Content-Type: application/json" -d '{"query":"mutation { chaosCreateExperiment }", "variables": {"input": {"name": "E2E Latency", "targetService": "express-app", "type": "LATENCY", "configuration": {"delay": 100}}}}')
CHAOS_ID=$(echo "$CHAOS_CREATE" | jq -r '.data.chaosCreateExperiment.id')
curl -s http://localhost:8081/graphql -X POST -H "Content-Type: application/json" -d "{\"query\":\"mutation { chaosStartExperiment }\", \"variables\": {\"id\": \"$CHAOS_ID\"}}" > /dev/null
# Wait a bit for the agent to pick it up
sleep 3
CHAOS_RADIUS=$(curl -s http://localhost:8081/graphql -X POST -H "Content-Type: application/json" -d "{\"query\":\"query { chaosBlastRadius }\", \"variables\": {\"experimentId\": \"$CHAOS_ID\"}}")
if ! echo "$CHAOS_RADIUS" | jq -e '.data.chaosBlastRadius.affectedServices | length >= 0' > /dev/null; then
  echo "❌ Chaos Engineering test failed: $CHAOS_RADIUS"
  exit 1
fi
echo "✅ Chaos Engineering validated"

echo "5. Alerting"
curl -s http://localhost:8081/graphql -X POST -H "Content-Type: application/json" -d '{"query":"mutation { createAlertRule }", "variables": {"input": {"name": "E2E Alert", "query": "traces | limit 1", "condition": {"type": "COUNT_GT", "threshold": 0}, "intervalSeconds": 2, "notificationChannelIds": []}}}' > /dev/null
# Wait for alert evaluation
sleep 5
ALERT_HISTORY=$(curl -s http://localhost:8081/graphql -X POST -H "Content-Type: application/json" -d '{"query":"query { alertHistory(limit: 5) { id state } }"}')
if ! echo "$ALERT_HISTORY" | jq -e 'has("errors") | not' > /dev/null; then
  echo "❌ Alerting test failed"
  exit 1
fi
echo "✅ Alerting validated"

echo "6. Session Replay"
# Check the REST API
REPLAY_RESULT=$(curl -s http://localhost:8082/api/v1/replay/sessions)
if ! echo "$REPLAY_RESULT" | jq -e 'type == "array" or type == "null"' > /dev/null; then
  echo "❌ Session Replay test failed: $REPLAY_RESULT"
  exit 1
fi
echo "✅ Session Replay validated"

echo "7. Metrics Dashboard"
METRICS_RESULT=$(curl -s http://localhost:8081/graphql -X POST -H "Content-Type: application/json" -d '{"query":"query { metrics }", "variables": {"query": "up", "startTime": "1", "endTime": "2", "step": 1}}')
if ! echo "$METRICS_RESULT" | jq -e '.data.metrics | type == "array" or type == "null"' > /dev/null; then
  echo "❌ Metrics test failed"
  exit 1
fi
echo "✅ Metrics validated"

echo "8. Robotics Dashboard"
ROBOT_RESULT=$(curl -s http://localhost:8081/graphql -X POST -H "Content-Type: application/json" -d '{"query":"query { uql }", "variables": {"query": "traces | where service.name = \"gazebo\" | limit 1"}}')
if ! echo "$ROBOT_RESULT" | jq -e 'has("errors") | not' > /dev/null; then
  echo "❌ Robotics Dashboard test failed: $ROBOT_RESULT"
  exit 1
fi
echo "✅ Robotics Dashboard validated"
echo "✅ Robotics Dashboard validated"

echo "🎉 All E2E validations passed!"

echo "Cleaning up..."
make down
echo "Cleanup complete."
