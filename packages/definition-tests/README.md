# @scale-codec/definition-tests

This package contains a set of samples compiled by `@scale-codec/definition-compiler`. It has 2 purposes:

-   Some unit tests by `jest` - it runs globally for the whole monorepo;
-   Type-check of the output - which runs, again, globally for the whole monorepo.

## Add new samples || update old

1. Edit `src/__samples__.ts`
2. Run `pnpm recompile-samples`
