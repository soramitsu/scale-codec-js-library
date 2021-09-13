import { runAsyncMain, $ } from './util';
import consola from 'consola';
import path from 'path';

runAsyncMain(async () => {
    process.chdir(path.resolve(__dirname, '../'));

    consola.log('Clearing previous artifacts...');
    await $('pnpm', ['clean']);

    consola.log('Building TypeScript declaration...');
    await $('pnpx', [
        'tsc',
        '-p',
        './',
        '--emitDeclarationOnly',
        '--declaration',
        '--declarationDir',
        path.resolve(__dirname, '../.declaration'),
    ]);

    consola.log('Rolling up...');
    await $('pnpx', ['rollup', '-c']);

    consola.success('Build done!');
});
