#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

for f in jest.config.js package.json tsconfig.json src/index.ts; do
  test -f "$f" || { echo "Missing $f in $SCRIPT_DIR"; exit 1; }
done

echo "React source tree check passed."
