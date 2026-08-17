import * as fs from 'fs';
import * as path from 'path';
import { RepoConfig } from '@repolens/types';

const DEFAULT_CONFIG: RepoConfig = {
  ignore: [
    'node_modules',
    '.git',
    '.next',
    'dist',
    'build',
    'coverage',
    'target',
    'vendor',
    '.cache',
    '__pycache__',
    '.venv',
    'venv',
    '.idea',
    '.vscode',
    'tmp',
    '.turbo',
    '.nuxt',
    '.output',
    'out',
  ],
  security: { enabled: true },
  git: { enabled: true },
  dependencies: { enabled: true },
  history: { enabled: true },
  deep: false,
};

export function loadConfig(repoPath: string): RepoConfig {
  const configPath = path.join(repoPath, '.repolens.json');

  if (fs.existsSync(configPath)) {
    try {
      const raw = fs.readFileSync(configPath, 'utf-8');
      const userConfig = JSON.parse(raw);
      return mergeConfig(DEFAULT_CONFIG, userConfig);
    } catch {
      return { ...DEFAULT_CONFIG };
    }
  }

  return { ...DEFAULT_CONFIG };
}

function mergeConfig(defaults: RepoConfig, user: Partial<RepoConfig>): RepoConfig {
  return {
    ignore: user.ignore ?? defaults.ignore,
    security: { ...defaults.security, ...user.security },
    git: { ...defaults.git, ...user.git },
    dependencies: { ...defaults.dependencies, ...user.dependencies },
    history: { ...defaults.history, ...user.history },
    deep: user.deep ?? defaults.deep,
    output: user.output ?? defaults.output,
  };
}

export { DEFAULT_CONFIG };
