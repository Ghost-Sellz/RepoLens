import { DocumentationScore } from '@repolens/types';

const REQUIRED_FILES = ['README.md', 'readme.md', 'Readme.md'];
const CONTRIBUTING_FILES = ['CONTRIBUTING.md', 'contributing.md'];
const CODE_OF_CONDUCT_FILES = ['CODE_OF_CONDUCT.md', 'code_of_conduct.md'];
const SECURITY_FILES = ['SECURITY.md', 'security.md'];
const LICENSE_FILES = ['LICENSE', 'LICENSE.md', 'LICENSE.txt', 'LICENCE', 'LICENCE.md', 'COPYING'];
const CHANGELOG_FILES = ['CHANGELOG.md', 'changelog.md', 'CHANGES.md', 'HISTORY.md'];

export function analyzeDocumentation(
  filePaths: string[],
  fileContents: Map<string, string>
): DocumentationScore {
  const hasAny = (patterns: string[]) =>
    patterns.some(p => filePaths.includes(p) || filePaths.some(f => f.endsWith('/' + p)));

  const getFileSize = (name: string): number => {
    for (const p of REQUIRED_FILES) {
      const content = fileContents.get(p);
      if (content) return content.length;
    }
    return 0;
  };

  const hasReadme = hasAny(REQUIRED_FILES);
  const hasContributing = hasAny(CONTRIBUTING_FILES);
  const hasCodeOfConduct = hasAny(CODE_OF_CONDUCT_FILES);
  const hasSecurity = hasAny(SECURITY_FILES);
  const hasLicense = hasAny(LICENSE_FILES);
  const hasChangelog = hasAny(CHANGELOG_FILES);
  const hasDocs = filePaths.some(f => f.startsWith('docs/') || f.startsWith('doc/'));
  const readmeSize = getFileSize('README.md');

  let score = 0;
  if (hasReadme) score += 30;
  if (hasReadme && readmeSize > 500) score += 10;
  if (hasContributing) score += 15;
  if (hasCodeOfConduct) score += 10;
  if (hasSecurity) score += 10;
  if (hasLicense) score += 15;
  if (hasChangelog) score += 5;
  if (hasDocs) score += 5;

  return {
    score: Math.min(score, 100),
    hasReadme,
    hasContributing,
    hasCodeOfConduct,
    hasSecurity,
    hasLicense,
    hasChangelog,
    hasDocs,
    readmeSize,
  };
}
