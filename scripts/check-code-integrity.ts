import { runAsyncMain, $ } from './util';

runAsyncMain(async () => {
    await $('pnpx', ['concurrently', 'pnpm test:unit', 'pnpm lint', 'pnpm type-check']);
    // await $('pnpm', ['build']);
    // await $('pnpm', ['test:e2e']);
});
