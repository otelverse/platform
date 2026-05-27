#!/bin/bash
set -e
# Sanity check: verify source tree integrity (runs inside Bazel sandbox)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
for f in jest.config.js package.json tsconfig.json src/index.ts; do
  test -f "$SCRIPT_DIR/$f" || { echo "Missing $f in $SCRIPT_DIR"; exit 1; }
done
echo "UI Kit source tree check passed."
