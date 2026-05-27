#!/bin/bash
set -e
echo "Building C++ ROS 2 instrumentation..."
cd ${BUILD_WORKSPACE_DIRECTORY:-$(pwd)}/packages/robotics-sdk/cpp

# Build the mock instrumentation
g++ -std=c++17 -Iinclude src/ros2_instrumentation.cpp src/gazebo_plugin.cpp src/test_instrumentation.cpp -o test_instrumentation

echo "Running tests..."
./test_instrumentation
