# Hacker News Launch Post Draft

## Submission Fields
- **Title**: Show HN: OTelVerse – A complete open-source observability platform built on OpenTelemetry
- **URL**: https://github.com/otelverse/platform

## Initial Comment
*(Post this immediately after submission to provide context)*

Hi HN! I'm the creator of OTelVerse. 

Over the last few months, I've noticed that while OpenTelemetry has become the de-facto standard for generating telemetry, the "last mile" of actually consuming, correlating, and acting on that data requires stitching together 5-10 different commercial tools. 

We built OTelVerse to fix this. It’s an Apache 2.0 licensed, open-core platform that unifies observability.

**What makes it unique?**
1. **10 Integrated Products**: It's not just a UI for traces. It includes a visual pipeline builder (ReactFlow) to generate your OTel Collector config, native metrics/logs dashboards, and even an Edge Agent for IoT devices.
2. **AI Optimizer**: Analyzing 100% of telemetry gets expensive. We built a heuristic engine that automatically detects PII and high-error spans, recommending tail-sampling policies you can apply with one click.
3. **Session Replay**: We integrated rrweb to link DOM snapshots directly to distributed trace timelines. You can see the user's screen perfectly synced with backend API latency.
4. **OTLP-Native Chaos Engineering**: Our Chaos proxy injects logical latency and simulated errors into targeted microservices, and you visualize the blast radius directly in the platform.

**Tech Stack**: 
- Backend: Go (GraphQL APIs, UQL parser)
- Storage: ClickHouse (Traces/Logs), VictoriaMetrics (Metrics), PostgreSQL (Session Replay)
- Frontend: React (Vite/Next.js) + Docusaurus

You can spin up the entire ecosystem locally using our integration kit: `make up-all`.

I'd love to hear your feedback on the architecture, UQL (our Unified Query Language), or anything else! I'll be around all day to answer questions.

Repo: https://github.com/otelverse/platform  
Live Demo: https://otelverse.io/docs/getting-started
