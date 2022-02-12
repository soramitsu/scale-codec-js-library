# @scale-codec/core

## 1.0.0

### Major Changes

-   **BREAKING**: refactor all codecs, use new encoding & decoding approach

    -   **What is the change**

        Previously this package was built on the top of these core types:

        ```ts
        type Encode<T> = (value: T) => Uint8Array

        type Decode<T> = (input: Uint8Array) => DecodeResult<T>

        type DecodeResult<T> = [value: T, bytesDecoded: number]
        ```

        While encoding, each codec was creating it's own `Uint8Array` instance that is concatenated with other ones. It produces a huge performace goal, because you create a lot of intermediate objects, a lot of memory is allocated during the encoding process.

        Now this package is build on the top of these types:

        ```ts
        interface Walker {
            u8: Uint8Array
            // current walker offset
            idx: number
            // DataView associated with `u8`. Useful for (u)ints
            view: DataView
        }

        interface Encode<T> {
            (value: T, walker: Walker): void
            sizeHint: (value: T) => number
        }

        type Decode<T> = (walker: Walker) => T
        ```

        With a special `Walker` type codecs now are much more performant and writing/reading data without a lot of additional allocations, but they are now much less functional and "pure".

        With size hints its now possible to allocate buffer only once.

    -   **Why the change was made**

        This change increases performance incredibly.

    -   **How to migrate existing code**

        The library exports special `WalkerImpl` utility class to work with codecs. For example, if previously to encode an array of strings, you were doing it like this:

        ```ts
        import { encodeArray, encodeStr } from '@scale-codec/core'

        const encoded = encodeArray(
            [
                /* ... */
            ],
            encodeStr,
            32,
        )
        ```

        Now the same action you can perform in this way:

        ```ts
        import { createArrayEncoder, encodeStr, WalkerImpl } from '@scale-codec/core'

        const encoder = createArrayEncoder(encodeStr, 32)

        const encoded = WalkerImpl.encode(
            [
                /* ... */
            ],
            encoder,
        )
        ```

### Patch Changes

-   Updated dependencies
-   Updated dependencies
-   Updated dependencies
    -   @scale-codec/util@1.0.0
    -   @scale-codec/enum@1.0.0

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
