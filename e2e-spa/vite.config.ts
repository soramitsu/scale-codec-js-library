import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@scale-codec/definition-runtime': path.resolve(__dirname, 'runtime-rollup/index.esm.js'),
    },
  },
})
