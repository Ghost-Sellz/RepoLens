import { DependencyInfo } from '@repolens/types';
import * as fs from 'fs';
import * as path from 'path';

export function analyzeDependencies(repoPath: string, filePaths: string[]): DependencyInfo | null {
  const packageJsonPath = path.join(repoPath, 'package.json');
  if (filePaths.includes('package.json') || fs.existsSync(packageJsonPath)) {
    try {
      const content = fs.readFileSync(packageJsonPath, 'utf-8');
      const pkg = JSON.parse(content);
      const deps = pkg.dependencies || {};
      const devDeps = pkg.devDependencies || {};
      return {
        manager: detectPackageManager(filePaths),
        total: Object.keys(deps).length + Object.keys(devDeps).length,
        dev: Object.keys(devDeps).length,
        production: Object.keys(deps).length,
        dependencies: deps,
        devDependencies: devDeps,
      };
    } catch {
      // ignore
    }
  }

  if (filePaths.includes('requirements.txt')) {
    return analyzeRequirementsTxt(repoPath);
  }

  if (filePaths.includes('pyproject.toml')) {
    return analyzePyproject(repoPath);
  }

  if (filePaths.includes('Cargo.toml')) {
    return analyzeCargo(repoPath);
  }

  if (filePaths.includes('go.mod')) {
    return analyzeGoMod(repoPath);
  }

  if (filePaths.includes('Gemfile')) {
    return analyzeGemfile(repoPath);
  }

  if (filePaths.includes('composer.json')) {
    return analyzeComposer(repoPath);
  }

  return null;
}

function detectPackageManager(filePaths: string[]): string {
  if (filePaths.includes('pnpm-lock.yaml')) return 'pnpm';
  if (filePaths.includes('yarn.lock')) return 'yarn';
  if (filePaths.includes('package-lock.json')) return 'npm';
  return 'unknown';
}

function analyzeRequirementsTxt(repoPath: string): DependencyInfo {
  try {
    const content = fs.readFileSync(path.join(repoPath, 'requirements.txt'), 'utf-8');
    const lines = content.split('\n').filter(l => l.trim() && !l.startsWith('#'));
    const deps: Record<string, string> = {};
    for (const line of lines) {
      const match = line.match(/^([a-zA-Z0-9_-]+)\s*[=<>!~]/);
      if (match) {
        deps[match[1]] = line.trim();
      }
    }
    return {
      manager: 'pip',
      total: Object.keys(deps).length,
      dev: 0,
      production: Object.keys(deps).length,
      dependencies: deps,
      devDependencies: {},
    };
  } catch {
    return { manager: 'pip', total: 0, dev: 0, production: 0, dependencies: {}, devDependencies: {} };
  }
}

function analyzePyproject(repoPath: string): DependencyInfo {
  try {
    const content = fs.readFileSync(path.join(repoPath, 'pyproject.toml'), 'utf-8');
    const deps: Record<string, string> = {};
    const devDeps: Record<string, string> = {};

    const depSection = content.match(/\[project\]\s*dependencies\s*=\s*\[([\s\S]*?)\]/);
    if (depSection) {
      const matches = depSection[1].matchAll(/"([a-zA-Z0-9_-]+)/g);
      for (const m of matches) {
        deps[m[1]] = '*';
      }
    }

    return {
      manager: 'poetry/pdm',
      total: Object.keys(deps).length + Object.keys(devDeps).length,
      dev: Object.keys(devDeps).length,
      production: Object.keys(deps).length,
      dependencies: deps,
      devDependencies: devDeps,
    };
  } catch {
    return { manager: 'poetry/pdm', total: 0, dev: 0, production: 0, dependencies: {}, devDependencies: {} };
  }
}

function analyzeCargo(repoPath: string): DependencyInfo {
  try {
    const content = fs.readFileSync(path.join(repoPath, 'Cargo.toml'), 'utf-8');
    const deps: Record<string, string> = {};
    const devDeps: Record<string, string> = {};

    const depSection = content.match(/\[dependencies\]\s*([\s\S]*?)(?:\[|$)/);
    if (depSection) {
      const matches = depSection[1].matchAll(/^(\w+)\s*=/gm);
      for (const m of matches) {
        deps[m[1]] = '*';
      }
    }

    const devSection = content.match(/\[dev-dependencies\]\s*([\s\S]*?)(?:\[|$)/);
    if (devSection) {
      const matches = devSection[1].matchAll(/^(\w+)\s*=/gm);
      for (const m of matches) {
        devDeps[m[1]] = '*';
      }
    }

    return {
      manager: 'cargo',
      total: Object.keys(deps).length + Object.keys(devDeps).length,
      dev: Object.keys(devDeps).length,
      production: Object.keys(deps).length,
      dependencies: deps,
      devDependencies: devDeps,
    };
  } catch {
    return { manager: 'cargo', total: 0, dev: 0, production: 0, dependencies: {}, devDependencies: {} };
  }
}

function analyzeGoMod(repoPath: string): DependencyInfo {
  try {
    const content = fs.readFileSync(path.join(repoPath, 'go.mod'), 'utf-8');
    const deps: Record<string, string> = {};
    const matches = content.matchAll(/^\t([\w./-]+)\s+(v[\w.]+)/gm);
    for (const m of matches) {
      deps[m[1]] = m[2];
    }
    return {
      manager: 'go modules',
      total: Object.keys(deps).length,
      dev: 0,
      production: Object.keys(deps).length,
      dependencies: deps,
      devDependencies: {},
    };
  } catch {
    return { manager: 'go modules', total: 0, dev: 0, production: 0, dependencies: {}, devDependencies: {} };
  }
}

function analyzeGemfile(repoPath: string): DependencyInfo {
  try {
    const content = fs.readFileSync(path.join(repoPath, 'Gemfile'), 'utf-8');
    const deps: Record<string, string> = {};
    const matches = content.matchAll(/gem\s+["']([^"']+)["']/g);
    for (const m of matches) {
      deps[m[1]] = '*';
    }
    return {
      manager: 'bundler',
      total: Object.keys(deps).length,
      dev: 0,
      production: Object.keys(deps).length,
      dependencies: deps,
      devDependencies: {},
    };
  } catch {
    return { manager: 'bundler', total: 0, dev: 0, production: 0, dependencies: {}, devDependencies: {} };
  }
}

function analyzeComposer(repoPath: string): DependencyInfo {
  try {
    const content = fs.readFileSync(path.join(repoPath, 'composer.json'), 'utf-8');
    const pkg = JSON.parse(content);
    const deps = pkg.require || {};
    const devDeps = pkg['require-dev'] || {};
    return {
      manager: 'composer',
      total: Object.keys(deps).length + Object.keys(devDeps).length,
      dev: Object.keys(devDeps).length,
      production: Object.keys(deps).length,
      dependencies: deps,
      devDependencies: devDeps,
    };
  } catch {
    return { manager: 'composer', total: 0, dev: 0, production: 0, dependencies: {}, devDependencies: {} };
  }
}
