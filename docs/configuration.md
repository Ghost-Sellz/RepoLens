# Configuration

## Default Configuration

RepoLens uses sensible defaults. No configuration is required.

## .repolens.json

Place a `.repolens.json` file in your repository root to customize behavior:

```json
{
  "ignore": [
    "node_modules",
    ".git",
    ".next",
    "dist",
    "build",
    "coverage"
  ],
  "security": {
    "enabled": true
  },
  "git": {
    "enabled": true
  },
  "dependencies": {
    "enabled": true
  },
  "history": {
    "enabled": true
  },
  "deep": false
}
```

## CLI Options

CLI options override configuration file settings:

| Option | Description |
|--------|-------------|
| `--no-git` | Skip Git analysis |
| `--no-dependencies` | Skip dependency analysis |
| `--no-security` | Skip security scanning |
| `--no-history` | Skip history analysis |
| `--deep` | Enable deep analysis mode |
| `--json` | Output as JSON |
| `--markdown` | Output as Markdown |
| `--html` | Output as HTML |
| `-o, --output <path>` | Write output to file |

## Default Ignored Directories

```
node_modules
.git
.next
dist
build
coverage
target
vendor
.cache
__pycache__
.venv
venv
.idea
.vscode
tmp
.turbo
.nuxt
.output
out
```

Directories starting with `.` are also ignored by default.
