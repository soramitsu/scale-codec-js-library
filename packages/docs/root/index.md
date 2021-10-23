# Intro

Here is the documentation for packages that implement SCALE codec in JavaScript.

More about SCALE itself: [Substrate SCALE Codec](https://substrate.dev/docs/en/knowledgebase/advanced/codec).

## Available packages

`@scale-codec/core` contains the core functionality of codec internals, i.e. functions to encode/decode primitives like Strings, Booleans, Integers (signed and unsigned, 8-128 bits) and complex types like Vec, Enums, Structs, Sets, Maps, Arrays etc.

`@scale-codec/enum` contains simple helpers to deal with Rust's Enums.

`@scale-codec/definition-compiler` is a tool that provides a way (one of possible) to compile complex namespaces into TypeScript with strict typing of decodable and encodable types and functions to encode and decode them. Compiler goes arm-in-arm with `@scale-codec/definition-runtime` (you will probably not use it directly) that contains runtime helpers for the compiled output.

`@scale-codec/util` contains common utils used all across the packages.

## goto

-   Package-related guides:
    -   [Core](/lib/core)
    -   [Enum](/lib/enum)
    -   [Definition Compiler](/lib/definition-compiler)
-   [API](/api/) of all packages