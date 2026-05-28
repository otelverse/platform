# OTelVerse Demo Video Script & Storyboard

**Duration**: ~5 Minutes
**Target Audience**: Developers, DevOps Engineers, SREs

---

## Scene 1: Opening (0:00 - 0:30)
**Visual**: Screen recording of the OTelVerse landing page (otelverse.io) and then switching to the GitHub repository.
**Audio/Script**: "Today I'll show you OTelVerse, the complete OpenTelemetry ecosystem. Instead of stitching together fragmented observability tools, OTelVerse gives you traces, metrics, logs, session replays, and chaos engineering all in one unified, open-source platform."

---

## Scene 2: Quick Start & Exploration (0:30 - 1:30)
**Visual**: 
- Terminal window showing `docker compose up -d` in the integration kit folder.
- A simulated app generating traffic.
- Switch to the browser: Platform UI loading at `http://localhost:8081`. 
- Navigate to the Trace list, open a specific Trace Waterfall, and demonstrate the UQL (Unified Query Language) bar.
**Audio/Script**: "Getting started is as easy as running `docker compose up` using our integration kit. Let's generate some traffic. Over in the Platform UI, traces appear instantly. You can explore the trace waterfall for deep insights and use our Unified Query Language, or UQL, to filter cross-signal data effortlessly."

---

## Scene 3: Visual Pipeline Builder (1:30 - 2:30)
**Visual**:
- Navigate to "Pipeline Builder" in the sidebar.
- Drag-and-drop a receiver, a tail sampling processor, and an exporter onto the canvas.
- Connect them.
- Click "Export YAML" and show the generated OTel Collector configuration.
**Audio/Script**: "Configuring the OpenTelemetry Collector can be tricky. Our Visual Pipeline Builder solves this. Just drag and drop components—like this tail sampling processor—connect them, and export the exact YAML config to deploy directly to your collector."

---

## Scene 4: AI Optimizer (2:30 - 3:15)
**Visual**:
- Navigate to "AI Optimizer".
- Click "Analyze Telemetry".
- Show the generated recommendations (e.g., PII detected, high error rate on a specific span).
- Click "Apply Policy".
**Audio/Script**: "If you're overwhelmed by data volume, the AI Optimizer analyzes your telemetry patterns to find cost-saving opportunities. Here, it recommends a sampling policy to drop repetitive health checks while retaining traces with errors. Applying it is a single click."

---

## Scene 5: Session Replay (3:15 - 3:45)
**Visual**:
- Go back to the Trace list.
- Click a trace that has a frontend span.
- Click the "View Session Replay" button.
- A video-like player shows the user's DOM interactions syncing with the backend trace timeline.
**Audio/Script**: "When troubleshooting frontend issues, context is everything. With our rrweb integration, you can click 'View Session Replay' on a trace and watch exactly what the user experienced in their browser when the error occurred, perfectly synced to backend events."

---

## Scene 6: Chaos Engineering (3:45 - 4:15)
**Visual**:
- Navigate to "Chaos Engine".
- Create a new experiment: "Latency Injection", target: "express-app", 100ms.
- Click "Run Experiment".
- Switch to the "Blast Radius" visualization showing affected downstream services.
**Audio/Script**: "To build resilient systems, we need to test them in production. Our OTLP-native Chaos Engine lets you inject logical latency and simulated errors into targeted microservices. Once active, the Blast Radius dashboard shows exactly which downstream services are impacted."

---

## Scene 7: Robotics Dashboard (4:15 - 4:45)
**Visual**:
- Navigate to "Robotics Dashboard".
- Show traces labeled with `service.name = "gazebo"`.
- Show a 3D visualization or telemetry chart correlating with the robot's state.
**Audio/Script**: "OTelVerse even scales to edge devices and robotics. Using our Robotics SDK, simulated robots in Gazebo stream traces directly into the platform, giving you distributed observability for physical or simulated autonomous systems."

---

## Scene 8: Closing (4:45 - 5:00)
**Visual**:
- Return to the GitHub repository page and Discord invite screen.
**Audio/Script**: "That's just a taste of what OTelVerse can do. To try it yourself, star our repository on GitHub, join our Discord community, and start observing your systems in minutes. Thanks for watching!"

---

### Technical Recording Notes
- **Prerequisites**: Run `make up-all` in `packages/integration-kits/compose/otelverse-kit`. 
- **Ports**: Make sure port `8081` (Platform), `8080` (Express App), and `3000` (React App) are accessible.
- **Data Generation**: Run the `mock-robot.sh` script to ensure Robotics data is populated before Scene 7.
