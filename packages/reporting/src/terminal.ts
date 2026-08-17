import { RepositoryAnalysis } from '@repolens/types';

export function generateTerminal(analysis: RepositoryAnalysis): string {
  const lines: string[] = [];

  const hr = '─'.repeat(56);

  lines.push('');
  lines.push('╭' + '─'.repeat(56) + '╮');
  lines.push('│' + centerText('RepoLens', 56) + '│');
  lines.push('│' + centerText('Repository Intelligence', 56) + '│');
  lines.push('╰' + '─'.repeat(56) + '╯');
  lines.push('');

  lines.push('Repository');
  lines.push(hr);
  lines.push(padRight('Name', 16) + analysis.name);
  lines.push(padRight('Languages', 16) + analysis.languages.slice(0, 5).map(l => l.name).join(', '));
  lines.push(padRight('Files', 16) + analysis.files.total.toLocaleString());
  lines.push(padRight('Lines', 16) + analysis.lines.total.toLocaleString());
  if (analysis.dependencies) {
    lines.push(padRight('Dependencies', 16) + analysis.dependencies.total.toLocaleString());
  }
  if (analysis.git.isGitRepo && analysis.git.contributors) {
    lines.push(padRight('Contributors', 16) + analysis.git.contributors.length.toString());
  }
  if (analysis.git.totalCommits) {
    lines.push(padRight('Commits', 16) + analysis.git.totalCommits.toLocaleString());
  }
  lines.push('');

  lines.push('Health Score');
  lines.push(hr);
  const filled = Math.round(analysis.health.overall / 5);
  const empty = 20 - filled;
  lines.push('█'.repeat(filled) + '░'.repeat(empty) + '  ' + analysis.health.overall + '/100');
  lines.push('');
  lines.push(padRight('Code Quality', 20) + analysis.health.codeQuality);
  lines.push(padRight('Documentation', 20) + analysis.health.documentation);
  lines.push(padRight('Security', 20) + analysis.health.security);
  lines.push(padRight('Testing', 20) + analysis.health.testing);
  lines.push(padRight('Maintenance', 20) + analysis.health.maintenance);
  lines.push(padRight('Configuration', 20) + analysis.health.configuration);
  lines.push('');

  if (analysis.languages.length > 0) {
    lines.push('Languages');
    lines.push(hr);
    for (const lang of analysis.languages.slice(0, 8)) {
      const barLen = Math.round(lang.percentage / 5);
      const bar = '█'.repeat(barLen) + ' '.repeat(20 - barLen);
      lines.push(padRight(lang.name, 14) + bar + ' ' + lang.percentage + '%');
    }
    lines.push('');
  }

  if (analysis.files.largest.length > 0) {
    lines.push('Largest Files');
    lines.push(hr);
    analysis.files.largest.slice(0, 5).forEach((f, i) => {
      lines.push(`${i + 1}. ${padRight(f.path, 40)} ${f.lines.toLocaleString()} lines`);
    });
    lines.push('');
  }

  if (analysis.frameworks.length > 0) {
    lines.push('Detected Stack');
    lines.push(hr);
    for (const fw of analysis.frameworks) {
      lines.push('✓ ' + fw.name);
    }
    lines.push('');
  }

  const warnings = analysis.recommendations.filter(r => r.priority === 'HIGH' || r.priority === 'MEDIUM');
  if (warnings.length > 0) {
    lines.push('Warnings');
    lines.push(hr);
    for (const w of warnings.slice(0, 5)) {
      lines.push('⚠ ' + w.message);
    }
    lines.push('');
  }

  lines.push('Analysis completed in ' + (analysis.duration / 1000).toFixed(2) + 's');
  lines.push('');

  return lines.join('\n');
}

function centerText(text: string, width: number): string {
  const padding = Math.max(0, Math.floor((width - text.length) / 2));
  return ' '.repeat(padding) + text + ' '.repeat(width - padding - text.length);
}

function padRight(text: string, width: number): string {
  return text + ' '.repeat(Math.max(0, width - text.length));
}
