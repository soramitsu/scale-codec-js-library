# e2e-spa

Small package for e2e testing purposes. It contains simple function that encodes and decodes some complex data and checks that before and after states are equivalent. Package contains single Jest unit test (nodejs env) that asserts the result of the function, and single Cypress test (browser env), which starts vite dev server, and asserts that after button clicking on the result element appears text 'ok', which means that encoding and decoding in browser environment passed ok.

Test requirements:

-   Packages should be built

This test case checks:

-   Namespace generation works without errors
-   In generated code there no type errors
-   There is no runtime errors in nodejs environment, which means that `cjs` build is ok
-   There is no runtime errors in browser environment, which means that `esm` build is ok
-   Encoding and decoding works fine in both environments

Commands sequence:

```sh
# if not initialized
pnpm i

pnpm clean
pnpm compile-definition
pnpm test:types
pnpm test:node
pnpm test:cy
```

### TODO

-   Test encoding as-is
