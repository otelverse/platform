# Contributing to OTelVerse

First off, thank you for considering contributing to OTelVerse! It's people like you that make OTelVerse such a great tool for the observability community.

Please take a moment to review this document in order to make the contribution process easy and effective for everyone involved.

## Code of Conduct

This project and everyone participating in it is governed by the [OTelVerse Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to conduct@otelverse.io.

## Quick Start

The fastest way to get a local development environment running is to use our Docker Compose integration kit:
```bash
cd packages/integration-kits/compose/otelverse-kit
make up-all
```
This spins up the complete platform, database, and all necessary services.

## Development Setup

Our monorepo uses [Bazel](https://bazel.build/) as the primary build system. You will need:
- **Bazelisk** (Recommended over raw Bazel, as it automatically manages the Bazel version)
- **Go** (1.22+)
- **Node.js** (20+) and **pnpm**
- **Rust** (1.75+)
- **Docker** and **Docker Compose**

## Building and Testing

To build the entire project:
```bash
bazel build //...
```

To run all unit and integration tests:
```bash
bazel test //...
```

*Note: Some integration tests require Docker to be running locally as they use Testcontainers.*

## Code Style

We enforce strict formatting and linting rules across our polyglot repository:
- **Go**: We use `gofumpt` for formatting.
- **TypeScript/JavaScript**: We use [Biome](https://biomejs.dev/) for fast formatting and linting.
- **Rust**: We use `rustfmt` and `clippy`.
- **Python**: We use `black`.

You can automatically format your code before committing by running:
```bash
bazel run //tools:lint
```

## Pull Request Process

1. **Branching**: We use a git-flow inspired model. Always create your feature branch from the latest `develop` branch.
   `git checkout -b feature/short-description develop`
2. **Commits**: Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification (e.g., `feat:`, `fix:`, `docs:`, `chore:`).
3. **Tests**: Ensure your changes are covered by tests. Your PR must pass the `bazel test //...` CI check before it can be merged.
4. **Review**: Open your PR against `develop`. You need at least one approval from a maintainer to merge.

## Issue Reporting

We use GitHub Issues to track public bugs and requests. Please ensure your description is clear and has sufficient instructions to be able to reproduce the issue.

* **Bugs**: Please provide steps to reproduce, expected behavior, and actual behavior.
* **Features**: Please provide a clear use case and the problem you are trying to solve.

Issues are always welcome!
