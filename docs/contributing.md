# Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for contribution guidelines.

This document provides additional context for contributors.

## Codebase Overview

The codebase is organized as a monorepo with clean package boundaries. Each package has a single responsibility.

### Key Concepts

- **FileStats**: Per-file analysis results (lines, size, etc.)
- **LanguageStats**: Aggregated language statistics
- **Framework**: Detected technology stack
- **HealthScore**: Computed project health metric
- **Recommendation**: Actionable improvement suggestion
- **SecurityFinding**: Static security analysis result

### Adding Features

When adding new analysis features:

1. Define types in `@repolens/types`
2. Implement detection in `@repolens/detectors`
3. Integrate in `@repolens/analyzer`
4. Add output in `@repolens/reporting`
5. Write tests

### Common Patterns

- All detectors are pure functions that take file paths and contents
- Configuration is loaded once and passed through
- Errors are caught and handled gracefully
- No external API calls by default
