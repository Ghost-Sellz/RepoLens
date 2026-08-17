# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in RepoLens, please report it responsibly.

**Do NOT open a public GitHub issue for security vulnerabilities.**

Instead, please email security concerns to the maintainers via GitHub's security advisory feature.

## Scope

RepoLens is a local analysis tool. The following are in scope:

- Command injection through repository paths
- Path traversal vulnerabilities
- Unsafe file handling
- Dependency vulnerabilities in RepoLens itself

## Out of Scope

- Vulnerabilities in analyzed repositories (RepoLens only reads files)
- Issues with third-party dependencies used by analyzed projects

## Response Time

We aim to respond to security reports within 48 hours.

## Fixes

Security fixes will be prioritized and released as patch versions.
