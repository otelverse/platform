cmake_minimum_required(VERSION 3.14)
project(otelverse_robotics_cpp)

set(CMAKE_CXX_STANDARD 17)

# In a real setup, we would find_package for OpenTelemetry, ROS 2, and Gazebo.
# find_package(rclcpp REQUIRED)
# find_package(gazebo REQUIRED)
# find_package(opentelemetry-cpp REQUIRED)

# For this demo/SDK scaffolding, we will compile mock versions of the instrumentation.
include_directories(include)

add_library(otelverse_robotics src/ros2_instrumentation.cpp src/gazebo_plugin.cpp)
target_include_directories(otelverse_robotics PUBLIC include)

add_executable(test_instrumentation src/test_instrumentation.cpp)
target_link_libraries(test_instrumentation otelverse_robotics)

# Build tests when `make test` is run
enable_testing()
add_test(NAME TestInstrumentation COMMAND test_instrumentation)
