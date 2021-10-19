# @scale-codec/definition-tests

It tests teamwork of compiler & runtime. Check points:

-   Definitions are compiled without errors
-   Compiled code doesn't contain any type errors
-   Tests with compiled code are passed

Definitions are defined in the `src/__samples__.ts` file. You can add there new ones or edit existing ones.

Recompile samples:

```shell
pnpm recompile-samples
```

> **Note**: compiled samples **are ignored** by git and samples compilation runs as `postinstall` hook
