# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2026-05-28

This is the first stable release of the OTelVerse Platform!

### Added
- **10 Core Products**: Unified Platform, Pipeline Builder, Frontend Wrapper, Pipeline Optimizer, Chaos Engine, Session Replay, Edge Agent, Robotics SDK, Dev Desktop, and Integration Kits.
- **Alerting & Metrics**: Full-stack alerting engine and dynamic metrics dashboards.
- **UQL Enhancements**: Advanced OpenTelemetry querying with the Unified Query Language.
- **E2E Validation**: Comprehensive automated testing for the entire platform.
- **Hardening**: OAuth2 proxy authentication, PostgreSQL persistence, ClickHouse pooling, and security scanning.
- **Governance**: Established Apache 2.0 license, CODE_OF_CONDUCT.md, and open-source contribution guidelines.

[1.0.0]: https://github.com/otelverse/platform/compare/v0.18.0-rc3...v1.0.0

## [0.18.0-rc3] - 2026-05-28

### Added
- **Hardening**: Added OAuth2 proxy authentication to the platform.
- **Resilience**: Migrated Alerting, Pipelines, and Chaos state to PostgreSQL persistence with in-memory fallback.
- **Performance**: Added ClickHouse connection pooling and pprof endpoints.
- **Frontend Optimization**: Added lazy loading and source-map-explorer for web frontend.
- **Security**: Automated security scanning via GitHub Actions (gosec, cargo-audit, npm audit) and established `SECURITY.md` reporting guidelines.
- **Error Handling**: Implemented generic React `ErrorBoundary`, GraphQL retry middleware, UQL query exponential backoff, and strict timeout contexts for health checks.

## [0.17.0-rc2] - 2026-05-28

### Added
- **Community Launch Preparation**: Added launch blog post, demo script, community landing page, Discord setup, Hacker News draft, and social assets.

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
