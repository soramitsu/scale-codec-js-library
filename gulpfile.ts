import { $, chalk, path, cd } from 'zx';
import del from 'del';
import { series, parallel } from 'gulp';
import consola from 'consola';
import pathExists from 'path-exists';

async function clean() {
    await del(['packages/*/dist', '.declaration'].map((x) => path.resolve(__dirname, x)));
}

async function buildDeclaration() {
    const DIR = path.resolve(__dirname, '.declaration');
    await $`pnpx tsc -p ./ --emitDeclarationOnly --declaration --declarationDir ${DIR}`;
}

async function rollup() {
    await $`pnpx rollup -c`;
}

function unitTests() {
    return $`pnpm test:unit`;
}

function lint() {
    return $`pnpm lint`;
}

function typeCheck() {
    return $`pnpm type-check`;
}

async function publishAll() {
    const PACKAGES = ['enum', 'util', 'core', 'definition-compiler', 'definition-runtime'];

    for (const pkg of PACKAGES) {
        const pkgFullName = `@scale-codec/${pkg}`;

        consola.info(chalk`Publishing {blue.bold ${pkgFullName}}`);
        await $`pnpm publish --filter ${pkgFullName} --no-git-checks --access public`;

        consola.success(chalk`{blue.bold ${pkgFullName}} published`);
        process.stdout.write('\n');
    }

    consola.info('Done');
}

async function arePackagesBuilt(): Promise<boolean> {
    const existense = await Promise.all(
        ['enum', 'core', 'definition-compiler', 'definition-runtime', 'util']
            .map((x) => path.join(__dirname, 'packages', x, 'dist'))
            .map((x) => pathExists(x)),
    );

    return existense.every((x) => !!x);
}

async function checkBuild() {
    if (!(await arePackagesBuilt())) {
        consola.warn(chalk`Run {bold.blue pnpm build} in the root of workspace before running e2e test`);
        process.exit(1);
    }
}

async function runTestInE2eSpa() {
    cd(path.resolve(__dirname, './e2e-spa'));
    await $`pnpm test`;
    cd(__dirname);
}

export const testE2e = series(checkBuild, runTestInE2eSpa);

export const build = series(clean, buildDeclaration, rollup);

export const checkCodeIntegrity = series(parallel(unitTests, lint, typeCheck), build, testE2e);

export { clean, buildDeclaration, publishAll };
