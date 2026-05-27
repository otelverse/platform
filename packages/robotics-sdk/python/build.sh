#!/bin/bash
set -e
echo "Building Python robotics SDK..."
cd ${BUILD_WORKSPACE_DIRECTORY:-$(pwd)}/packages/robotics-sdk/python

echo "Running Python tests..."
export PYTHONPATH=src:$PYTHONPATH
python3 src/test_instrumentation.py
