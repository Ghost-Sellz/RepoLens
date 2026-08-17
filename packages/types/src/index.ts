export interface RepoConfig {
  ignore: string[];
  security: { enabled: boolean };
  git: { enabled: boolean };
  dependencies: { enabled: boolean };
  history: { enabled: boolean };
  deep: boolean;
  output?: string;
}

export interface FileStats {
  path: string;
  extension: string;
  size: number;
  lines: number;
  blankLines: number;
  commentLines: number;
  codeLines: number;
  isBinary: boolean;
}

export interface LanguageStats {
  name: string;
  extension: string;
  files: number;
  lines: number;
  codeLines: number;
  blankLines: number;
  commentLines: number;
  percentage: number;
  color: string;
}

export interface DirectoryStats {
  path: string;
  fileCount: number;
  totalSize: number;
  totalLines: number;
}

export interface Framework {
  name: string;
  confidence: 'high' | 'medium' | 'low';
  evidence: string[];
}

export interface DependencyInfo {
  manager: string;
  total: number;
  dev: number;
  production: number;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
}

export interface GitInfo {
  isGitRepo: boolean;
  currentBranch?: string;
  totalCommits?: number;
  contributors?: Contributor[];
  firstCommit?: GitCommit;
  latestCommit?: GitCommit;
  commitFrequency?: CommitFrequency;
  branches?: string[];
  tags?: string[];
  repoAge?: number;
  uncommittedChanges?: number;
  trackedFiles?: number;
}

export interface Contributor {
  name: string;
  email: string;
  commits: number;
}

export interface GitCommit {
  hash: string;
  author: string;
  date: string;
  message: string;
}

export interface CommitFrequency {
  last7Days: number;
  last30Days: number;
  last90Days: number;
}

export interface DocumentationScore {
  score: number;
  hasReadme: boolean;
  hasContributing: boolean;
  hasCodeOfConduct: boolean;
  hasSecurity: boolean;
  hasLicense: boolean;
  hasChangelog: boolean;
  hasDocs: boolean;
  readmeSize: number;
}

export interface TestingInfo {
  framework: string | null;
  testFiles: number;
  testSourceRatio: number;
  score: number;
}

export interface CICDInfo {
  detected: string[];
  hasAutomatedTests: boolean;
  hasDocker: boolean;
  hasDeploymentConfig: boolean;
}

export interface SecurityFinding {
  type: 'warning' | 'info' | 'potential-issue';
  category: string;
  message: string;
  file?: string;
  line?: number;
  severity: 'low' | 'medium' | 'high';
}

export interface HealthScore {
  overall: number;
  grade: 'Critical' | 'Needs Work' | 'Fair' | 'Good' | 'Excellent';
  codeQuality: number;
  documentation: number;
  security: number;
  testing: number;
  maintenance: number;
  configuration: number;
}

export interface Recommendation {
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  category: string;
  message: string;
}

export interface RepositoryAnalysis {
  name: string;
  path: string;
  analyzedAt: string;
  duration: number;
  files: {
    total: number;
    source: number;
    binary: number;
    directories: number;
    totalBytes: number;
    largest: FileStats[];
  };
  lines: {
    total: number;
    code: number;
    blank: number;
    comment: number;
  };
  languages: LanguageStats[];
  largestDirectories: DirectoryStats[];
  frameworks: Framework[];
  dependencies: DependencyInfo | null;
  git: GitInfo;
  documentation: DocumentationScore;
  testing: TestingInfo;
  cicd: CICDInfo;
  security: SecurityFinding[];
  health: HealthScore;
  recommendations: Recommendation[];
}

export interface ComparisonResult {
  repoA: RepositoryAnalysis;
  repoB: RepositoryAnalysis;
  differences: ComparisonDiff[];
}

export interface ComparisonDiff {
  field: string;
  repoAValue: string | number;
  repoBValue: string | number;
  difference: string;
}

export type OutputFormat = 'terminal' | 'json' | 'markdown' | 'html';

export interface CLIOptions {
  format: OutputFormat;
  output?: string;
  noGit: boolean;
  noDependencies: boolean;
  noSecurity: boolean;
  noHistory: boolean;
  deep: boolean;
  quiet: boolean;
  verbose: boolean;
}
