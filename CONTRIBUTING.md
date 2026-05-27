# Contributing

## Branching
- `main` — production
- `develop` — integration
- Feature branches: `feature/session-XX-short-desc` branched from latest `develop`

## Commit Style
Use conventional commits:
- `feat:` new feature
- `fix:` bug fix
- `chore:` maintenance, config, tooling
- `test:` adding or updating tests
- `docs:` documentation
- `refactor:` code restructuring

## Before Committing
- Run `bazel test //...` to ensure all tests pass
- Run `bazel run //tools:lint` if available

## Pull Requests
1. Create PR from feature branch to `develop`
2. Ensure CI passes
3. Request review from code owners

## Code Style
- Go: `gofumpt`
- TypeScript: ESLint + Prettier
- Python: Black
