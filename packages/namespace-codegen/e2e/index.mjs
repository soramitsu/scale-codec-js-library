// eslint-disable-next-line spaced-comment
/// <reference types="zx"/>

/* eslint-disable no-undef */

import path from 'path';

console.log(chalk.bold(`Running simple e2e test`));

cd(path.join(__dirname, 'simple'));

await $`pnpm i`;
await $`pnpm test`;

console.log(chalk`Looks like test passed! {green.bold ok!}`);
