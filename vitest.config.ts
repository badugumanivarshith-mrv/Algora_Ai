import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: ['node_modules/', 'dist/', 'tests/', 'server.ts', 'vite.config.ts', 'playwright.config.ts'],
    },
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
