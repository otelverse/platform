#!/bin/bash
set -e

# Change to the agent directory relative to the workspace root
cd packages/edge-agent/agent

# Run cargo test
cargo test
cargo build
