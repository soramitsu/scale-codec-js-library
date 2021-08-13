import { defineConfig } from 'rollup';
import esbuild from 'rollup-plugin-esbuild';
import path from 'path';

export default defineConfig({
    input: path.resolve(__dirname, './src/example-run.ts'),
    plugins: [esbuild()],
    output: {
        file: 'dist/out.js',
        format: 'esm',
    },
    external: ['@scale-codec/core', 'jsbi', 'map-obj'],
});
