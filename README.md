# scale-codec-js-library ![build status](https://img.shields.io/github/checks-status/soramitsu/scale-codec-js-library/master) ![license](https://img.shields.io/github/license/soramitsu/scale-codec-js-library)

Monorepo with [SCALE codec](https://substrate.dev/docs/en/knowledgebase/advanced/codec) implementation in JavaScript.

## Install

Install `pnpm` if you do not have it installed:

```shell
npm i -g pnpm
```

Then install packages

```shell
pnpm i
```

### Read The Docs

Published at GitHub Pages [here](https://soramitsu.github.io/scale-codec-js-library/).

Locally:

```shell
pnpm docs:dev
```

## For DevOps

```shell
# all tests, build, lint, type-ckecking
pnpm check-code-integrity

# just build
pnpm build

# packages publishing
pnpm publish-all

# docs build
# result at packages/docs/root/.vitepress/dist
pnpm docs:build
```
