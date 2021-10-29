import { $, chalk, path, cd } from 'zx';
import del from 'del';
import { series, parallel } from 'gulp';
import consola from 'consola';
import pathExists from 'path-exists';
import { ExtractorConfig, Extractor } from '@microsoft/api-extractor';

const ROOT = __dirname;

const PUBLISH_PACKAGES = ['enum', 'util', 'core', 'definition-compiler', 'definition-runtime'];
const DECLARATION_PACKAGES = [...PUBLISH_PACKAGES];

async function clean() {
    await del(
        [
            'packages/*/dist',
            '.declaration',
            'packages/*/.declaration',
            'api-extractor/temp',
            'packages/docs/api',
            'e2e-spa/runtime-rollup',
        ].map((x) => path.resolve(ROOT, x)),
    );
}

async function buildDeclarationsOnly() {
    const overallDeclarationDir = path.resolve(ROOT, '.declaration');
    await $`pnpx tsc -p ./ --emitDeclarationOnly --declaration --declarationDir ${overallDeclarationDir}`;

    await Promise.all(
        DECLARATION_PACKAGES.map(async (pkg) => {
            const outDir = path.resolve(ROOT, 'packages', pkg, '.declaration');
            await $`cp -r ${path.join(overallDeclarationDir, pkg, 'src')} ${outDir}`;
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
        process.exitCode = 1;
    }
}

async function extractApisParametrized(localBuild = false) {
    await Promise.all(DECLARATION_PACKAGES.map((x) => extractPackageApis(x, localBuild)));
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
    await $`pnpx api-documenter markdown -i api-extractor/temp -o packages/docs/api`;
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
    for (const pkg of PUBLISH_PACKAGES) {
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
            .map((x) => path.join(ROOT, 'packages', x, 'dist'))
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
    cd(path.resolve(ROOT, './e2e-spa'));
    await $`pnpm test`;
    cd(__dirname);
}

export const testE2e = series(checkBuild, runTestInE2eSpa);

export const extractAndDocumentApis = series(extractApis, documentApis);

export const build = series(clean, buildDeclarationsOnly, extractApis, parallel(rollup, documentApis));

export const checkCodeIntegrity = series(parallel(unitTests, lint, typeCheck), build, testE2e);

export const buildDeclarations = series(clean, buildDeclarationsOnly);

export { clean, publishAll, extractApis, documentApis, extractApisLocalBuild };
