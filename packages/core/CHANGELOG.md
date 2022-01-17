# @scale-codec/core

## 0.4.2

### Patch Changes

-   c944775: **feat**: throw meaningfull errors if there are some problems with enum encoders/decoders schema (`encodeEnum` & `decodeEnum`)
-   Updated dependencies [b4c91cf]
    -   @scale-codec/enum@0.2.2

## 0.4.1

### Patch Changes

-   27b7927: Add build status badge to the README
-   Updated dependencies [27b7927]
    -   @scale-codec/enum@0.2.1
    -   @scale-codec/util@0.1.3

## 0.4.0

### Minor Changes

-   8890415: **breaking**: drop `jsbi` replacement for native bigints, use native ones. Int & Compact codecs are completely refactored.

### Patch Changes

-   56a9d2c: Update readme & description in package.json

## 0.3.0

### Minor Changes

-   97dfb7d: **Breaking**: rename `encodeStrCompact`& `encodeStr` to `encodeStr` & `encodeStrRaw` relatively (same for `decodeStr*`)

### Patch Changes

-   26c9dd0: Update readme and `homepage` at `package.json`
-   97dfb7d: Update doc comments, error messages and str encoding internals
-   6d26250: Bump `jsbi` package to `4.0.0`
-   ab6d899: Update typings for Enum encode/decode
-   334a28d: Add keywords to package.json
-   c78d861: Update usage of `Enum`
-   Updated dependencies [26c9dd0]
-   Updated dependencies [c78d861]
-   Updated dependencies [334a28d]
    -   @scale-codec/enum@0.2.0
    -   @scale-codec/util@0.1.2

## 0.2.3

### Patch Changes

-   86cf787: fix: throw an error when the `encodeBigInt` is called with `signed: false` and negative number as source
-   e1598bb: Add a bit more detailed docs
-   a3d7d34: Set `engines` and `engineStrict` fields in core's `package.json`
-   Updated dependencies [b79934e]
-   Updated dependencies [7b92045]
    -   @scale-codec/enum@0.1.1
    -   @scale-codec/util@0.1.1

## 0.2.2

### Patch Changes

-   cfec796: Update dependencies
