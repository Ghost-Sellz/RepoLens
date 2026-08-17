import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    exclude: ['tests/fixtures/**'],
    coverage: {
      provider: 'v8',
      include: ['packages/*/src/**/*.ts'],
      exclude: ['**/node_modules/**', '**/dist/**'],
    },
  },
  resolve: {
    alias: {
      '@repolens/types': path.resolve(__dirname, 'packages/types/src'),
      '@repolens/config': path.resolve(__dirname, 'packages/config/src'),
      '@repolens/detectors': path.resolve(__dirname, 'packages/detectors/src'),
      '@repolens/github': path.resolve(__dirname, 'packages/github/src'),
      '@repolens/analyzer': path.resolve(__dirname, 'packages/analyzer/src'),
      '@repolens/reporting': path.resolve(__dirname, 'packages/reporting/src'),
    },
  },
});
