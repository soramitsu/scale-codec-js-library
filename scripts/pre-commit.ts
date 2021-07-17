import { runAsyncMain, $ } from './util';

runAsyncMain(async () => {
    await $('pnpx', ['concurrently', 'pnpm test:unit', 'pnpm type-check', 'pnpm lint']);
});
