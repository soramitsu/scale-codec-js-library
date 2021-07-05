// eslint-disable-next-line spaced-comment
/// <reference types="zx"/>

/* eslint-disable no-undef */

import path from 'path';

console.log(chalk`{blue.bold ** Running simple e2e test}\n`);

cd(path.join(__dirname, 'simple'));

await $`pnpm i`;
await $`pnpm clean`;
await $`pnpm gen`;
await $`pnpm test`;

console.log(chalk`\n{green.bold ** Simple e2e test passed!}`);
