import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import * as os from 'os';

export interface GitHubRepoInfo {
  owner: string;
  repo: string;
}

export function parseGitHubUrl(url: string): GitHubRepoInfo | null {
  const patterns = [
    /github\.com[/:]([^/]+)\/([^/]+?)(?:\.git)?(?:\/)?$/,
    /github\.com\/([^/]+)\/([^/]+)$/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return { owner: match[1], repo: match[2].replace('.git', '') };
    }
  }

  return null;
}

export function isGitHubUrl(input: string): boolean {
  return input.includes('github.com');
}

export function isGitUrl(input: string): boolean {
  return input.endsWith('.git') || input.startsWith('git@');
}

export function cloneRepository(url: string, destDir: string): string {
  const repoName = url.split('/').pop()?.replace('.git', '') || 'repo';
  const targetDir = path.join(destDir, repoName);

  try {
    execSync(`git clone --depth 50 "${url}" "${targetDir}"`, {
      stdio: 'pipe',
      timeout: 120000,
    });
    return targetDir;
  } catch (error) {
    throw new Error(`Failed to clone repository: ${url}\n${error}`);
  }
}

export function createTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'repolens-'));
}

export function cleanupTempDir(dir: string): void {
  try {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  } catch {
    // best effort cleanup
  }
}

export function resolveTarget(input: string): { path: string; isTemp: boolean; cleanup?: () => void } {
  // Local path
  if (!isGitHubUrl(input) && !isGitUrl(input)) {
    const resolved = path.resolve(input);
    if (!fs.existsSync(resolved)) {
      throw new Error(`Path does not exist: ${resolved}`);
    }
    return { path: resolved, isTemp: false };
  }

  // GitHub URL or git URL
  const tempDir = createTempDir();
  const clonedPath = cloneRepository(input, tempDir);

  return {
    path: clonedPath,
    isTemp: true,
    cleanup: () => cleanupTempDir(tempDir),
  };
}

export { analyzeGit } from './git';
