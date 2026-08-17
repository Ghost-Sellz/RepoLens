# Health Scoring

RepoLens computes a health score from 6 weighted categories.

## Categories and Weights

| Category        | Weight | Description |
|-----------------|--------|-------------|
| Code Quality    | 20%    | File structure, language diversity, large file detection |
| Documentation   | 15%    | README, CONTRIBUTING, LICENSE, SECURITY, CHANGELOG |
| Security        | 20%    | Hardcoded secrets, env files, unsafe patterns |
| Testing         | 15%    | Test framework, test files, test/source ratio |
| Maintenance     | 15%    | Git activity, contributors, commit frequency |
| Configuration   | 15%    | CI/CD, license, README, dependency management |

## Score Calculation

### Code Quality (0-100)
- Base: 50
- +15 if languages detected
- +10 if files > 0
- +10 if files < 5000
- +10 if frameworks detected
- -3 per file over 1000 lines

### Documentation (0-100)
Directly from `@repolens/detectors`:
- README: +30
- README > 500 chars: +10
- CONTRIBUTING: +15
- CODE_OF_CONDUCT: +10
- SECURITY: +10
- LICENSE: +15
- CHANGELOG: +5
- docs/ directory: +5

### Security (0-100)
- Base: 100
- -15 per high severity issue
- -8 per medium severity issue
- -3 per low severity issue

### Testing (0-100)
Directly from `@repolens/detectors`:
- Framework detected: +40
- Test files > 0: +30
- Test/source ratio >= 20%: +15
- Test/source ratio >= 40%: +15

### Maintenance (0-100)
- Base: 40
- +20 if git repo
- +10 if commits > 10
- +10 if contributors > 1
- +10 if commits in last 30 days
- +10 if commits in last 7 days

### Configuration (0-100)
- Base: 30
- +25 if CI/CD detected
- +15 if LICENSE exists
- +15 if README exists
- +15 if dependencies detected

## Grades

| Score Range | Grade       |
|-------------|-------------|
| 90-100      | Excellent   |
| 75-89       | Good        |
| 60-74       | Fair        |
| 40-59       | Needs Work  |
| 0-39        | Critical    |

## Overall Score

```
overall = codeQuality * 0.20
        + documentation * 0.15
        + security * 0.20
        + testing * 0.15
        + maintenance * 0.15
        + configuration * 0.15
```
