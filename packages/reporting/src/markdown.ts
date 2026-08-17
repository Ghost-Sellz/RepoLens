import { RepositoryAnalysis } from '@repolens/types';

export function generateMarkdown(analysis: RepositoryAnalysis): string {
  const lines: string[] = [];

  lines.push(`# Repository Analysis: ${analysis.name}`);
  lines.push('');
  lines.push(`*Analyzed on ${new Date(analysis.analyzedAt).toLocaleDateString()} in ${(analysis.duration / 1000).toFixed(2)}s*`);
  lines.push('');

  // Overview
  lines.push('## Overview');
  lines.push('');
  lines.push('| Metric | Value |');
  lines.push('|--------|-------|');
  lines.push(`| Files | ${analysis.files.total.toLocaleString()} |`);
  lines.push(`| Source Files | ${analysis.files.source.toLocaleString()} |`);
  lines.push(`| Binary Files | ${analysis.files.binary.toLocaleString()} |`);
  lines.push(`| Directories | ${analysis.files.directories.toLocaleString()} |`);
  lines.push(`| Total Lines | ${analysis.lines.total.toLocaleString()} |`);
  lines.push(`| Code Lines | ${analysis.lines.code.toLocaleString()} |`);
  lines.push(`| Blank Lines | ${analysis.lines.blank.toLocaleString()} |`);
  lines.push(`| Comment Lines | ${analysis.lines.comment.toLocaleString()} |`);
  lines.push(`| Total Size | ${formatBytes(analysis.files.totalBytes)} |`);
  lines.push('');

  // Health Score
  lines.push('## Health Score');
  lines.push('');
  lines.push(`**Overall: ${analysis.health.overall}/100 (${analysis.health.grade})**`);
  lines.push('');
  lines.push('| Category | Score |');
  lines.push('|----------|-------|');
  lines.push(`| Code Quality | ${analysis.health.codeQuality}/100 |`);
  lines.push(`| Documentation | ${analysis.health.documentation}/100 |`);
  lines.push(`| Security | ${analysis.health.security}/100 |`);
  lines.push(`| Testing | ${analysis.health.testing}/100 |`);
  lines.push(`| Maintenance | ${analysis.health.maintenance}/100 |`);
  lines.push(`| Configuration | ${analysis.health.configuration}/100 |`);
  lines.push('');

  // Languages
  if (analysis.languages.length > 0) {
    lines.push('## Languages');
    lines.push('');
    lines.push('| Language | Files | Lines | Percentage |');
    lines.push('|----------|-------|-------|------------|');
    for (const lang of analysis.languages.slice(0, 15)) {
      lines.push(`| ${lang.name} | ${lang.files} | ${lang.lines.toLocaleString()} | ${lang.percentage}% |`);
    }
    lines.push('');
  }

  // Frameworks
  if (analysis.frameworks.length > 0) {
    lines.push('## Detected Stack');
    lines.push('');
    for (const fw of analysis.frameworks) {
      lines.push(`- **${fw.name}** (${fw.confidence})`);
    }
    lines.push('');
  }

  // Dependencies
  if (analysis.dependencies) {
    lines.push('## Dependencies');
    lines.push('');
    lines.push(`- **Package Manager:** ${analysis.dependencies.manager}`);
    lines.push(`- **Total:** ${analysis.dependencies.total}`);
    lines.push(`- **Production:** ${analysis.dependencies.production}`);
    lines.push(`- **Dev:** ${analysis.dependencies.dev}`);
    lines.push('');
  }

  // Git
  if (analysis.git.isGitRepo) {
    lines.push('## Git Information');
    lines.push('');
    lines.push(`- **Branch:** ${analysis.git.currentBranch || 'N/A'}`);
    lines.push(`- **Commits:** ${analysis.git.totalCommits?.toLocaleString() || 'N/A'}`);
    lines.push(`- **Contributors:** ${analysis.git.contributors?.length || 0}`);
    if (analysis.git.commitFrequency) {
      lines.push(`- **Commits (7 days):** ${analysis.git.commitFrequency.last7Days}`);
      lines.push(`- **Commits (30 days):** ${analysis.git.commitFrequency.last30Days}`);
      lines.push(`- **Commits (90 days):** ${analysis.git.commitFrequency.last90Days}`);
    }
    lines.push('');
  }

  // Documentation
  lines.push('## Documentation');
  lines.push('');
  lines.push(`- **README:** ${analysis.documentation.hasReadme ? 'Yes' : 'No'}`);
  lines.push(`- **CONTRIBUTING:** ${analysis.documentation.hasContributing ? 'Yes' : 'No'}`);
  lines.push(`- **CODE_OF_CONDUCT:** ${analysis.documentation.hasCodeOfConduct ? 'Yes' : 'No'}`);
  lines.push(`- **SECURITY:** ${analysis.documentation.hasSecurity ? 'Yes' : 'No'}`);
  lines.push(`- **LICENSE:** ${analysis.documentation.hasLicense ? 'Yes' : 'No'}`);
  lines.push(`- **CHANGELOG:** ${analysis.documentation.hasChangelog ? 'Yes' : 'No'}`);
  lines.push(`- **Documentation Score:** ${analysis.documentation.score}/100`);
  lines.push('');

  // Testing
  lines.push('## Testing');
  lines.push('');
  lines.push(`- **Framework:** ${analysis.testing.framework || 'Not detected'}`);
  lines.push(`- **Test Files:** ${analysis.testing.testFiles}`);
  lines.push(`- **Test/Source Ratio:** ${analysis.testing.testSourceRatio}% (estimate)`);
  lines.push(`- **Score:** ${analysis.testing.score}/100`);
  lines.push('');

  // CI/CD
  if (analysis.cicd.detected.length > 0) {
    lines.push('## CI/CD');
    lines.push('');
    for (const tool of analysis.cicd.detected) {
      lines.push(`- ${tool}`);
    }
    lines.push('');
  }

  // Security
  if (analysis.security.length > 0) {
    lines.push('## Security Findings');
    lines.push('');
    for (const finding of analysis.security) {
      lines.push(`- **[${finding.severity.toUpperCase()}]** ${finding.message}${finding.file ? ` (${finding.file})` : ''}`);
    }
    lines.push('');
  }

  // Largest Files
  if (analysis.files.largest.length > 0) {
    lines.push('## Largest Files');
    lines.push('');
    lines.push('| File | Lines | Size |');
    lines.push('|------|-------|------|');
    for (const file of analysis.files.largest) {
      lines.push(`| \`${file.path}\` | ${file.lines.toLocaleString()} | ${formatBytes(file.size)} |`);
    }
    lines.push('');
  }

  // Recommendations
  if (analysis.recommendations.length > 0) {
    lines.push('## Recommendations');
    lines.push('');
    for (const rec of analysis.recommendations) {
      lines.push(`- **[${rec.priority}]** ${rec.message}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
