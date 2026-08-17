import { RepositoryAnalysis } from '@repolens/types';

export function generateJSON(analysis: RepositoryAnalysis): string {
  return JSON.stringify(analysis, null, 2);
}
