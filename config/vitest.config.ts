import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

const isAxios = process.env.TRANSPORT === 'axios'
const libUnderTest = isAxios ? '../lib/axios/esm/index.js' : '../lib/esm/index.js'
const httpClientUnderTest = isAxios
  ? '../lib/axios/esm/http-client/axios.js'
  : '../lib/esm/http-client/index.js'
const coverageInclude = isAxios ? 'lib/axios/esm/**/*.js' : 'lib/esm/**/*.js'
const coverageExclude = [
  'test/**',
  'dist/**',
  'coverage/**',
  '**/*.d.ts',
  'lib/**/*.d.ts',
  ...(isAxios ? [] : ['lib/axios']),
  '**/*/browser.js',
]

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: [coverageInclude],
      exclude: coverageExclude,
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
      '@test/stellar-sdk': resolve(__dirname, libUnderTest),
      '@test/http-client': resolve(__dirname, httpClientUnderTest),
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
    __PACKAGE_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
})
