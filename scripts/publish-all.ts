import { runAsyncMain, $ } from './util';
import consola from 'consola';
import chalk from 'chalk';

const PACKAGES = ['enum', 'util', 'core', 'namespace', 'namespace-codegen', 'namespace-codegen-cli'];

runAsyncMain(async () => {
    for (const pkg of PACKAGES) {
        const pkgFullName = `@scale-codec/${pkg}`;

        consola.info(chalk`Publishing {blue.bold ${pkgFullName}}`);
        await $('pnpm', ['publish', '--filter', pkgFullName]);

        consola.success(chalk`{blue.bold ${pkgFullName}} published`);
        process.stdout.write('\n');
    }

    consola.info('Done');
});
