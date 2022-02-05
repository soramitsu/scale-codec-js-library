# Contribution

Ok... I will try to imagine how I will return to this repo after 6 months.

## Prepare

Clone repo:

```shell
git clone https://github.com/soramitsu/scale-codec-js-library.git
```

Install packages (use [`pnpm`](https://pnpm.io/) as package manager) in the repo root:

```shell
pnpm i
```

## IDE setup

-   VSCode + Prettier-ESLint extension (single one) with auto-formatting
-   Open in repo root

## Scripts

::: tip
[Gulp](https://gulpjs.com/) is used for scripts organisation.
:::

### Explore docs

```shell
pnpm docs:dev

# for deploying
pnpm docs:build
```

::: warning
Generated APIs' markdown isn't tracked by Git, so to see the API section in the docs, you have to build them:

```shell
pnpm build:declarations
pnpm api:extract
pnpm api:docs
# or api:all

# or all-in-one
pnpm build
```

:::

### Run all checks

```shell
pnpm check-code-integrity
```

Useful in CI/CD.

### Work with `api-extractor`

```shell
pnpm api:extract
pnpm api:docs

# extract + docs
pnpm api:all

# update reports (for local usage)
pnpm api:extract:local
```

::: tip
By default `api:extract` script fails if extracted API reports are not the same as existing ones. It is usefull for CI. To override API reports use `api:extract:local`.
:::

### Build

Cleans all, builds declarations and code roll-ups, extracts APIs to reports and generated doc files to `packages/docs/api/`.

```shell
pnpm build
```

### Just update APIs

```shell
pnpm api:all
```

## Changesets

Repo is set up to use [changesets](https://github.com/atlassian/changesets) for automatic changelogs generation and bumping of packages' versions.

#### Also

-   [Backstage project - writing changesets](https://backstage.io/docs/getting-started/contributors#writing-changesets)

## Testing

Project tests are separated into 2 parts - unit with Jest and integrational with Cypress.

### Unit

There is the single `jest.config.js` in the monorepo root. Unit tests run all at once for the whole repo with command:

```shell
pnpm test:unit
```

### e2e-spa

Its main purpose to check if the whole `@scale-codec/*` toolchain works from installation to code generation and usage in nodejs and browser.

It uses few hacks to test **actual builds** of the runtime & dev toolchains. Read more about it in the related README (in `e2e-spa` dir). Thus, you have to run this test after the build:

```shell
pnpm build
pnpm test:e2e
```
