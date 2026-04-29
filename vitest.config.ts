import path from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    env: {
      VITE_API_BASE_URL: 'http://localhost',
      VITE_API_VERSION: 'v1',
    },
    setupFiles: ['./src/test-setup.ts'],
    include: ['src/**/*.test.{ts,tsx}', 'src/**/*.integration.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'json-summary'],
      reportsDirectory: './coverage',
      include: ['src/{features,store,lib}/**/*.{ts,tsx}'],
      thresholds: {
        lines: 70,
        statements: 70,
        functions: 70,
        branches: 70,
      },
      exclude: [
        'src/**/*.stories.{ts,tsx}',
        'src/**/*.test.{ts,tsx}',
        'src/**/*.d.ts',
        'src/routeTree.gen.ts',
        'src/vite-env.d.ts',
        // Barrel and type-only modules: no runtime logic to exercise in unit tests.
        'src/{features,store,lib}/**/index.ts',
        'src/{features,store}/**/types.ts',
        'src/lib/types/**',
        // Orval-generated HTTP clients (exercised indirectly via MSW integration tests).
        'src/lib/api/generated/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
