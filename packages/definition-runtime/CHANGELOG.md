# @scale-codec/definition-runtime

## 2.0.0

### Major Changes

-   1f92e19: **BREAKING**: updated runtime for updated compiler. See related compiler's changelog

### Patch Changes

-   Updated dependencies [1f92e19]
    -   @scale-codec/core@1.0.1

## 1.0.0

### Major Changes

-   **BREAKING**

    -   **What is the change**

        -   `Fragment`s are dropped - they produced a lot of performance overhead
        -   Simple codecs built on top of the new performant `core` library

    -   **Why the change was made**

        Due to performance reasons.

### Patch Changes

-   Updated dependencies
-   Updated dependencies
    -   @scale-codec/core@1.0.0
    -   @scale-codec/util@1.0.0

## 0.8.2

### Patch Changes

-   54c0866: docs: clean README

## 0.8.1

### Patch Changes

-   27b7927: Add build status badge to the README
-   Updated dependencies [27b7927]
    -   @scale-codec/core@0.4.1
    -   @scale-codec/util@0.1.3

## 0.8.0

### Minor Changes

-   31a546d: **breaking**: drop `createAliasBuilder` & `dynBuilder`, introduce `dynGetters` for both cases.

    There were 2 problems:

    -   `DynBuilder` didn't support extended builders such as `ScaleEnumBuilder` with its own helpers to define variants.
    -   `createAliasBuilder` didn't support the same thing and generally was like a stub for `DynBuilder`

    Now, it is solved with `dynGetters` that creates a Proxy to any object and dispatches its props in the moment when they are being got. It supports simple extensions over `FragmentBuilder` like `ScaleEnumBuilder`'s are. And now any aliases are closer to be "just another name for the object", except the fact that it will be a proxy to an object. Compiler now respects this approach.

## 0.7.0

### Minor Changes

-   **feat**: add `defineUnwrap` helper to the generic `FragmentBuilder`
-   **feat**: add `variants` and `variantsUnwrapped` helpers to the Enum builders

## 0.6.0

### Minor Changes

-   **feat**: Tracking API

## 0.5.0

### Minor Changes

-   8890415: **breaking**: update int codecs due to breaking changes in core package

### Patch Changes

-   Updated dependencies [56a9d2c]
-   Updated dependencies [8890415]
    -   @scale-codec/core@0.4.0

## 0.4.0

### Minor Changes

-   c78d861: **Breaking**:

    -   Runtime: new approach with `Fragment`, `FragmentBuilder` and others
    -   Compiler: drop vue & prettier + new approach for new runtime

### Patch Changes

-   26c9dd0: Update readme and `homepage` at `package.json`
-   334a28d: Add keywords to package.json
-   Updated dependencies [26c9dd0]
-   Updated dependencies [97dfb7d]
-   Updated dependencies [6d26250]
-   Updated dependencies [97dfb7d]
-   Updated dependencies [ab6d899]
-   Updated dependencies [334a28d]
-   Updated dependencies [c78d861]
    -   @scale-codec/core@0.3.0
    -   @scale-codec/util@0.1.2

## 0.1.3

### Patch Changes

-   b427748: Add general package documentation
-   Updated dependencies [86cf787]
-   Updated dependencies [e1598bb]
-   Updated dependencies [a3d7d34]
    -   @scale-codec/core@0.2.3

## 0.1.2

### Patch Changes

-   cfec796: Update dependencies
-   Updated dependencies [cfec796]
    -   @scale-codec/core@0.2.2
