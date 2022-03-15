# scale-codec-js-library ![build status](https://img.shields.io/github/checks-status/soramitsu/scale-codec-js-library/master) ![license](https://img.shields.io/github/license/soramitsu/scale-codec-js-library)

Monorepo with [SCALE codec](https://substrate.dev/docs/en/knowledgebase/advanced/codec) implementation in JavaScript.

## Install

Install `pnpm` if you do not have it installed:

```bash
npm i -g pnpm
```

Then install packages

```bash
pnpm i
```

## Read The Docs

> **Documentation is outdated and WIP.**

[Read online](https://soramitsu.github.io/scale-codec-js-library/)

Locally:

```bash
pnpm docs:dev
```

## For DevOps

```bash
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
