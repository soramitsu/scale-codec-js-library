import { $, chalk, path, cd } from 'zx';
import del from 'del';
import { series, parallel } from 'gulp';
import consola from 'consola';
import { ExtractorConfig, Extractor } from '@microsoft/api-extractor';
import compileDocsNamespace from './scripts/compile-docs-namespace';
import compileCompilerSamples from './scripts/compile-compiler-samples';
import bundle from './scripts/bundle';
import bundleForE2e from './scripts/bundle-for-e2e';

const ROOT = __dirname;

const BUILD_PACKAGES = ['enum', 'util', 'core', 'definition-compiler', 'definition-runtime'];
// const DECLARATION_PACKAGES = [...BUILD_PACKAGES];

async function clean() {
    await del(
        [
            'dist',
            'dist-tsc',
            'packages/*/dist',
            'packages/*/dist-tsc',
            'packages/docs/root/api',
            'api-extractor/temp',
            'e2e-spa/runtime-rollup',
        ].map((x) => path.resolve(ROOT, x)),
    );
}

async function cleanCompilerSamples() {
    await del(path.resolve(ROOT, 'packages/definition-compiler/tests/samples'));
}

async function buildTS() {
    // Main TypeScript build into root `dist` dir
    await $`pnpm tsc --emitDeclarationOnly`;

    // Copying compiled internals into each package's own `dist` dir
    await Promise.all(
        BUILD_PACKAGES.map(async (unscopedName) => {
            const dirFrom = path.resolve(ROOT, 'dist-tsc', unscopedName, 'src');
            const dirTo = path.resolve(ROOT, 'packages', unscopedName, 'dist-tsc');
            await $`cp -r ${dirFrom} ${dirTo}`;
        }),
    );
}

async function extractPackageApis(unscopedPackageName: string, localBuild = false): Promise<void> {
    const extractorConfigFile = path.resolve(ROOT, 'packages', unscopedPackageName, 'api-extractor.json');
    const config = ExtractorConfig.loadFileAndPrepare(extractorConfigFile);
    const extractorResult = Extractor.invoke(config, {
        localBuild,
        showVerboseMessages: true,
    });
    if (extractorResult.succeeded) {
        consola.success(chalk`API Extractor completed successfully (for {blue.bold ${unscopedPackageName}})`);
    } else {
        consola.fatal(
            `API Extractor completed with ${extractorResult.errorCount} errors` +
                ` and ${extractorResult.warningCount} warnings`,
        );
        throw new Error('Extractor failed');
    }
}

async function extractApisParametrized(localBuild = false) {
    await Promise.all(BUILD_PACKAGES.map((x) => extractPackageApis(x, localBuild)));
}

function extractApisLocalBuild() {
    return extractApisParametrized(true);
}

function extractApis() {
    return extractApisParametrized();
}

/**
 * Should be fired after {@link extractApis}
 */
async function documentApis() {
    await $`pnpx api-documenter markdown -i api-extractor/temp -o packages/docs/root/api`;
}

function testUnit() {
    return $`pnpm test:unit`;
}

function lintCheck() {
    // only checking eslint, because prettier curses *.vue files edited by eslint
    return $`pnpm lint:eslint-check`;
}

function typeCheck() {
    return $`pnpm type-check`;
}

async function publishAll() {
    for (const pkg of BUILD_PACKAGES) {
        const pkgFullName = `@scale-codec/${pkg}`;

        consola.info(chalk`Publishing {blue.bold ${pkgFullName}}`);
        await $`pnpm publish --filter ${pkgFullName} --no-git-checks --access public`;

        consola.success(chalk`{blue.bold ${pkgFullName}} published`);
        process.stdout.write('\n');
    }

    consola.info('Done');
}

async function runTestInE2eSpa() {
    cd(path.resolve(ROOT, './e2e-spa'));
    await $`pnpm test`;
    cd(__dirname);
}

export const testE2e = series(bundleForE2e, runTestInE2eSpa);

export const extractAndDocumentApis = series(extractApis, documentApis);

export const build = series(clean, buildTS, extractApis, parallel(bundle, documentApis));

export const checkCodeIntegrity = series(
    compileCompilerSamples,
    parallel(testUnit, lintCheck, typeCheck),
    build,
    testE2e,
);

export const buildDeclarations = series(clean, buildTS);

export {
    clean,
    publishAll,
    extractApis,
    documentApis,
    extractApisLocalBuild,
    compileDocsNamespace,
    compileCompilerSamples,
    cleanCompilerSamples,
    buildTS,
    bundle,
    bundleForE2e,
};
