import * as fs from 'fs';
import * as path from 'path';
import { RepositoryAnalysis, FileStats, DirectoryStats, HealthScore, Recommendation, RepoConfig } from '@repolens/types';
import { detectLanguages, isBinaryFile } from '@repolens/detectors';
import { detectFrameworks } from '@repolens/detectors';
import { detectSecurityIssues } from '@repolens/detectors';
import { detectCICD } from '@repolens/detectors';
import { detectTesting } from '@repolens/detectors';
import { analyzeDocumentation } from '@repolens/detectors';
import { analyzeDependencies } from '@repolens/detectors';
import { analyzeGit } from '@repolens/github';

const LINE_COUNT_EXTENSIONS = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs',
  '.py', '.pyw', '.pyi',
  '.java', '.kt', '.kts',
  '.c', '.h', '.cpp', '.cxx', '.cc', '.hpp', '.hxx',
  '.cs', '.go', '.rs', '.rb', '.php',
  '.swift', '.dart',
  '.html', '.htm', '.vue', '.svelte',
  '.css', '.scss', '.sass', '.less',
  '.sh', '.bash', '.zsh', '.fish',
  '.sql', '.md', '.mdx',
  '.json', '.yml', '.yaml', '.xml', '.toml',
  '.r', '.R', '.lua', '.scala',
  '.ex', '.exs', '.hs', '.lhs',
  '.pl', '.pm', '.m', '.mm',
  '.tf', '.tfvars', '.proto', '.graphql', '.gql',
  '.makefile', '.mk',
]);

function countLines(content: string): { lines: number; blankLines: number; commentLines: number; codeLines: number } {
  const lines = content.split('\n');
  let blankLines = 0;
  let commentLines = 0;
  let codeLines = 0;

  let inBlockComment = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      blankLines++;
      continue;
    }

    if (inBlockComment) {
      commentLines++;
      if (trimmed.includes('*/')) {
        inBlockComment = false;
      }
      continue;
    }

    if (trimmed.startsWith('/*') || trimmed.startsWith('/**')) {
      commentLines++;
      if (!trimmed.includes('*/')) {
        inBlockComment = true;
      }
      continue;
    }

    if (
      trimmed.startsWith('//') ||
      trimmed.startsWith('#') ||
      trimmed.startsWith('--') ||
      trimmed.startsWith(';') ||
      trimmed.startsWith('*') ||
      trimmed.startsWith('"""') ||
      trimmed.startsWith("'''")
    ) {
      commentLines++;
      continue;
    }

    codeLines++;
  }

  return { lines: lines.length, blankLines, commentLines, codeLines };
}

export function scanDirectory(
  dirPath: string,
  config: RepoConfig,
  basePath?: string
): { files: FileStats[]; directories: Set<string>; allFilePaths: string[]; fileContents: Map<string, string> } {
  const root = basePath || dirPath;
  const files: FileStats[] = [];
  const directories = new Set<string>();
  const allFilePaths: string[] = [];
  const fileContents = new Map<string, string>();

  function walk(currentPath: string) {
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(currentPath, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);
      const relativePath = path.relative(root, fullPath).replace(/\\/g, '/');

      if (entry.isDirectory()) {
        const dirName = entry.name;
        if (config.ignore.includes(dirName)) {
          continue;
        }
        directories.add(relativePath);
        walk(fullPath);
        continue;
      }

      if (!entry.isFile()) continue;

      // Check if any parent dir is in ignore list
      const parts = relativePath.split('/');
      if (parts.some(p => config.ignore.includes(p))) continue;

      allFilePaths.push(relativePath);

      const ext = path.extname(entry.name).toLowerCase();
      const isBinary = isBinaryFile(fullPath);

      let size = 0;
      try {
        const stat = fs.statSync(fullPath);
        size = stat.size;
      } catch {
        continue;
      }

      // Skip huge binary files
      if (isBinary && size > 10 * 1024 * 1024) continue;

      const fileStats: FileStats = {
        path: relativePath,
        extension: ext,
        size,
        lines: 0,
        blankLines: 0,
        commentLines: 0,
        codeLines: 0,
        isBinary,
      };

      if (!isBinary && LINE_COUNT_EXTENSIONS.has(ext)) {
        try {
          const content = fs.readFileSync(fullPath, 'utf-8');
          const lineInfo = countLines(content);
          fileStats.lines = lineInfo.lines;
          fileStats.blankLines = lineInfo.blankLines;
          fileStats.commentLines = lineInfo.commentLines;
          fileStats.codeLines = lineInfo.codeLines;

          // Store content for detectors that need it (limit to reasonable size)
          if (content.length < 500000) {
            fileContents.set(relativePath, content);
          }
        } catch {
          // skip unreadable files
        }
      }

      files.push(fileStats);
    }
  }

  walk(dirPath);

  return { files, directories, allFilePaths, fileContents };
}

