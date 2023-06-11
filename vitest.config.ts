import { defineConfig } from 'vitest/config'
import { PUBLIC_PACKAGES_UNSCOPED, resolvePackageEntrypoint, scoped } from './etc/meta'

export const monorepoAliases = Object.fromEntries(
  PUBLIC_PACKAGES_UNSCOPED.flatMap((pkg) => [[scoped(pkg), resolvePackageEntrypoint(pkg, 'ts')]]),
)

export default defineConfig({
  resolve: {
    alias: monorepoAliases,
  },
  test: {
    include: ['./packages/**/*.spec.ts', './packages/**/__tests__/**/*.ts'],
    includeSource: ['./packages/*/src/**/*.ts'],
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
