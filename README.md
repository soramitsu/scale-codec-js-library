# scale-codec-js-library

Monorepo with [SCALE codec](https://substrate.dev/docs/en/knowledgebase/advanced/codec) implementation in JavaScript.

### Run tests

```sh
# run unit tests in all packages
pnpm test:unit

# run e2e test in namespace-codegen package
pnpm test:e2e
```

### Build

```sh
pnpm build
```

This will emit `dist` directories in every package that should be published to npm.

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
-   [ ] Find way to remove e2e test package from workspace, isolate it from anything
