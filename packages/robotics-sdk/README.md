# OTelVerse Robotics & IoT Simulator SDK

This SDK provides observability instrumentation for ROS 2 and Gazebo simulations, seamlessly integrating them with the OTelVerse Platform.

## Architecture
- **C++ (ROS 2 & Gazebo)**: `rclcpp` wrappers and Gazebo plugins to auto-instrument timers, callbacks, and physics steps.
- **Python (ROS 2)**: `pybind11` bindings and pure-Python `@trace` decorators for Python nodes.
- **Forwarder**: A Rust sidecar based on `edge-common` designed for simulation environments (No MQTT, lightweight).
- **CLI**: A Rust CLI tool (`otelverse-robotics`) to scaffold, start, and manage simulation environments.

## Quick Start
```bash
otelverse-robotics init my_workspace
otelverse-robotics sim start
```
View traces in the Platform UI at `/robotics`.

## Digital Twin Correlation
The SDK automatically propagates `robot.id` and `simulation.id` context into spans, allowing the Platform to correlate simulated robot data with its real-world physical counterpart via the Edge Agent.
