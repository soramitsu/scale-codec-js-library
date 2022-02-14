# @scale-codec/definition-compiler

## 1.0.0

### Major Changes

-   **BREAKING** - update compiler due to the slightly updated runtime package.

### Patch Changes

-   Updated dependencies
    -   @scale-codec/util@1.0.0

## 0.8.1

### Patch Changes

-   27b7927: Add build status badge to the README
-   Updated dependencies [27b7927]
    -   @scale-codec/util@0.1.3

## 0.8.0

### Minor Changes

-   31a546d: **breaking**: drop `createAliasBuilder` & `dynBuilder`, introduce `dynGetters` for both cases.

    There were 2 problems:

    -   `DynBuilder` didn't support extended builders such as `ScaleEnumBuilder` with its own helpers to define variants.
    -   `createAliasBuilder` didn't support the same thing and generally was like a stub for `DynBuilder`

    Now, it is solved with `dynGetters` that creates a Proxy to any object and dispatches its props in the moment when they are being got. It supports simple extensions over `FragmentBuilder` like `ScaleEnumBuilder`'s are. And now any aliases are closer to be "just another name for the object", except the fact that it will be a proxy to an object. Compiler now respects this approach.

## 0.4.0

### Minor Changes

-   c78d861: **Breaking**:

    -   Runtime: new approach with `Fragment`, `FragmentBuilder` and others
    -   Compiler: drop vue & prettier + new approach for new runtime

-   3441cdb: **Breaking**: definition for "external" types now uses `import` tag instead of `external`

### Patch Changes

-   26c9dd0: Update readme and `homepage` at `package.json`
-   334a28d: Add keywords to package.json
-   Updated dependencies [26c9dd0]
    -   @scale-codec/util@0.1.2

## 0.3.0

### Minor Changes

-   1904251: Update type exports and documentation

### Patch Changes

-   07d0d6e: Hide `WithTMark` from public API; fix doc comment

## 0.2.0

### Minor Changes

-   ac55aa8: feat: new optional feature - rollup single tuple into an alias of the inner type
-   a1b1a98: feat: support definitions for external types
-   4a77d16: feat: now it is possible to define codec aliases

### Patch Changes

-   cfec796: Update dependencies
