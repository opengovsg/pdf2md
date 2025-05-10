import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/**/*.spec.ts'],
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
    deps: {
      interopDefault: true,
    },
  },
  // resolve: {
  //   // Ensure .ts and .js files can be imported without their extensions
  //   extensions: ['.ts', '.js'],
  //   alias: {
  //     // This makes the tests work with your existing import structure
  //     '^../../lib/(.*)': '<rootDir>/dist/$1'
  //   }
  // }
}) 
