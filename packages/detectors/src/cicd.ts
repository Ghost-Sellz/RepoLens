import { CICDInfo } from '@repolens/types';

export function detectCICD(filePaths: string[]): CICDInfo {
  const detected: string[] = [];
  let hasAutomatedTests = false;
  let hasDocker = false;
  let hasDeploymentConfig = false;

  const hasFile = (pattern: string | RegExp) =>
    filePaths.some(fp =>
      typeof pattern === 'string'
        ? fp === pattern || fp.endsWith('/' + pattern) || fp.includes(pattern)
        : pattern.test(fp)
    );

  if (hasFile('.github/workflows') || hasFile(/\.github\/workflows\/.+\.ya?ml$/)) {
    detected.push('GitHub Actions');
  }

  if (hasFile('.gitlab-ci.yml')) {
    detected.push('GitLab CI');
  }

  if (hasFile('.circleci')) {
    detected.push('CircleCI');
  }

  if (hasFile('Jenkinsfile')) {
    detected.push('Jenkins');
  }

  if (hasFile('Dockerfile') || hasFile('.dockerignore')) {
    detected.push('Docker');
    hasDocker = true;
  }

  if (hasFile('docker-compose.yml') || hasFile('docker-compose.yaml')) {
    detected.push('Docker Compose');
    hasDocker = true;
  }

  if (hasFile('vercel.json') || hasFile('.vercelignore')) {
    detected.push('Vercel');
    hasDeploymentConfig = true;
  }

  if (hasFile('netlify.toml') || hasFile('_redirects')) {
    detected.push('Netlify');
    hasDeploymentConfig = true;
  }

  if (hasFile('.travis.yml')) {
    detected.push('Travis CI');
  }

  if (hasFile('appveyor.yml')) {
    detected.push('AppVeyor');
  }

  if (hasFile('azure-pipelines.yml')) {
    detected.push('Azure Pipelines');
  }

  if (hasFile('bitbucket-pipelines.yml')) {
    detected.push('Bitbucket Pipelines');
  }

  // Check for test scripts in CI configs
  const ciFiles = filePaths.filter(fp =>
    fp.includes('.github/workflows') ||
    fp === '.gitlab-ci.yml' ||
    fp.includes('.circleci')
  );

  for (const ciFile of ciFiles) {
    // We check if CI files exist; actual content analysis is done elsewhere
    hasAutomatedTests = true;
  }

  return {
    detected,
    hasAutomatedTests,
    hasDocker,
    hasDeploymentConfig,
  };
}
