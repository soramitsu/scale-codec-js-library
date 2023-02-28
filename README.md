# Scale JS

This monorepo contains JavaScript implementation of [SCALE](https://docs.substrate.io/reference/scale-codec/) (Simple Concatenated Aggregate Little-Endian) codec specification.

Packages:

- [`@scale-codec/core`](./packages/core): low-level SCALE building blocks
- [`@scale-codec/enum`](./packages/enum): TypeScript tagged union library
- [`@scale-codec/definition-compiler`](./packages/definition-compiler): code generation tool which transforms high-level type namespace schema into a TypeScript module with strongly typed codecs
- [`@scale-codec/definition-runtime`](./packages/definition-runtime): default runtime library used for the output of the compiler

You can explore API and benchmarks [online]("https://soramitsu.github.io/scale-codec-js-library/).
