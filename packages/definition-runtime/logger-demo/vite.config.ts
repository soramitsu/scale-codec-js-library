import { defineConfig } from 'vite'
import { monorepoAliases } from '../../../vitest.config'

export default defineConfig({
  resolve: {
    alias: monorepoAliases,
  },
  server: {
    fs: {
      strict: false,
    },
  },
})
