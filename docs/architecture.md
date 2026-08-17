# Architecture

RepoLens uses a monorepo architecture with clean separation of concerns.

## Structure

```
repolens/
├── apps/
│   ├── cli/          # Command-line interface (primary product)
│   └── web/          # Web dashboard for viewing reports
├── packages/
│   ├── types/        # Shared TypeScript types
│   ├── config/       # Configuration loading and defaults
│   ├── analyzer/     # Core analysis engine
│   ├── detectors/    # Language, framework, security, CI/CD, testing detection
│   ├── github/       # Git analysis and GitHub URL handling
│   └── reporting/    # JSON, Markdown, HTML, terminal output
└── tests/            # Integration and unit tests
```

## Data Flow

1. **Input**: User provides a path or GitHub URL
2. **Resolution**: `@repolens/github` resolves the target (local or clone)
3. **Scanning**: `@repolens/analyzer` scans the directory tree
4. **Detection**: `@repolens/detectors` identifies languages, frameworks, security issues, etc.
5. **Git Analysis**: `@repolens/github` analyzes git history if available
6. **Scoring**: Health score is computed from all detection results
7. **Recommendations**: Actionable items are generated from findings
8. **Output**: `@repolens/reporting` formats the result

## Package Dependencies

```
types ← config ← analyzer ← cli
                    ↑
               detectors
                    ↑
                 github
                    ↑
               reporting
```

## Design Principles

- **Local-first**: All analysis runs on the user's machine
- **No external APIs by default**: All detection is based on file scanning
- **Graceful degradation**: If git is unavailable, analysis continues
- **Configurable**: Users can customize ignored directories and features
- **Fast**: Async I/O and efficient file scanning
