#!/bin/bash
set -e
echo "Building Robotics Forwarder..."
cd ${BUILD_WORKSPACE_DIRECTORY:-$(pwd)}/packages/robotics-sdk/forwarder
cargo build
