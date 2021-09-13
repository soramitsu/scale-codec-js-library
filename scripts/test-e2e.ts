import consola from 'consola';
import path from 'path';
import chalk from 'chalk';
import pathExists from 'path-exists';
import { runAsyncMain, $ } from './util';

async function arePackagesBuilt(): Promise<boolean> {
    const existense = await Promise.all(
        ['enum', 'core', 'definition-compiler', 'definition-runtime', 'util']
            .map((x) => path.join(__dirname, '../packages', x, 'dist'))
            .map((x) => pathExists(x)),
    );

    return existense.every((x) => !!x);
}

runAsyncMain(async () => {
    if (!(await arePackagesBuilt())) {
        consola.warn(chalk`Run {bold.blue pnpm build} in the root of workspace before running e2e test`);
        process.exit(1);
    }

    consola.log('Running e2e test');
    process.chdir(path.join(__dirname, '../e2e-spa'));

    consola.log('Installing packages');
    await $('pnpm', ['install']);

    consola.log('Cleaning up');
    await $('pnpm', ['clean']);

    consola.log('Compiling definition');
    await $('pnpm', ['compile-definition']);

    consola.log('Checking types');
    await $('pnpm', ['test:types']);

    consola.log('Running unit tests in nodejs with jest');
    await $('pnpm', ['test:node']);

    consola.log('Running e2e tests in browser with cypress');
    await $('pnpm', ['test:cy']);

    consola.success('e2e passed ^_^');
});
