# RepoLens

**Repository Intelligence — Understand any codebase in seconds.**

[![npm](https://img.shields.io/npm/v/repolens)](https://www.npmjs.com/package/repolens)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

RepoLens analyzes repositories and produces detailed, actionable insights — locally, with zero data uploaded.

```
╭──────────────────────────────────────────────────────╮
│                      RepoLens                       │
│             Repository Intelligence                 │
╰──────────────────────────────────────────────────────╯

Repository
──────────────────────────────────────────────────────

Name             my-project
Languages        TypeScript, CSS, JavaScript
Files            184
Lines            27,391
Dependencies     43
Contributors     8
Commits          1,247

Health Score
──────────────────────────────────────────────────────

████████████████████░░░░  84/100

Code Quality       91
Documentation      78
Security           88
Testing            71
Maintenance        93
Configuration      82
```

## Features

- **Language Detection** — 35+ languages with file/line counts and percentages
- **Framework Detection** — 30+ frameworks including React, Next.js, Django, Rails
- **Health Scoring** — Transparent 6-category scoring system
- **Security Scanning** — Hardcoded secrets, env files, unsafe patterns
- **Git Analysis** — Commits, contributors, activity, branches
- **Dependency Analysis** — npm, pip, cargo, go modules, bundler, composer
- **CI/CD Detection** — GitHub Actions, GitLab CI, Docker, Vercel, Netlify
- **Testing Analysis** — Framework detection and test/source ratio
- **Documentation Analysis** — README, CONTRIBUTING, LICENSE, SECURITY
- **Recommendations** — Actionable, prioritized improvement suggestions
- **Multiple Output Formats** — Terminal, JSON, Markdown, standalone HTML
- **Repository Comparison** — Compare two repos side by side
- **Privacy First** — All analysis runs locally, zero data uploaded

## Installation

```bash
# Run directly with npx
npx repolens .

# Or install globally
npm install -g repolens

# Or with pnpm
pnpm add -g repolens
```

## Quick Start

```bash
# Analyze current directory
repolens .

# Analyze a specific path
repolens ./my-project

# Analyze a GitHub repository
repolens https://github.com/facebook/react

# Generate JSON report
repolens . --json -o report.json

# Generate Markdown report
repolens . --markdown -o REPORT.md

# Generate HTML report
repolens . --html -o report.html

# Compare two repositories
repolens compare ./project-a ./project-b
```

## Commands

| Command | Description |
|---------|-------------|
| `repolens <target>` | Analyze a repository |
| `repolens analyze <target>` | Explicit analyze command |
| `repolens report <target>` | Generate a Markdown report |
| `repolens compare <a> <b>` | Compare two repositories |
| `repolens config` | Show default configuration |

## Options

| Option | Description |
|--------|-------------|
| `--json` | Output as JSON |
| `--markdown` | Output as Markdown |
| `--html` | Output as standalone HTML |
| `-o, --output <path>` | Write output to file |
| `--no-git` | Skip Git analysis |
| `--no-dependencies` | Skip dependency analysis |
| `--no-security` | Skip security scanning |
| `--no-history` | Skip history analysis |
| `--deep` | Deep analysis mode |
| `-q, --quiet` | Minimal output |
| `-v, --verbose` | Verbose output |

## Supported Languages

TypeScript, JavaScript, Python, Java, C, C++, C#, Go, Rust, PHP, Ruby, Swift, Kotlin, Dart, HTML, CSS, SCSS, Vue, Svelte, Shell, SQL, Markdown, JSON, YAML, XML, TOML, Lua, Scala, R, Elixir, Haskell, GraphQL, Terraform, Assembly, Perl, Objective-C, and more.

## Supported Frameworks

React, Next.js, Vue, Nuxt, Svelte, SvelteKit, Astro, Angular, Express, Fastify, NestJS, Django, Flask, FastAPI, Laravel, Rails, Spring, Prisma, Drizzle, Tailwind CSS, Docker, Kubernetes, GitHub Actions, Vercel, Netlify, Supabase, Firebase, Vite, Webpack, Turbo, pnpm, GraphQL, Redis, PostgreSQL, MongoDB.

## Health Scoring

RepoLens computes a health score from 6 weighted categories:

| Category | Weight | What It Measures |
|----------|--------|-----------------|
| Code Quality | 20% | File structure, language diversity, large files |
| Documentation | 15% | README, CONTRIBUTING, LICENSE, SECURITY |
| Security | 20% | Secrets, env files, unsafe patterns |
| Testing | 15% | Framework, test files, test/source ratio |
| Maintenance | 15% | Git activity, contributors, commit frequency |
| Configuration | 15% | CI/CD, license, README, dependencies |

| Score | Grade |
|-------|-------|
| 90-100 | Excellent |
| 75-89 | Good |
| 60-74 | Fair |
| 40-59 | Needs Work |
| 0-39 | Critical |

See [docs/scoring.md](docs/scoring.md) for the full algorithm.

## Configuration

Place a `.repolens.json` file in your repository root:

```json
{
  "ignore": ["node_modules", ".next", "dist"],
  "security": { "enabled": true },
  "git": { "enabled": true },
  "dependencies": { "enabled": true }
}
```

CLI options override configuration file settings.

## Privacy

RepoLens runs **entirely locally**. No repository contents, source code, or file data is transmitted anywhere. See [docs/privacy.md](docs/privacy.md) for details.

## Architecture

```
repolens/
├── apps/
│   ├── cli/          # Command-line interface
│   └── web/          # Web dashboard
├── packages/
│   ├── types/        # Shared TypeScript types
│   ├── config/       # Configuration loading
│   ├── analyzer/     # Core analysis engine
│   ├── detectors/    # Language, framework, security detection
│   ├── github/       # Git analysis and GitHub support
│   └── reporting/    # JSON, Markdown, HTML output
└── tests/            # Test suite
```

See [docs/architecture.md](docs/architecture.md) for details.

## Development

```bash
# Clone
git clone https://github.com/Ghost-Sellz/repolens.git
cd repolens

# Install
pnpm install

# Build
pnpm build

# Test
pnpm test

# Dev (CLI)
pnpm dev:cli -- .

# Dev (Web)
pnpm dev:web
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Roadmap

- GitHub App integration
- Pull request analysis
- Repository history visualization
- Dependency vulnerability integrations
- VS Code extension
- JetBrains plugin
- GitHub Action
- Organization dashboards
- Repository trend tracking
- Plugin system

## License

MIT License — see [LICENSE](LICENSE).
