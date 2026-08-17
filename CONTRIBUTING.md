# Contributing to RepoLens

Thank you for your interest in contributing!

## Getting Started

1. Fork the repository
2. Clone your fork
3. Install dependencies: `pnpm install`
4. Create a branch: `git checkout -b feature/my-feature`
5. Make your changes
6. Run tests: `pnpm test`
7. Run lint: `pnpm lint`
8. Commit your changes
9. Push to your fork
10. Open a Pull Request

## Development

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Build all packages
pnpm build

# Lint all packages
pnpm lint

# Run CLI in dev mode
pnpm dev:cli -- .
```

## Project Structure

See [docs/architecture.md](docs/architecture.md) for a detailed overview.

## Code Style

- Use TypeScript strictly
- No comments unless requested
- Follow existing patterns
- Keep functions small and focused

## Testing

- Write tests for new features
- Ensure all existing tests pass
- Use the test fixtures in `tests/fixtures/`

## Pull Requests

- One feature/fix per PR
- Include a clear description
- Reference any related issues
- Ensure CI passes

## Issues

Use the GitHub issue templates for bug reports and feature requests.
