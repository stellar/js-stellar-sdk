import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'html', 'lcov'],
      include: ['lib/**/*.js'],
      exclude: ['test/**', 'dist/**', 'coverage/**', '**/*.d.ts', 'lib/**/*.d.ts', ],
      all: true,
    },
    browser: {
      enabled: true,
      provider: 'playwright',
      instances: [
        { browser: "chromium"},
        { browser: "firefox"},
      ],
      headless: true,
      screenshotFailures: false
    },
    // Run all unit tests in browser
    include: ['test/unit/**/*.test.ts'],
    exclude: ['test/unit/call_builders.test.ts'],
    // Setup files to load the browser bundle
    setupFiles: [resolve(__dirname, '../test/setup-browser.ts')],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '../src'),
    },
  },
  define: {
    __USE_AXIOS__: true,
    __USE_EVENTSOURCE__: true,
    __PACKAGE_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
})