import { TestingInfo } from '@repolens/types';

interface TestFramework {
  name: string;
  indicators: string[];
  filePatterns: string[];
  contentPatterns?: Array<{ file: string; pattern: RegExp }>;
}

const TEST_FRAMEWORKS: TestFramework[] = [
  {
    name: 'Vitest',
    indicators: ['vitest'],
    filePatterns: ['vitest.config.ts', 'vitest.config.js', 'vitest.config.mjs', 'vitest.config.mts'],
    contentPatterns: [
      { file: 'package.json', pattern: /"vitest":\s*"/ },
    ],
  },
  {
    name: 'Jest',
    indicators: ['jest'],
    filePatterns: ['jest.config.js', 'jest.config.ts', 'jest.config.mjs', 'jest.config.json'],
    contentPatterns: [
      { file: 'package.json', pattern: /"jest":\s*"/ },
    ],
  },
  {
    name: 'Playwright',
    indicators: ['playwright'],
    filePatterns: ['playwright.config.ts', 'playwright.config.js'],
    contentPatterns: [
      { file: 'package.json', pattern: /"@playwright\/test":\s*"/ },
    ],
  },
  {
    name: 'Cypress',
    indicators: ['cypress'],
    filePatterns: ['cypress.config.ts', 'cypress.config.js', 'cypress.json'],
    contentPatterns: [
      { file: 'package.json', pattern: /"cypress":\s*"/ },
    ],
  },
  {
    name: 'Mocha',
    indicators: ['mocha'],
    filePatterns: ['.mocharc.yml', '.mocharc.json', '.mocharc.js'],
    contentPatterns: [
      { file: 'package.json', pattern: /"mocha":\s*"/ },
    ],
  },
  {
    name: 'Pytest',
    indicators: ['pytest'],
    filePatterns: ['pytest.ini', 'conftest.py', 'pyproject.toml'],
    contentPatterns: [
      { file: 'requirements.txt', pattern: /pytest/i },
      { file: 'pyproject.toml', pattern: /pytest/i },
    ],
  },
  {
    name: 'JUnit',
    indicators: ['junit'],
    filePatterns: ['pom.xml', 'build.gradle'],
    contentPatterns: [
      { file: 'pom.xml', pattern: /junit/ },
    ],
  },
];

const TEST_FILE_PATTERNS = [
  /\.test\.[jt]sx?$/,
  /\.spec\.[jt]sx?$/,
  /\.test\.py$/,
  /_test\.go$/,
  /_spec\.rb$/,
  /Test\.java$/,
  /Spec\.scala$/,
  /\.spec\.[jt]sx?$/,
  /test_[\w]+\.py$/,
];

const TEST_DIR_PATTERNS = [
  /tests?\//,
  /__tests__\//,
  /test\//,
  /spec\//,
  /e2e\//,
  /cypress\//,
];

export function detectTesting(
  filePaths: string[],
  fileContents: Map<string, string>
): TestingInfo {
  let framework: string | null = null;

  for (const tf of TEST_FRAMEWORKS) {
    let found = false;

    for (const fp of tf.filePatterns) {
      if (filePaths.some(f => f === fp || f.endsWith('/' + fp))) {
        found = true;
        break;
      }
    }

    if (!found && tf.contentPatterns) {
      for (const cp of tf.contentPatterns) {
        const content = fileContents.get(cp.file);
        if (content && cp.pattern.test(content)) {
          found = true;
          break;
        }
      }
    }

    if (found) {
      framework = tf.name;
      break;
    }
  }

  let testFiles = 0;
  for (const fp of filePaths) {
    if (TEST_FILE_PATTERNS.some(p => p.test(fp))) {
      testFiles++;
    }
  }

  // Count files in test directories
  for (const fp of filePaths) {
    if (TEST_DIR_PATTERNS.some(p => p.test(fp)) && !TEST_FILE_PATTERNS.some(p => p.test(fp))) {
      testFiles++;
    }
  }

  const sourceFiles = filePaths.filter(fp =>
    !fp.includes('node_modules') &&
    !fp.includes('dist') &&
    !fp.includes('build') &&
    !fp.includes('.next') &&
    !TEST_FILE_PATTERNS.some(p => p.test(fp)) &&
    !TEST_DIR_PATTERNS.some(p => p.test(fp))
  ).length;

  const testSourceRatio = sourceFiles > 0 ? Math.round((testFiles / sourceFiles) * 100) : 0;

  let score = 0;
  if (framework) score += 40;
  if (testFiles > 0) score += 30;
  if (testSourceRatio >= 20) score += 15;
  if (testSourceRatio >= 40) score += 15;

  return {
    framework,
    testFiles,
    testSourceRatio,
    score: Math.min(score, 100),
  };
}
