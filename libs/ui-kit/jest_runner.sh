#!/bin/bash
set -e
UI_KIT_DIR="$BUILD_WORKSPACE_DIRECTORY/libs/ui-kit"
cd "$UI_KIT_DIR"
./node_modules/.bin/jest --config jest.config.js --ci "$@"
