# Development Guide

## Prerequisites

- Node.js >= 18
- pnpm >= 9

## Setup

```bash
# Clone the repository
git clone https://github.com/your-org/repolens.git
cd repolens

# Install dependencies
pnpm install
```

## Monorepo Structure

RepoLens uses pnpm workspaces. The key packages are:

| Package | Path | Description |
|---------|------|-------------|
| `@repolens/types` | `packages/types` | Shared TypeScript types |
| `@repolens/config` | `packages/config` | Configuration loading |
| `@repolens/detectors` | `packages/detectors` | All detection logic |
| `@repolens/github` | `packages/github` | Git and GitHub support |
| `@repolens/analyzer` | `packages/analyzer` | Core analysis engine |
| `@repolens/reporting` | `packages/reporting` | Output formatters |
| `@repolens/cli` | `apps/cli` | CLI application |
| `@repolens/web` | `apps/web` | Web dashboard |

## Scripts

```bash
pnpm install        # Install all dependencies
pnpm build          # Build all packages
pnpm lint           # Type-check all packages
pnpm test           # Run test suite
pnpm test:watch     # Run tests in watch mode
pnpm dev:cli        # Run CLI in development
pnpm dev:web        # Run web dashboard
```

## Adding a New Detector

1. Create a new file in `packages/detectors/src/`
2. Export the detection function
3. Add it to `packages/detectors/src/index.ts`
4. Write tests in `tests/`
5. Integrate in `packages/analyzer/src/index.ts`

## Adding a New Language

Add the language definition to `packages/detectors/src/language.ts` in the `LANGUAGES` array.

## Adding a New Framework

Add the framework rule to `packages/detectors/src/framework.ts` in the `FRAMEWORK_RULES` array.

## Testing

Tests use Vitest. Run with:

```bash
pnpm test
```

Test fixtures are in `tests/fixtures/`.

## Publishing

1. Update version in `apps/cli/package.json`
2. Update CHANGELOG.md
3. Create a git tag: `git tag v1.0.0`
4. Push tag: `git push origin v1.0.0`
5. GitHub Actions will create a release
