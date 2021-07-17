import { runAsyncMain, $ } from './util';

runAsyncMain(async () => {
    await $('pnpx', ['concurrently', 'pnpm test:unit', 'pnpm lint', 'pnpm type-check']);
});
