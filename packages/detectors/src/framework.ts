import { Framework } from '@repolens/types';

interface FrameworkRule {
  name: string;
  confidence: 'high' | 'medium' | 'low';
  filePatterns?: string[];
  contentPatterns?: Array<{ file: string; pattern: RegExp }>;
}

const FRAMEWORK_RULES: FrameworkRule[] = [
  { name: 'Next.js', confidence: 'high', filePatterns: ['next.config.js', 'next.config.mjs', 'next.config.ts'] },
  { name: 'React', confidence: 'high', filePatterns: [], contentPatterns: [
    { file: 'package.json', pattern: /"react":\s*"/ },
  ]},
  { name: 'Vue', confidence: 'high', filePatterns: ['vue.config.js', 'vue.config.ts'], contentPatterns: [
    { file: 'package.json', pattern: /"vue":\s*"/ },
  ]},
  { name: 'Nuxt', confidence: 'high', filePatterns: ['nuxt.config.ts', 'nuxt.config.js'] },
  { name: 'Svelte', confidence: 'high', filePatterns: ['svelte.config.js', 'svelte.config.ts'], contentPatterns: [
    { file: 'package.json', pattern: /"svelte":\s*"/ },
  ]},
  { name: 'SvelteKit', confidence: 'high', filePatterns: ['src/routes'] },
  { name: 'Astro', confidence: 'high', filePatterns: ['astro.config.mjs', 'astro.config.ts'] },
  { name: 'Angular', confidence: 'high', filePatterns: ['angular.json', '.angular-cli.json'] },
  { name: 'Express', confidence: 'medium', contentPatterns: [
    { file: 'package.json', pattern: /"express":\s*"/ },
  ]},
  { name: 'Fastify', confidence: 'medium', contentPatterns: [
    { file: 'package.json', pattern: /"fastify":\s*"/ },
  ]},
  { name: 'NestJS', confidence: 'high', filePatterns: ['nest-cli.json'], contentPatterns: [
    { file: 'package.json', pattern: /"@nestjs\/core":\s*"/ },
  ]},
  { name: 'Django', confidence: 'high', filePatterns: ['manage.py', 'settings.py'], contentPatterns: [
    { file: 'requirements.txt', pattern: /django/i },
    { file: 'pyproject.toml', pattern: /django/i },
  ]},
  { name: 'Flask', confidence: 'medium', contentPatterns: [
    { file: 'requirements.txt', pattern: /flask/i },
    { file: 'pyproject.toml', pattern: /flask/i },
  ]},
  { name: 'FastAPI', confidence: 'medium', contentPatterns: [
    { file: 'requirements.txt', pattern: /fastapi/i },
    { file: 'pyproject.toml', pattern: /fastapi/i },
  ]},
  { name: 'Laravel', confidence: 'high', filePatterns: ['artisan', 'composer.json'], contentPatterns: [
    { file: 'composer.json', pattern: /laravel\/framework/ },
  ]},
  { name: 'Rails', confidence: 'high', filePatterns: ['Gemfile', 'Rakefile'], contentPatterns: [
    { file: 'Gemfile', pattern: /gem\s+['"]rails/ },
  ]},
  { name: 'Spring', confidence: 'medium', filePatterns: ['pom.xml', 'build.gradle', 'build.gradle.kts'], contentPatterns: [
    { file: 'pom.xml', pattern: /spring-boot/ },
  ]},
  { name: 'Prisma', confidence: 'high', filePatterns: ['prisma/schema.prisma'] },
  { name: 'Drizzle', confidence: 'high', filePatterns: ['drizzle.config.ts', 'drizzle.config.js'] },
  { name: 'Tailwind CSS', confidence: 'high', filePatterns: ['tailwind.config.js', 'tailwind.config.ts', 'tailwind.config.mjs'], contentPatterns: [
    { file: 'package.json', pattern: /"tailwindcss":\s*"/ },
  ]},
  { name: 'Docker', confidence: 'high', filePatterns: ['Dockerfile', 'docker-compose.yml', 'docker-compose.yaml', '.dockerignore'] },
  { name: 'Kubernetes', confidence: 'medium', filePatterns: ['helm', 'Chart.yaml'] },
  { name: 'GitHub Actions', confidence: 'high', filePatterns: ['.github/workflows'] },
  { name: 'Vercel', confidence: 'high', filePatterns: ['vercel.json', '.vercelignore'] },
  { name: 'Netlify', confidence: 'high', filePatterns: ['netlify.toml', '_redirects'] },
  { name: 'Supabase', confidence: 'high', filePatterns: ['supabase'] },
  { name: 'Firebase', confidence: 'medium', filePatterns: ['firebase.json', '.firebaserc'] },
  { name: 'Vite', confidence: 'high', filePatterns: ['vite.config.ts', 'vite.config.js', 'vite.config.mjs'] },
  { name: 'Webpack', confidence: 'medium', filePatterns: ['webpack.config.js', 'webpack.config.ts'] },
  { name: 'Turbo', confidence: 'high', filePatterns: ['turbo.json'] },
  { name: 'pnpm', confidence: 'high', filePatterns: ['pnpm-workspace.yaml'] },
  { name: 'GraphQL', confidence: 'medium', filePatterns: ['schema.graphql', 'schema.gql'], contentPatterns: [
    { file: 'package.json', pattern: /"graphql":\s*"/ },
  ]},
  { name: 'Redis', confidence: 'low', contentPatterns: [
    { file: 'package.json', pattern: /"redis":\s*"/ },
  ]},
  { name: 'PostgreSQL', confidence: 'low', contentPatterns: [
    { file: 'package.json', pattern: /"pg":\s*"/ },
    { file: 'docker-compose.yml', pattern: /postgres/i },
  ]},
  { name: 'MongoDB', confidence: 'low', contentPatterns: [
    { file: 'package.json', pattern: /"mongoose":\s*"/ },
    { file: 'docker-compose.yml', pattern: /mongo/i },
  ]},
];

export function detectFrameworks(
  filePaths: string[],
  fileContents: Map<string, string>
): Framework[] {
  const detected: Framework[] = [];
  const detectedNames = new Set<string>();

  for (const rule of FRAMEWORK_RULES) {
    if (detectedNames.has(rule.name)) continue;

    let matched = false;
    const evidence: string[] = [];

    for (const pattern of rule.filePatterns || []) {
      const found = filePaths.some(fp =>
        fp === pattern || fp.endsWith('/' + pattern) || fp.includes(pattern)
      );
      if (found) {
        matched = true;
        evidence.push(`Found: ${pattern}`);
      }
    }

    if (rule.contentPatterns) {
      for (const cp of rule.contentPatterns) {
        const content = fileContents.get(cp.file);
        if (content && cp.pattern.test(content)) {
          matched = true;
          evidence.push(`Matched pattern in ${cp.file}`);
        }
      }
    }

    if (matched) {
      detected.push({
        name: rule.name,
        confidence: rule.confidence,
        evidence,
      });
      detectedNames.add(rule.name);
    }
  }

  return detected;
}
