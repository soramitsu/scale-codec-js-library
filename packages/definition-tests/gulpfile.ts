import { series } from 'gulp';
import path from 'path';
import del from 'del';
import makeDir from 'make-dir';
import fs from 'fs/promises';
import consola from 'consola';
import chalk from 'chalk';
import * as samples from './src/__samples__';
import { renderNamespaceDefinition } from '@scale-codec/definition-compiler';

const OUTPUT_DIR = path.resolve(__dirname, 'src/samples');

async function clean() {
    const cleanPath = path.join(OUTPUT_DIR, '*');
    consola.info(chalk`Cleaning {blue.bold ${path.relative(process.cwd(), cleanPath)}}`);
    await del(cleanPath);
}

async function prepareOutputDir() {
    await makeDir(OUTPUT_DIR);
}

async function compileSamples() {
    const entries = Object.entries(samples);

    await Promise.all(
        entries.map(async ([id, { def }]) => {
            const code = await renderNamespaceDefinition(def, { importLib: '@scale-codec/definition-runtime' });
            const file = path.join(OUTPUT_DIR, `${id}.ts`);
            const fileRelative = path.relative(process.cwd(), file);
            await fs.writeFile(file, code);
            consola.info(chalk`Written: {blue.bold ${fileRelative}}`);
        }),
    );
}

export const recompile_samples = series(clean, prepareOutputDir, compileSamples);
