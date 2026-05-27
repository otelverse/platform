#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "=== Starting OTelVerse Dev Desktop (Development Mode) ==="

echo ""
echo "--- Building Go Platform (DuckDB backend) ---"
mkdir -p ~/.otelverse
mkdir -p dist
cd platform
CGO_ENABLED=1 go build -tags duckdb -o ../dist/platform .
cd ..

echo ""
echo "--- Starting React UI dev server ---"
cd ui
npm run dev &
UI_PID=$!
cd ..

echo ""
echo "--- Starting Tauri dev mode ---"
cd src-tauri
cargo tauri dev &
TAURI_PID=$!
cd ..

echo ""
echo "All processes started. Press Ctrl+C to stop."
echo "UI PID: $UI_PID"
echo "Tauri PID: $TAURI_PID"

trap "kill $UI_PID $TAURI_PID 2>/dev/null" EXIT
wait
