<div align="center">
    <h1>SCALE Codec JavaScript</h1>
    <img src="https://img.shields.io/github/checks-status/soramitsu/scale-codec-js-library/master" alt="built status">
    <img src="https://img.shields.io/github/license/soramitsu/scale-codec-js-library" alt="license">
    <p>
        JavaScript implementation of the <a href="https://substrate.dev/docs/en/knowledgebase/advanced/codec">SCALE</a> (Simple Concatenated Aggregate Little-Endian) Codec
    </p>
</div>

> Note: it is the root of the monorepo. Actual packages are located at `./packages/`.

## Online Documentation

[Link](https://soramitsu.github.io/scale-codec-js-library/)

## For DevOps

```bash
# all tests, build, lint, type-ckecking
pnpm check-code-integrity

# just build
pnpm build

# packages publishing
pnpm publish-all

# docs build
# result at packages/docs/.vitepress/dist
pnpm docs:build
```
