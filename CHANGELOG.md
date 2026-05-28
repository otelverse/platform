# Changelog

All notable changes to this project will be documented in this file.

## [0.17.0-rc1] - 2026-05-28

### Added
- **E2E Integration Validation**: Fully automated docker-compose test suite (`e2e-test.sh`) validating all 10 products.
- **Nightly CI Workflow**: Added GitHub Actions workflow to run E2E validations every night.
- **Service Integration**: Chaos Agent, Edge Control, Session Replay PostgreSQL, and Robotics Simulator added to the integration kit.

## [0.11.0-alpha.1] - 2026-05-27
### Added
- **Unified Platform**: A robust Go-based GraphQL backend parsing ClickHouse data.
- **Pipeline Builder**: ReactFlow-based drag-and-drop OTel Collector configuration generator.
- **Frontend Wrapper**: Auto-instrumentation wrapper connecting frontend interactions to trace streams.
- **Pipeline Optimizer**: AI-driven heuristic engine to generate optimal trace sampling and PII redaction policies.
- **Chaos Engine**: OTLP-native proxy to seamlessly inject logical latency and simulated errors into targeted microservices.
- **Session Replay**: rrweb integration linking DOM snapshot replays directly to distributed trace timelines.
- **Documentation Site**: Comprehensive Docusaurus site at docs.otelverse.io.
- **Integration Kits**: Ready-to-go Docker Compose and Kubernetes Helm deployments.
