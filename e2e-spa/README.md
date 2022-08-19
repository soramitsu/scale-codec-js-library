# e2e-spa

It is a small package that helps to perform End-To-End testing for the whole `@scale-codec/*` libraries family.

Includes:

- Definition compilation in Node.js with the definition compiler
- Type-check of the compiled output (in pair with the rest of code that depends on the compiled output)
- Running encode-decode test in Node.js
- Running the same test in a browser with Cypress

Hacks used to ensure that finally published libraries really work:

- Direct usage of `dist/lib.cjs` of `@scale-codec/definition-compiler` within `gulpfile.ts`
- Aliasing to `./runtime-rollup/index.cjs.js` from `@scale-codec/definition-runtime` within `jest.config.js`
- Aliasing to `./runtime-rollup/index.esm.js` from `@scale-codec/definition-runtime` within `vite.config.ts`

The `./runtime-rollup` directory (that is ignored by Git) is created during the main `rollup` during the `build` monorepo and it is a bundled `@scale-codec/definition-runtime` with all its externals.

## Running test

**Important**: run `pnpm build` in the root of the monorepo before running this test-package!

```shell
pnpm test
```
