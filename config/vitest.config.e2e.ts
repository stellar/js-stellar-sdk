import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['lib/**/*.js'],
      exclude: ['test/**', 'dist/**', 'coverage/**', '**/*.d.ts', 'lib/**/*.d.ts', 'lib/minimal', 'lib/no-axios', 'lib/no-eventsource', '**/*/browser.js'],
      all: true,
    },
    testTimeout: 120000, // 2 minutes timeout for e2e tests (same as original Mocha config)
    hookTimeout: 120000, // 2 minutes timeout for hooks (beforeAll, afterAll, etc.)
    // Include only e2e tests
    include: ['test/e2e/src/**/*.test.ts'],
    exclude: ['**/browser.test.ts'],
    // Run tests in sequence to avoid conflicts with shared resources
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '../src'),
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
  },
  esbuild: {
    target: 'node20',
  },
  optimizeDeps: {
    include: ['axios'],
  },
  define: {
    __USE_AXIOS__: true,
    __USE_EVENTSOURCE__: true,
    __PACKAGE_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
})
