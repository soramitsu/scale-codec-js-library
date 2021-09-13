# @scale-codec/core

Codecs for primitives and main containers according to the SCALE specification.

## Install

```sh
# Use your favorite PM
npm install @scale-codec/core jsbi
```

### Supported types

Primitive:

-   [x] Integers (8/32/64/128/etc-bits, BE/LE, int/uint)
-   [x] String
-   [x] Boolean

Containers:

-   [x] Arrays
-   [x] Vecs
-   [x] Tuples
-   [x] Maps (any key-value sized data)
-   [x] Structs
-   [x] Enums
-   [x] Sets

### Docs

Build docs:

```sh
pnpm docs:build
```

Serve built docs:

```sh
pnpm docs:serve
```

### Why `JSBI` for numbers?

Because it can be easily migrated to the native BigInt in the future with babel plugin: https://github.com/GoogleChromeLabs/babel-plugin-transform-jsbi-to-bigint

### todo check in bigint encode that number in integer!
