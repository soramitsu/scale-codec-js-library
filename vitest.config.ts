import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['./packages/**/*.spec.ts', './packages/**/__tests__/**/*.ts'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      './types',
      './packages/namespace*/**',
      '**/*.d.ts',
      './packages/core/src/codecs/__tests__/util.ts',
    ],
  },
})
