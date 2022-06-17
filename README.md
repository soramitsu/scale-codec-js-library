<div align="center">
    <h1>SCALE Codec JavaScript</h1>
    <img src="https://img.shields.io/github/checks-status/soramitsu/scale-codec-js-library/master" alt="built status">
    <img src="https://img.shields.io/github/license/soramitsu/scale-codec-js-library" alt="license">
    <p>
        JavaScript implementation of the <a href="https://substrate.dev/docs/en/knowledgebase/advanced/codec">SCALE</a> (Simple Concatenated Aggregate Little-Endian) Codec
    </p>
    <p>
        <a href="https://soramitsu.github.io/scale-codec-js-library/">Documentation</a>
    </p>
</div>

> Note: it is the root of the monorepo. Actual packages are located at `./packages/`.

## Working with the monorepo

1. Use [pnpm](https://pnpm.io/)
2. Explore Jake scripts:

   ```bash
   pnpm jake -t
   ```

   ```bash
   jake clean                      # Clean all build artifacts
   jake compiler-samples:clean     # Clean compiler samples
   jake compiler-samples:compile   # Compile samples
   jake compile-docs-namespace     # Compile namespace from documentation to be used within snippet
   jake build-types                # Build types
   jake api:extract                # Extract APIs and fail if they mismatch
   jake api:extract-local          # Extract APIs and update them
   jake api:extract-local-only     # Extarct API in local mode without build
   jake api:extract-only           # Extarct API without build
   jake api:document               # Generate Markdown docs from extracted APIs
   jake api:extract-and-document   # Shorthand for both extract and document apis
   jake test:unit                  # Run unit-tests
   jake test:e2e-spa               # Run end-to-end SPA test
   jake test:all                   # Run all tests
   jake build                      # Build packages, extract APIs and documentation
   jake check-code-integrity       # All-in-one code check
   jake publish-all                # Publish built packages. It does not build packages, only publish them.
   ```

### Lint/Format

Project uses [Prettier ESLint](https://github.com/prettier/prettier-eslint/).

#### Check

```bash
pnpm lint:check
```

#### Fix

```bash
pnpm lint:fix
```

### CI/CD Scripts

#### All-in-one check

```bash
pnpm check-code-integrity
```

#### Build packages

```bash
pnpm build
```

#### Publish packages

```bash
pnpm publish-all
```

#### Build documentation

```bash
pnpm docs:build

```

Output will be at `packages/docs/.vitepress/dist`.
