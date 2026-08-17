#!/usr/bin/env node
import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { analyzeRepository } from '@repolens/analyzer';
import { loadConfig } from '@repolens/config';
import { resolveTarget } from '@repolens/github';
import { generateJSON, generateMarkdown, generateHTML, generateTerminal } from '@repolens/reporting';
import { CLIOptions, RepositoryAnalysis } from '@repolens/types';

const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf-8'));

const program = new Command();

program
  .name('repolens')
  .description('RepoLens — Repository Intelligence')
  .version(pkg.version || '1.0.0');

function handleError(message: string, details?: string, tip?: string): never {
  console.error('');
  console.error('  ✖ ' + message);
  if (details) {
    console.error('');
    console.error('  Reason: ' + details);
  }
  if (tip) {
    console.error('');
    console.error('  Tip: ' + tip);
  }
  console.error('');
  process.exit(1);
}

function runAnalysis(target: string, options: CLIOptions): RepositoryAnalysis {
  let resolved;
  try {
    resolved = resolveTarget(target);
  } catch (error) {
    handleError(
      'Could not access repository.',
      error instanceof Error ? error.message : String(error),
      'Check the path or URL and try again.'
    );
  }

  const repoPath = resolved.path;

  if (!fs.existsSync(repoPath)) {
    handleError(
      'Path does not exist.',
      `The specified path does not exist: ${repoPath}`,
      'Check the path and try again.'
    );
  }

  const config = loadConfig(repoPath);
  if (options.noGit) config.git.enabled = false;
  if (options.noDependencies) config.dependencies.enabled = false;
  if (options.noSecurity) config.security.enabled = false;
  if (options.deep) config.deep = true;

  let analysis: RepositoryAnalysis;
  try {
    analysis = analyzeRepository(repoPath, config);
  } catch (error) {
    handleError(
      'Failed to analyze repository.',
      error instanceof Error ? error.message : String(error),
      'Ensure the path is accessible and not corrupted.'
    );
  } finally {
    if (resolved.isTemp && resolved.cleanup) {
      resolved.cleanup();
    }
  }

  return analysis!;
}

program
  .command('analyze <target>')
  .description('Analyze a repository')
  .option('--json', 'Output as JSON')
  .option('--markdown', 'Output as Markdown')
  .option('--html', 'Output as HTML')
  .option('-o, --output <path>', 'Write output to file')
  .option('--no-git', 'Skip Git analysis')
  .option('--no-dependencies', 'Skip dependency analysis')
  .option('--no-security', 'Skip security analysis')
  .option('--no-history', 'Skip history analysis')
  .option('--deep', 'Deep analysis mode')
  .option('-q, --quiet', 'Minimal output')
  .option('-v, --verbose', 'Verbose output')
  .action(async (target: string, opts: any) => {
    const options: CLIOptions = {
      format: opts.json ? 'json' : opts.markdown ? 'markdown' : opts.html ? 'html' : 'terminal',
      output: opts.output,
      noGit: !opts.git,
      noDependencies: !opts.dependencies,
      noSecurity: !opts.security,
      noHistory: !opts.history,
      deep: opts.deep || false,
      quiet: opts.quiet || false,
      verbose: opts.verbose || false,
    };

    const analysis = runAnalysis(target, options);
    outputResults(analysis, options);
  });

program
  .command('report <target>')
  .description('Generate a report for a repository')
  .option('-o, --output <path>', 'Output file path')
  .action(async (target: string, opts: any) => {
    const options: CLIOptions = {
      format: 'json',
      output: opts.output || 'REPORT.md',
      noGit: false,
      noDependencies: false,
      noSecurity: false,
      noHistory: false,
      deep: false,
      quiet: false,
      verbose: false,
    };

    const analysis = runAnalysis(target, options);
    const md = generateMarkdown(analysis);
    const outPath = path.resolve(options.output || 'REPORT.md');
    fs.writeFileSync(outPath, md, 'utf-8');
    console.log('Report written to ' + outPath);
  });

program
  .command('compare <repo1> <repo2>')
  .description('Compare two repositories')
  .option('--json', 'Output as JSON')
  .action(async (repo1: string, repo2: string, opts: any) => {
    const options: CLIOptions = {
      format: 'terminal',
      noGit: false,
      noDependencies: false,
      noSecurity: false,
      noHistory: false,
      deep: false,
      quiet: false,
      verbose: false,
    };

    const analysis1 = runAnalysis(repo1, options);
    const analysis2 = runAnalysis(repo2, options);

    const { compareRepositories, formatComparison } = require('@repolens/reporting');
    const result = compareRepositories(analysis1, analysis2);

    if (opts.json) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(formatComparison(result));
    }
  });

program
  .command('config')
  .description('Show default configuration')
  .action(() => {
    const { DEFAULT_CONFIG } = require('@repolens/config');
    console.log(JSON.stringify(DEFAULT_CONFIG, null, 2));
  });

program
  .argument('[target]', 'Repository path or URL')
  .option('--json', 'Output as JSON')
  .option('--markdown', 'Output as Markdown')
  .option('--html', 'Output as HTML')
  .option('-o, --output <path>', 'Write output to file')
  .option('--no-git', 'Skip Git analysis')
  .option('--no-dependencies', 'Skip dependency analysis')
  .option('--no-security', 'Skip security analysis')
  .option('--no-history', 'Skip history analysis')
  .option('--deep', 'Deep analysis mode')
  .option('-q, --quiet', 'Minimal output')
  .option('-v, --verbose', 'Verbose output')
  .action(async (target: string | undefined, opts: any) => {
    if (!target) {
      program.help();
      return;
    }

    const options: CLIOptions = {
      format: opts.json ? 'json' : opts.markdown ? 'markdown' : opts.html ? 'html' : 'terminal',
      output: opts.output,
      noGit: !opts.git,
      noDependencies: !opts.dependencies,
      noSecurity: !opts.security,
      noHistory: !opts.history,
      deep: opts.deep || false,
      quiet: opts.quiet || false,
      verbose: opts.verbose || false,
    };

    const analysis = runAnalysis(target, options);
    outputResults(analysis, options);
  });

function outputResults(analysis: RepositoryAnalysis, options: CLIOptions): void {
  let output: string;

  switch (options.format) {
    case 'json':
      output = generateJSON(analysis);
      break;
    case 'markdown':
      output = generateMarkdown(analysis);
      break;
    case 'html':
      output = generateHTML(analysis);
      break;
    default:
      output = generateTerminal(analysis);
  }

  if (options.format === 'html') {
    const outPath = path.resolve(options.output || 'repolens-report.html');
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, output, 'utf-8');
    console.log('HTML report written to ' + outPath);
    openInBrowser(outPath);
    return;
  }

  if (options.output) {
    const outPath = path.resolve(options.output);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, output, 'utf-8');
    console.log('Output written to ' + outPath);
  } else {
    console.log(output);
  }
}

function openInBrowser(filePath: string): void {
  const { exec } = require('child_process');
  const fileUrl = 'file:///' + filePath.replace(/\\/g, '/');

  switch (process.platform) {
    case 'win32':
      exec(`start "" "${fileUrl}"`);
      break;
    case 'darwin':
      exec(`open "${fileUrl}"`);
      break;
    default:
      exec(`xdg-open "${fileUrl}"`);
      break;
  }
}

program.parse();
