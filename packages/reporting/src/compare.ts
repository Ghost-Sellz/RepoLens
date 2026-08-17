import { ComparisonResult, ComparisonDiff } from '@repolens/types';
import { RepositoryAnalysis } from '@repolens/types';

export function compareRepositories(
  repoA: RepositoryAnalysis,
  repoB: RepositoryAnalysis
): ComparisonResult {
  const differences: ComparisonDiff[] = [];

  const addDiff = (field: string, a: string | number, b: string | number) => {
    const numA = typeof a === 'string' ? parseFloat(a) || 0 : a;
    const numB = typeof b === 'string' ? parseFloat(b) || 0 : b;
    const diff = numA - numB;
    differences.push({
      field,
      repoAValue: a,
      repoBValue: b,
      difference: diff > 0 ? `+${diff}` : diff < 0 ? `${diff}` : '0',
    });
  };

  addDiff('Files', repoA.files.total, repoB.files.total);
  addDiff('Lines', repoA.lines.total, repoB.lines.total);
  addDiff('Source Files', repoA.files.source, repoB.files.source);
  addDiff('Dependencies', repoA.dependencies?.total || 0, repoB.dependencies?.total || 0);
  addDiff('Health Score', repoA.health.overall, repoB.health.overall);
  addDiff('Test Files', repoA.testing.testFiles, repoB.testing.testFiles);
  addDiff('Languages', repoA.languages.length, repoB.languages.length);
  addDiff('Frameworks', repoA.frameworks.length, repoB.frameworks.length);
  addDiff('Security Findings', repoA.security.length, repoB.security.length);
  addDiff('Documentation Score', repoA.documentation.score, repoB.documentation.score);
  if (repoA.git.totalCommits && repoB.git.totalCommits) {
    addDiff('Commits', repoA.git.totalCommits, repoB.git.totalCommits);
  }
  if (repoA.git.contributors && repoB.git.contributors) {
    addDiff('Contributors', repoA.git.contributors.length, repoB.git.contributors.length);
  }

  return { repoA, repoB, differences };
}

export function formatComparison(result: ComparisonResult): string {
  const { repoA, repoB, differences } = result;
  const lines: string[] = [];

  lines.push('');
  lines.push('Repository Comparison');
  lines.push('─'.repeat(60));
  lines.push('');
  lines.push(padRight('', 24) + padRight(repoA.name, 16) + padRight(repoB.name, 16));
  lines.push('─'.repeat(60));

  for (const diff of differences) {
    const valA = typeof diff.repoAValue === 'number'
      ? diff.repoAValue.toLocaleString()
      : String(diff.repoAValue);
    const valB = typeof diff.repoBValue === 'number'
      ? diff.repoBValue.toLocaleString()
      : String(diff.repoBValue);

    lines.push(padRight(diff.field, 24) + padRight(valA, 16) + padRight(valB, 16));
  }

  lines.push('');
  return lines.join('\n');
}

function padRight(text: string, width: number): string {
  return text + ' '.repeat(Math.max(0, width - text.length));
}
