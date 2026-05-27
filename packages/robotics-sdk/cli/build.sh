#!/bin/bash
set -e
echo "Building Robotics CLI..."
cd ${BUILD_WORKSPACE_DIRECTORY:-$(pwd)}/packages/robotics-sdk/cli
cargo build
