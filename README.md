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

It is necessary to use `pnpm` for publishing too, because it will resolve actual monorepo packages versions instead of special `workspace:` protocol in `package.json`s.

To publish `@scale-codec/enum`, for example, run this:

```sh
pnpm publish --filter @scale-codec/enum
```

You **can not** just run `pnpm publish --recursive`, because it will affect not only necessary packages (e.g. test e2e package in `namespace-codegen`). So to publish all, run this:

```sh
pnpm publish \
--filter @scale-codec/enum \
--filter @scale-codec/util \
--filter @scale-codec/core \
--filter @scale-codec/namespace \
--filter @scale-codec/namespace-codegen
```

### TODO

-   [ ] Rename "namespace" package to some more general?
-   [ ] Auto-docs for every package? Where to publish?
-   [ ] Make special codecs to make work with `Vec<u8>` or `[u8; 32]` more convenient. These types, for example, looks great to convert it into `UInt8Array` than `JSBI[]`