export function computeHealthScore(analysis: Partial<RepositoryAnalysis>): HealthScore {
  const codeQuality = computeCodeQualityScore(analysis);
  const documentation = analysis.documentation?.score || 0;
  const security = computeSecurityScore(analysis);
  const testing = analysis.testing?.score || 0;
  const maintenance = computeMaintenanceScore(analysis);
  const configuration = computeConfigurationScore(analysis);

  const overall = Math.round(
    codeQuality * 0.20 +
    documentation * 0.15 +
    security * 0.20 +
    testing * 0.15 +
    maintenance * 0.15 +
    configuration * 0.15
  );

  const grade: HealthScore['grade'] =
    overall >= 90 ? 'Excellent' :
    overall >= 75 ? 'Good' :
    overall >= 60 ? 'Fair' :
    overall >= 40 ? 'Needs Work' :
    'Critical';

  return { overall, grade, codeQuality, documentation, security, testing, maintenance, configuration };
}

function computeCodeQualityScore(analysis: Partial<RepositoryAnalysis>): number {
  let score = 50;

  if (analysis.languages && analysis.languages.length > 0) score += 15;
  if (analysis.files && analysis.files.total > 0) score += 10;
  if (analysis.files && analysis.files.total < 5000) score += 10;
  if (analysis.frameworks && analysis.frameworks.length > 0) score += 10;

  // Penalize huge files
  if (analysis.files?.largest) {
    const hugeFiles = analysis.files.largest.filter(f => f.lines > 1000);
    score -= hugeFiles.length * 3;
  }

  return Math.max(0, Math.min(100, score));
}

function computeSecurityScore(analysis: Partial<RepositoryAnalysis>): number {
  let score = 100;

  if (analysis.security) {
    const highIssues = analysis.security.filter(s => s.severity === 'high');
    const mediumIssues = analysis.security.filter(s => s.severity === 'medium');
    const lowIssues = analysis.security.filter(s => s.severity === 'low');

    score -= highIssues.length * 15;
    score -= mediumIssues.length * 8;
    score -= lowIssues.length * 3;
  }

  return Math.max(0, Math.min(100, score));
}

function computeMaintenanceScore(analysis: Partial<RepositoryAnalysis>): number {
  let score = 40;

  if (analysis.git?.isGitRepo) score += 20;
  if (analysis.git?.totalCommits && analysis.git.totalCommits > 10) score += 10;
  if (analysis.git?.contributors && analysis.git.contributors.length > 1) score += 10;
  if (analysis.git?.commitFrequency) {
    if (analysis.git.commitFrequency.last30Days > 0) score += 10;
    if (analysis.git.commitFrequency.last7Days > 0) score += 10;
  }

  return Math.max(0, Math.min(100, score));
}

function computeConfigurationScore(analysis: Partial<RepositoryAnalysis>): number {
  let score = 30;

  if (analysis.cicd?.detected && analysis.cicd.detected.length > 0) score += 25;
  if (analysis.documentation?.hasLicense) score += 15;
  if (analysis.documentation?.hasReadme) score += 15;
  if (analysis.dependencies) score += 15;

  return Math.max(0, Math.min(100, score));
}

export function generateRecommendations(analysis: RepositoryAnalysis): Recommendation[] {
  const recs: Recommendation[] = [];

  // Documentation
  if (!analysis.documentation.hasLicense) {
    recs.push({ priority: 'HIGH', category: 'Documentation', message: 'Add a LICENSE file to clarify usage terms.' });
  }
  if (!analysis.documentation.hasReadme) {
    recs.push({ priority: 'HIGH', category: 'Documentation', message: 'Add a README.md with project overview and usage instructions.' });
  }
  if (!analysis.documentation.hasContributing) {
    recs.push({ priority: 'MEDIUM', category: 'Documentation', message: 'Add CONTRIBUTING.md with contribution guidelines.' });
  }
  if (!analysis.documentation.hasSecurity) {
    recs.push({ priority: 'MEDIUM', category: 'Documentation', message: 'Add SECURITY.md with security policy and vulnerability reporting instructions.' });
  }
  if (!analysis.documentation.hasChangelog) {
    recs.push({ priority: 'LOW', category: 'Documentation', message: 'Consider adding a CHANGELOG.md to track version changes.' });
  }

  // Testing
  if (analysis.testing.testFiles === 0) {
    recs.push({ priority: 'HIGH', category: 'Testing', message: 'Add automated tests to improve code reliability.' });
  } else if (analysis.testing.testSourceRatio < 20) {
    recs.push({ priority: 'MEDIUM', category: 'Testing', message: 'Increase test coverage — current test/source ratio is low.' });
  }

  // Security
  const highSecurityIssues = analysis.security.filter(s => s.severity === 'high');
  for (const issue of highSecurityIssues) {
    recs.push({ priority: 'HIGH', category: 'Security', message: issue.message });
  }

  // Large files
  const largeFiles = analysis.files.largest.filter(f => f.lines > 500);
  if (largeFiles.length > 0) {
    recs.push({ priority: 'LOW', category: 'Code Quality', message: `Consider splitting large files (${largeFiles.length} files over 500 lines).` });
  }

  // CI/CD
  if (analysis.cicd.detected.length === 0) {
    recs.push({ priority: 'MEDIUM', category: 'CI/CD', message: 'Add CI/CD configuration for automated testing and deployment.' });
  }

  // .gitignore
  if (!analysis.security.some(f => f.category === 'Configuration' && f.message.includes('.gitignore'))) {
    // This is handled by security detector
  }

  return recs;
}

