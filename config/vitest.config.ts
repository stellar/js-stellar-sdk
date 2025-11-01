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
    testTimeout: 20000,
    // Only include non-browser tests in Node.js test runs
    include: ['test/unit/**/*.test.ts', 'test/integration/**/*.test.ts'],
    exclude: ['**/browser.test.ts'],
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