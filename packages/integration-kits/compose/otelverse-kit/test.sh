#!/usr/bin/env bash
set -eo pipefail

echo "Starting Docker Compose kit..."
docker-compose up -d --build

echo "Waiting for Platform to be ready..."
for i in {1..30}; do
  if curl -s http://localhost:8080/healthz > /dev/null; then
    echo "Platform is up!"
    break
  fi
  sleep 2
done

echo "Waiting for Express app to be ready..."
for i in {1..30}; do
  if curl -s http://localhost:3001/healthz > /dev/null; then
    echo "Express app is up!"
    break
  fi
  sleep 2
done

echo "Sending mock traffic to generate traces..."
curl -s http://localhost:3001/users > /dev/null
curl -s -X POST -H "Content-Type: application/json" -d '{"id": 1, "fail": false}' http://localhost:3001/orders > /dev/null
curl -s -X POST -H "Content-Type: application/json" -d '{"id": 2, "fail": true}' http://localhost:3001/orders > /dev/null

echo "Waiting for traces to be exported to ClickHouse (10s)..."
sleep 10

echo "Querying Platform GraphQL for traces..."
QUERY='{"query":"query { uql(query: \"traces | where service.name = \\\"express-app\\\"\") { ... on TraceList { traces { traceId spans { spanId operationName serviceName } } } } }"}'
RESULT=$(curl -s -X POST -H "Content-Type: application/json" -d "$QUERY" http://localhost:8080/graphql)

if echo "$RESULT" | grep -q "express-app"; then
  echo "✅ Traces found successfully!"
else
  echo "❌ Traces not found. Output: $RESULT"
  docker-compose logs platform
  docker-compose logs clickhouse
  docker-compose down -v
  exit 1
fi

echo "Querying Optimizer endpoint..."
START_TIME=$(date -u -d '1 hour ago' +"%Y-%m-%dT%H:%M:%SZ")
END_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
OPT_QUERY="{\"query\":\"query { optimizationRecommendations(pipelineId: \\\"default\\\", startTime: \\\"$START_TIME\\\", endTime: \\\"$END_TIME\\\") { id type } }\"}"
OPT_RESULT=$(curl -s -X POST -H "Content-Type: application/json" -d "$OPT_QUERY" http://localhost:8080/graphql)

if echo "$OPT_RESULT" | grep -q "optimizationRecommendations"; then
  echo "✅ Optimizer query successful!"
else
  echo "❌ Optimizer query failed. Output: $OPT_RESULT"
  docker-compose down -v
  exit 1
fi

echo "Tearing down Docker Compose kit..."
docker-compose down -v
echo "✅ All tests passed!"