export function analyzeRepository(
  repoPath: string,
  config: RepoConfig
): RepositoryAnalysis {
  const startTime = Date.now();
  const repoName = path.basename(repoPath);

  const { files, directories, allFilePaths, fileContents } = scanDirectory(repoPath, config);

  const totalFiles = files.length;
  const sourceFiles = files.filter(f => !f.isBinary).length;
  const binaryFiles = files.filter(f => f.isBinary).length;
  const totalBytes = files.reduce((sum, f) => sum + f.size, 0);

  const totalLines = files.reduce((sum, f) => sum + f.lines, 0);
  const blankLines = files.reduce((sum, f) => sum + f.blankLines, 0);
  const commentLines = files.reduce((sum, f) => sum + f.commentLines, 0);
  const codeLines = files.reduce((sum, f) => sum + f.codeLines, 0);

  const largestFiles = [...files]
    .sort((a, b) => b.lines - a.lines)
    .slice(0, 10);

  const languages = detectLanguages(
    files.filter(f => !f.isBinary).map(f => ({
      extension: f.extension,
      lines: f.lines,
      codeLines: f.codeLines,
      blankLines: f.blankLines,
      commentLines: f.commentLines,
    }))
  );

  const largestDirectories = computeDirectoryStats(files, directories);

  let frameworks: ReturnType<typeof detectFrameworks> = [];
  if (!config.deep || true) {
    frameworks = detectFrameworks(allFilePaths, fileContents);
  }

  const dependencies = config.dependencies.enabled ? analyzeDependencies(repoPath, allFilePaths) : null;

  const git = config.git.enabled ? analyzeGit(repoPath) : { isGitRepo: false };

  const documentation = analyzeDocumentation(allFilePaths, fileContents);

  const testing = detectTesting(allFilePaths, fileContents);

  const cicd = detectCICD(allFilePaths);

  const security = config.security.enabled ? detectSecurityIssues(allFilePaths, fileContents) : [];

  const partialAnalysis: Partial<RepositoryAnalysis> = {
    files: { total: totalFiles, source: sourceFiles, binary: binaryFiles, directories: directories.size, totalBytes, largest: largestFiles },
    languages,
    frameworks,
    dependencies,
    git,
    documentation,
    testing,
    cicd,
    security,
  };

  const health = computeHealthScore(partialAnalysis);

  const duration = Date.now() - startTime;

  const analysis: RepositoryAnalysis = {
    name: repoName,
    path: repoPath,
    analyzedAt: new Date().toISOString(),
    duration,
    files: { total: totalFiles, source: sourceFiles, binary: binaryFiles, directories: directories.size, totalBytes, largest: largestFiles },
    lines: { total: totalLines, code: codeLines, blank: blankLines, comment: commentLines },
    languages,
    largestDirectories,
    frameworks,
    dependencies,
    git,
    documentation,
    testing,
    cicd,
    security,
    health,
    recommendations: [],
  };

  analysis.recommendations = generateRecommendations(analysis);

  return analysis;
}

function computeDirectoryStats(files: FileStats[], directories: Set<string>): DirectoryStats[] {
  const dirMap = new Map<string, DirectoryStats>();

  for (const file of files) {
    const parts = file.path.split('/');
    if (parts.length > 1) {
      const dir = parts.slice(0, -1).join('/');
      if (!dirMap.has(dir)) {
        dirMap.set(dir, { path: dir, fileCount: 0, totalSize: 0, totalLines: 0 });
      }
      const stats = dirMap.get(dir)!;
      stats.fileCount++;
      stats.totalSize += file.size;
      stats.totalLines += file.lines;
    }
  }

  return [...dirMap.values()]
    .sort((a, b) => b.totalSize - a.totalSize)
    .slice(0, 10);
}
