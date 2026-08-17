import * as path from 'path';
import { LanguageStats } from '@repolens/types';

interface LanguageDef {
  name: string;
  extensions: string[];
  color: string;
}

const LANGUAGES: LanguageDef[] = [
  { name: 'TypeScript', extensions: ['.ts', '.tsx', '.mts', '.cts'], color: '#3178c6' },
  { name: 'JavaScript', extensions: ['.js', '.jsx', '.mjs', '.cjs'], color: '#f1e05a' },
  { name: 'Python', extensions: ['.py', '.pyw', '.pyi'], color: '#3572A5' },
  { name: 'Java', extensions: ['.java'], color: '#b07219' },
  { name: 'C', extensions: ['.c', '.h'], color: '#555555' },
  { name: 'C++', extensions: ['.cpp', '.cxx', '.cc', '.hpp', '.hxx'], color: '#f34b7d' },
  { name: 'C#', extensions: ['.cs'], color: '#178600' },
  { name: 'Go', extensions: ['.go'], color: '#00ADD8' },
  { name: 'Rust', extensions: ['.rs'], color: '#dea584' },
  { name: 'PHP', extensions: ['.php'], color: '#4F5D95' },
  { name: 'Ruby', extensions: ['.rb', '.rake'], color: '#701516' },
  { name: 'Swift', extensions: ['.swift'], color: '#F05138' },
  { name: 'Kotlin', extensions: ['.kt', '.kts'], color: '#A97BFF' },
  { name: 'Dart', extensions: ['.dart'], color: '#00B4AB' },
  { name: 'HTML', extensions: ['.html', '.htm', '.vue', '.svelte'], color: '#e34c26' },
  { name: 'CSS', extensions: ['.css', '.scss', '.sass', '.less'], color: '#563d7c' },
  { name: 'Shell', extensions: ['.sh', '.bash', '.zsh', '.fish'], color: '#89e051' },
  { name: 'SQL', extensions: ['.sql'], color: '#e38c00' },
  { name: 'Markdown', extensions: ['.md', '.mdx'], color: '#083fa1' },
  { name: 'JSON', extensions: ['.json'], color: '#292929' },
  { name: 'YAML', extensions: ['.yml', '.yaml'], color: '#cb171e' },
  { name: 'XML', extensions: ['.xml'], color: '#0060ac' },
  { name: 'TOML', extensions: ['.toml'], color: '#9c4221' },
  { name: 'Lua', extensions: ['.lua'], color: '#000080' },
  { name: 'Scala', extensions: ['.scala', '.sc'], color: '#c22d40' },
  { name: 'R', extensions: ['.r', '.R'], color: '#198CE7' },
  { name: 'Elixir', extensions: ['.ex', '.exs'], color: '#6e4a7e' },
  { name: 'Haskell', extensions: ['.hs', '.lhs'], color: '#5e5086' },
  { name: 'Dockerfile', extensions: ['.dockerfile'], color: '#384d54' },
  { name: 'Makefile', extensions: ['.makefile', '.mk'], color: '#427819' },
  { name: 'Gradle', extensions: ['.gradle', '.gradle.kts'], color: '#02303a' },
  { name: 'Perl', extensions: ['.pl', '.pm'], color: '#0298c3' },
  { name: 'Objective-C', extensions: ['.m', '.mm'], color: '#438eff' },
  { name: 'Assembly', extensions: ['.asm', '.s'], color: '#6E4C13' },
  { name: 'GraphQL', extensions: ['.graphql', '.gql'], color: '#e10098' },
  { name: 'Proto', extensions: ['.proto'], color: '#00b284' },
  { name: 'Terraform', extensions: ['.tf', '.tfvars'], color: '#7B42BC' },
  { name: 'Nginx', extensions: ['.nginx', '.conf'], color: '#009639' },
];

const BINARY_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.ico', '.webp', '.svg',
  '.mp3', '.mp4', '.wav', '.avi', '.mov', '.mkv', '.flv',
  '.zip', '.tar', '.gz', '.bz2', '.xz', '.7z', '.rar',
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
  '.exe', '.dll', '.so', '.dylib', '.o', '.obj',
  '.woff', '.woff2', '.ttf', '.eot', '.otf',
  '.lock', '.sum',
]);

export function getLanguageForExtension(ext: string): LanguageDef | undefined {
  return LANGUAGES.find(l => l.extensions.includes(ext.toLowerCase()));
}

export function isBinaryFile(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();
  if (BINARY_EXTENSIONS.has(ext)) return true;

  try {
    const buffer = Buffer.alloc(512);
    const fd = require('fs').openSync(filePath, 'r');
    const bytesRead = require('fs').readSync(fd, buffer, 0, 512, 0);
    require('fs').closeSync(fd);

    for (let i = 0; i < bytesRead; i++) {
      if (buffer[i] === 0) return true;
    }
  } catch {
    return false;
  }

  return false;
}

export function detectLanguages(
  files: Array<{ extension: string; lines: number; codeLines: number; blankLines: number; commentLines: number }>
): LanguageStats[] {
  const langMap = new Map<string, {
    files: number;
    lines: number;
    codeLines: number;
    blankLines: number;
    commentLines: number;
    color: string;
    extension: string;
  }>();

  let totalLines = 0;

  for (const file of files) {
    const lang = getLanguageForExtension(file.extension);
    const name = lang?.name || file.extension || 'Other';
    const color = lang?.color || '#6b7280';

    totalLines += file.lines;

    if (langMap.has(name)) {
      const existing = langMap.get(name)!;
      existing.files += 1;
      existing.lines += file.lines;
      existing.codeLines += file.codeLines;
      existing.blankLines += file.blankLines;
      existing.commentLines += file.commentLines;
    } else {
      langMap.set(name, {
        files: 1,
        lines: file.lines,
        codeLines: file.codeLines,
        blankLines: file.blankLines,
        commentLines: file.commentLines,
        color,
        extension: file.extension,
      });
    }
  }

  const languages: LanguageStats[] = [];

  for (const [name, stats] of langMap) {
    languages.push({
      name,
      extension: stats.extension,
      files: stats.files,
      lines: stats.lines,
      codeLines: stats.codeLines,
      blankLines: stats.blankLines,
      commentLines: stats.commentLines,
      percentage: totalLines > 0 ? Math.round((stats.lines / totalLines) * 1000) / 10 : 0,
      color: stats.color,
    });
  }

  languages.sort((a, b) => b.lines - a.lines);

  return languages;
}

export { LANGUAGES, BINARY_EXTENSIONS };
