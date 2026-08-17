# Detectors

RepoLens uses multiple detectors to analyze repositories.

## Language Detection

Based on file extensions. Supports 35+ languages including TypeScript, JavaScript, Python, Java, C/C++, Go, Rust, PHP, Ruby, Swift, Kotlin, and more.

## Framework Detection

Based on configuration files and package.json content:

| Framework | Detection Method |
|-----------|-----------------|
| Next.js | `next.config.*` |
| React | `package.json` dependency |
| Vue | `vue.config.*` or `package.json` |
| Angular | `angular.json` |
| Svelte/SvelteKit | `svelte.config.*` |
| Astro | `astro.config.*` |
| Express/Fastify/NestJS | `package.json` |
| Django/Flask/FastAPI | `requirements.txt` / `pyproject.toml` |
| Laravel | `artisan` / `composer.json` |
| Rails | `Gemfile` / `Rakefile` |
| Spring | `pom.xml` / `build.gradle` |
| Prisma/Drizzle | Config files |
| Tailwind CSS | `tailwind.config.*` |
| Docker | `Dockerfile` / `docker-compose.*` |
| GitHub Actions | `.github/workflows/` |
| Vercel/Netlify | Config files |

## Security Detection

Static analysis for:
- Hardcoded credentials (passwords, API keys, tokens)
- Private key files
- Committed `.env` files
- Debug configuration
- Unsafe shell commands
- CORS misconfigurations
- Missing `.gitignore`

All findings labeled as "potential issues" to avoid false positives.

## CI/CD Detection

Detects: GitHub Actions, GitLab CI, CircleCI, Jenkins, Travis CI, AppVeyor, Azure Pipelines, Bitbucket Pipelines, Docker, Vercel, Netlify.

## Testing Detection

Detects: Vitest, Jest, Playwright, Cypress, Mocha, Pytest, JUnit.

Counts test files (`*.test.*`, `*.spec.*`) and estimates test/source ratio.

## Documentation Analysis

Checks for: README.md, CONTRIBUTING.md, CODE_OF_CONDUCT.md, SECURITY.md, LICENSE, CHANGELOG.md, docs/ directory.
