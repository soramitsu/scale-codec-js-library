# @scale-codec/core

Codecs for primitives and main containers according to the SCALE specification.

### Supported types

Primitive:

-   [x] Integers (8/32/64/128/etc-bits, BE/LE, int/uint)
-   [x] String
-   [x] Boolean

Containers:

-   [x] Arrays
-   [x] Tuples
-   [x] Maps (any key-value sized data)
-   [x] Structs
-   [x] Enums

### Why `JSBI` for numbers?

Because it can be easily migrated to the native BigInt in the future with babel plugin: https://github.com/GoogleChromeLabs/babel-plugin-transform-jsbi-to-bigint

### TODO

-   [ ] Completely remove `BN.js` from integers codecs.
-   [ ] Auto-generated docs
