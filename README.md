# scale-codec-js-library

Monorepo with [SCALE codec](https://substrate.dev/docs/en/knowledgebase/advanced/codec) implementation in JavaScript.

### Install packages

Install `pnpm` if you do not have it installed:

```sh
npm i -g pnpm
```

Then install packages

```sh
pnpm i
```

### Type-checking

```sh
pnpm type-check
```

### Build

```sh
pnpm build
```

This will emit `dist` directories in every package that should be published to npm.

### Clean builds

```sh
pnpm clean
```

### Test

Test all (in CI):

```sh
pnpm test:all
```

#### Unit

It will run all unit tests in all packages:

```sh
# Run all unit tests in all packages
pnpm test:unit

# You can pass any options to jest directly
pnpm test:unit -- packages/core
```

#### e2e

**Before running e2e test you should to build all packages.**

```sh
pnpm test:e2e
```

Description of how it works in `e2e-spa` directory.

### Publish

```sh
pnpm publish:all
```

### TODO

-   [ ] Rename "namespace" package to some more general?
-   [ ] Auto-docs for every package? Where to publish?
-   [ ] Maybe create some helper/inspector for debugging of encode and decode? It might be useful to see how actual data mapped to final bytes.
