import execa from 'execa';
import consola from 'consola';
import path from 'path';
import chalk from 'chalk';
import pathExists from 'path-exists';

async function $(file: string, args?: string[]) {
    return execa(file, args, { stdio: 'inherit' });
}

async function arePackagesBuilt(): Promise<boolean> {
    const existense = await Promise.all(
        ['enum', 'core', 'namespace', 'namespace-codegen', 'util']
            .map((x) => path.join(__dirname, '../packages', x, 'dist'))
            .map((x) => pathExists(x)),
    );

    return existense.every((x) => !!x);
}

async function main() {
    if (!(await arePackagesBuilt())) {
        consola.warn(chalk`Run {bold.blue pnpm build} in the root of workspace before running e2e test`);
        process.exit(1);
    }

    consola.info('Running e2e test');
    process.chdir(path.join(__dirname, '../e2e-spa'));

    consola.info('Installing packages');
    await $('pnpm', ['install']);

    consola.info('Cleanup');
    await $('pnpm', ['clean']);

    consola.info('Generate namespace from definition');
    await $('pnpm', ['generate-namespace']);

    consola.info('Run unit tests in nodejs with jest');
    await $('pnpm', ['test:node']);

    consola.info('Run e2e tests in browser with cypress');
    await $('pnpm', ['test:cy']);

    consola.success('e2e passed ^_^');
}

main().catch((err) => {
    consola.fatal(err);
    process.exit(1);
});
