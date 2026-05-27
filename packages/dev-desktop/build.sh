#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "=== Building OTelVerse Dev Desktop ==="

echo ""
echo "--- Step 1: Building Go Platform (DuckDB backend) ---"
cd platform
CGO_ENABLED=1 go build -tags duckdb -o ../dist/platform .
cd ..

echo ""
echo "--- Step 2: Building React UI ---"
cd ui
npm ci
npm run build
cd ..

echo ""
echo "--- Step 3: Building Tauri app ---"
cd src-tauri
cargo tauri build
cd ..

echo ""
echo "=== Build complete ==="
echo "Binary: src-tauri/target/release/otelverse-dev-desktop"
