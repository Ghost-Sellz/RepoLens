import { execSync } from 'child_process';
import { GitInfo, Contributor, GitCommit, CommitFrequency } from '@repolens/types';
import * as fs from 'fs';
import * as path from 'path';

export function analyzeGit(repoPath: string): GitInfo {
  const gitDir = path.join(repoPath, '.git');

  if (!fs.existsSync(gitDir)) {
    return { isGitRepo: false };
  }

  try {
    const currentBranch = gitExec('branch --show-current', repoPath);
    const totalCommits = parseInt(gitExec('rev-list --count HEAD', repoPath)) || 0;
    const contributors = getContributors(repoPath);
    const firstCommit = getFirstCommit(repoPath);
    const latestCommit = getLatestCommit(repoPath);
    const commitFrequency = getCommitFrequency(repoPath);
    const branches = getBranches(repoPath);
    const tags = getTags(repoPath);
    const repoAge = getRepoAge(firstCommit);
    const uncommittedChanges = getUncommittedChanges(repoPath);
    const trackedFiles = getTrackedFiles(repoPath);

    return {
      isGitRepo: true,
      currentBranch,
      totalCommits,
      contributors,
      firstCommit,
      latestCommit,
      commitFrequency,
      branches,
      tags,
      repoAge,
      uncommittedChanges,
      trackedFiles,
    };
  } catch {
    return { isGitRepo: true };
  }
}

function gitExec(command: string, cwd: string): string {
  try {
    return execSync(`git ${command}`, { cwd, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  } catch {
    return '';
  }
}

function getContributors(repoPath: string): Contributor[] {
  try {
    const raw = gitExec('shortlog -sn --no-merges HEAD', repoPath);
    if (!raw) return [];

    return raw.split('\n').slice(0, 20).map(line => {
      const match = line.trim().match(/^(\d+)\s+(.+)$/);
      return match
        ? { name: match[2], email: '', commits: parseInt(match[1]) }
        : { name: line.trim(), email: '', commits: 0 };
    }).filter(c => c.name);
  } catch {
    return [];
  }
}

function getFirstCommit(repoPath: string): GitCommit | undefined {
  try {
    const hash = gitExec('rev-list --max-parents=0 HEAD', repoPath);
    if (!hash) return undefined;
    return getCommitInfo(hash.split('\n')[0], repoPath);
  } catch {
    return undefined;
  }
}

function getLatestCommit(repoPath: string): GitCommit | undefined {
  try {
    return getCommitInfo('HEAD', repoPath);
  } catch {
    return undefined;
  }
}

function getCommitInfo(ref: string, repoPath: string): GitCommit | undefined {
  try {
    const format = '%H|%an|%ae|%ai|%s';
    const raw = gitExec(`log -1 --format="${format}" ${ref}`, repoPath);
    if (!raw) return undefined;
    const parts = raw.split('|');
    if (parts.length < 5) return undefined;
    return {
      hash: parts[0],
      author: parts[1],
      date: parts[3],
      message: parts[4],
    };
  } catch {
    return undefined;
  }
}

function getCommitFrequency(repoPath: string): CommitFrequency {
  const count = (since: string): number => {
    try {
      const raw = gitExec(`rev-list --count --since="${since}" HEAD`, repoPath);
      return parseInt(raw) || 0;
    } catch {
      return 0;
    }
  };

  return {
    last7Days: count('7 days ago'),
    last30Days: count('30 days ago'),
    last90Days: count('90 days ago'),
  };
}

function getBranches(repoPath: string): string[] {
  try {
    const raw = gitExec('branch --format=%(refname:short)', repoPath);
    return raw.split('\n').filter(b => b.trim());
  } catch {
    return [];
  }
}

function getTags(repoPath: string): string[] {
  try {
    const raw = gitExec('tag --sort=-version:refname', repoPath);
    return raw.split('\n').filter(t => t.trim()).slice(0, 20);
  } catch {
    return [];
  }
}

function getRepoAge(firstCommit?: GitCommit): number | undefined {
  if (!firstCommit?.date) return undefined;
  const created = new Date(firstCommit.date);
  const now = new Date();
  return Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
}

function getUncommittedChanges(repoPath: string): number {
  try {
    const raw = gitExec('status --porcelain', repoPath);
    return raw ? raw.split('\n').filter(l => l.trim()).length : 0;
  } catch {
    return 0;
  }
}

function getTrackedFiles(repoPath: string): number {
  try {
    const raw = gitExec('ls-files', repoPath);
    return raw ? raw.split('\n').filter(l => l.trim()).length : 0;
  } catch {
    return 0;
  }
}
