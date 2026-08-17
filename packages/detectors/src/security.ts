import { SecurityFinding } from '@repolens/types';

interface SecurityRule {
  type: SecurityFinding['type'];
  category: string;
  severity: SecurityFinding['severity'];
  patterns: Array<{ filePattern?: RegExp; contentPattern: RegExp; description: string }>;
}

const SECURITY_RULES: SecurityRule[] = [
  {
    type: 'potential-issue',
    category: 'Credentials',
    severity: 'high',
    patterns: [
      { contentPattern: /(?:password|passwd|pwd)\s*[:=]\s*["'][^"']+["']/i, description: 'Hardcoded password detected' },
      { contentPattern: /(?:api[_-]?key|apikey)\s*[:=]\s*["'][A-Za-z0-9]{20,}["']/i, description: 'Hardcoded API key detected' },
      { contentPattern: /(?:secret[_-]?key|secretkey)\s*[:=]\s*["'][A-Za-z0-9]{20,}["']/i, description: 'Hardcoded secret key detected' },
      { contentPattern: /(?:access[_-]?token|accesstoken)\s*[:=]\s*["'][A-Za-z0-9]{20,}["']/i, description: 'Hardcoded access token detected' },
    ],
  },
  {
    type: 'potential-issue',
    category: 'Private Keys',
    severity: 'high',
    patterns: [
      { contentPattern: /-----BEGIN\s+(RSA\s+)?PRIVATE\s+KEY-----/, description: 'Private key file content detected' },
    ],
  },
  {
    type: 'potential-issue',
    category: 'Environment Files',
    severity: 'medium',
    patterns: [
      { filePattern: /\.env$/, contentPattern: /.+/, description: '.env file may contain secrets' },
      { filePattern: /\.env\.local$/, contentPattern: /.+/, description: '.env.local file may contain secrets' },
      { filePattern: /\.env\.production$/, contentPattern: /.+/, description: '.env.production file may contain secrets' },
    ],
  },
  {
    type: 'potential-issue',
    category: 'Debug Configuration',
    severity: 'low',
    patterns: [
      { contentPattern: /DEBUG\s*[:=]\s*(?:true|1|yes)/i, description: 'Debug mode appears to be enabled' },
      { contentPattern: /NODE_ENV\s*[:=]\s*["']development["']/i, description: 'Development environment variable set' },
    ],
  },
  {
    type: 'potential-issue',
    category: 'Unsafe Commands',
    severity: 'medium',
    patterns: [
      { contentPattern: /eval\s*\(\s*(?:req\.|input|argv|process\.argv)/i, description: 'Potential eval of user input' },
      { contentPattern: /exec\s*\(\s*(?:req\.|input|argv|process\.argv)/i, description: 'Potential exec of user input' },
      { contentPattern: /child_process.*exec.*\$\{/i, description: 'Shell command with interpolation' },
    ],
  },
  {
    type: 'info',
    category: 'Configuration',
    severity: 'low',
    patterns: [
      { contentPattern: /cors.*origin.*\*/i, description: 'CORS allows all origins' },
      { contentPattern: /"allowAllOrigins"\s*:\s*true/i, description: 'All origins allowed' },
    ],
  },
];

const ENV_FILE_PATTERNS = [
  /^\.env$/,
  /^\.env\.\w+$/,
];

export function detectSecurityIssues(
  filePaths: string[],
  fileContents: Map<string, string>
): SecurityFinding[] {
  const findings: SecurityFinding[] = [];
  const seen = new Set<string>();

  // Check for .gitignore existence
  if (!filePaths.includes('.gitignore')) {
    findings.push({
      type: 'warning',
      category: 'Configuration',
      message: 'No .gitignore file found. Sensitive files may be accidentally committed.',
      severity: 'medium',
    });
  }

  // Check for committed .env files
  for (const fp of filePaths) {
    const basename = fp.split('/').pop() || fp.split('\\').pop() || '';
    if (ENV_FILE_PATTERNS.some(p => p.test(basename)) && !fp.includes('example') && !fp.includes('.template')) {
      const key = `env-file:${fp}`;
      if (!seen.has(key)) {
        seen.add(key);
        findings.push({
          type: 'potential-issue',
          category: 'Environment Files',
          message: `Potential secrets in tracked file: ${fp}`,
          file: fp,
          severity: 'medium',
        });
      }
    }
  }

  // Scan file contents
  for (const [filePath, content] of fileContents) {
    for (const rule of SECURITY_RULES) {
      for (const pattern of rule.patterns) {
        if (pattern.filePattern && !pattern.filePattern.test(filePath)) continue;

        const matches = content.match(new RegExp(pattern.contentPattern, 'gi'));
        if (matches && matches.length > 0) {
          const key = `${rule.category}:${filePath}:${pattern.description}`;
          if (!seen.has(key)) {
            seen.add(key);
            findings.push({
              type: rule.type,
              category: rule.category,
              message: `${pattern.description} (${matches.length} occurrence${matches.length > 1 ? 's' : ''})`,
              file: filePath,
              severity: rule.severity,
            });
          }
        }
      }
    }
  }

  return findings;
}
