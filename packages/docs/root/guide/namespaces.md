<script setup>
import DefaultTypes from './components/DefaultTypes.vue'
</script>

# Handling large namespaces

::: warning
The compiler design is still Work-In-Progress, as well as its implementation. If you have some insigts/ideas how to make it better, you are welcome to create [an issue on GitHub](https://github.com/soramitsu/scale-codec-js-library/issues)!

:::

<!-- ::: info
This package goes arm-in-arm with `@scale-codec/definition-runtime` library.
::: -->

SCALE might (and should!) be used within huge types namespaces with structs, enums, tuples etc that reference to each other. `@scale-codec/definition-runtime` & `@scale-codec/definition-compiler` are made to help with it.

## Contents

[[toc]]

## Runtime: Builders and Instances

It exposes 3 core things - `Fragment` abstract class, `FragmentBuilder` interface and `createBuilder()` helper.

-   `Fragment` is a generic container for value with 2 getters - `value` and `bytes`. Thus you can access its value and encoded bytes simultaneously. It is designed to be **immutable** and due to this it internally uses **lazy computations** with **caching**. It allows:

    -   To prevent unnecessary encoding/decoding (depends on construction way) before its first access;
    -   To prevent re-encoding and re-decoding the same data multiple times.

    Also it is designed to be embeddable into a fractal nested structure with another `Fragment`s (e.g. for structs, enums, maps etc any other complex type).

-   `FragmentBuilder` is an interface that defines multiple ways to construct `Fragment` - from decoded value, from encoded bytes, from unwrapped value (i.e. wrap it back). Also it is responsible to provide a raw decode function.
-   `createBuilder` helper combines the instance and its builder into a single class via a unified protocol. Here you can define encode/decode functions and wrap/unwrap functions (for advanced types).

By the way, there are more high-level tools for specific structures, and some of them described below.

### Primitive builder

Let's create a builder for string:

```ts
import { encodeStrCompact, decodeStrCompact } from '@scale-codec/core'
import { createBuilder } from '@scale-codec/definition-runtime'

const Str = createBuilder<string>(
    // Name is assigned to the internally created class for better
    // debugging experience
    'Str',
    encodeStrCompact,
    decodeStrCompact,
)

// encode
const str = Str.fromValue('Omnia mea mecum porto')
const encoded = str.bytes

// decode
const decodedBack = Str.fromBytes(encoded)
console.log(decodedBack.value) // 'Omnia mea mecum porto'
```

::: tip
Runtime package exposes a set of unparametrized builders like `Str`, `Bool` and others. The list is [below](#predefined-builders).
:::

### Complex builder: struct

```ts
import { Str, ScaleStructBuilder, createStructBuilder, FragmentFromBuilder } from '@scale-codec/definition-runtime'

const Person: ScaleStructBuilder<{
    // We tell to the builder that in "wrapped" state the value
    // will have a field with another instance for string
    name: FragmentFromBuilder<typeof Str>
}> = createStructBuilder('Person', [['name', Str]])

// Verbose: create & access
let person = Person.fromValue({ name: Str.fromValue('TORII') })
person.value.name.value === 'TORII'

// Short: create & access
let unwrapped = person.unwrap()
unwrapped.name === 'TORII'
person = Person.fromUnwrapped(unwrapped)
```

### Current builders trade-offs

Unfortunately, it is hard to achieve these 2 goals simultaneously:

1. Make usage of builders 100% type-safe. **The most important**.
2. Make builders types easy to be inferrenced from the creation helper. **Important too**, especially for ergonomics, but you declare the builder only one time and use it a lot of times.
3. Make builders creation syntax as short and minify-compatible as possible for compilation into large namespaces. **Not critical**, may be workarounded with specialized type-unsafe helpers.

Thus, the current builders design is a compromise between all of these points. You are still responsible to correctly define builders types, but it is still type-checked (partially).

## Compiler: generate builders automatically

The main usage case for SCALE is to use type schema from Rust in another language, in our case in JavaScript. Compiler receives such schema and generates TypeScript code that is compatible with Runtime package.

### Example: schema & compiled output

**Rust types definition:**

```rust
// struct
struct Person {
    name: String,
    age: u8,
    document: PersonDocument
}

// enum
enum PersonDocument {
    Id(u8),
    Passport(Passport)
}

// tuple of passport nums
struct Passport(u32, u32)

// Map
type PersonsMap = HashMap<u8, Person>

// Vec
type PersonsVec = Vec<Person>

struct PublicKey {
    // Fixed-len array
    payload: [u8; 32]
}
```

**Definition for Compiler:**

<<< @/snippets/namespace-schema.ts

**Compilation code:**

```ts
import { renderNamespaceDefinition } from '@scale-codec/definition-compiler'
import schema from './schema'

const code = renderNamespaceDefinition(schema)
console.log(code)
```

**Compiled output:**

<<< @/snippets/namespace-schema-compiled.ts

Now the code is usable, and its execution depends on you!

## Predefined builders

<DefaultTypes />

These builders **defined** at Runtime and Compiler **knows** about them. Anyway, you can customize both runtime lib and known types (see [rendering params at API section](/api/definition-compiler.rendernamespacedefinitionparams.html)).

```ts
import { Str } from '@scale-codec/definition-runtime'
```

## Debugging

`@scale-codec/definition-runtime` provides special Tracking API and one of its possible implementations - Logger. With it, you can enable logging of decode process and/or decode failures. Its usage may look like this:

```ts
import { Logger, createStructBuilder } from '@scale-codec/definition-runtime'

// some complex builder
const StructBuilder = createStructBuilder('Struct' /* ...args */)

// creating logger and mounting it as a current tracker
const logger = new Logger({
    logDecodeSuccesses: true,
})
logger.mount()

// Decode some bytes
const decodedAndUnwrapped = StructBuilder.fromBytes(
    new Uint8Array([
        /* ...bytes */
    ]),
).unwrap()

// Unmount logger if you don't need it more
logger.unmount()
```

Example of its output in Node.js console:

![Example of logger output in node](/img/logger-node-err.png)

And in browser dev tools:

![Example of logger output in Devtools](/img/logger-devtools-err.png)

You can use Tracking API to implement any logic you need. Example of usage:

```ts
import { setCurrentTracker } from '@scale-codec/definition-runtime'

setCurrentTracker({
    decode(loc, input, decodeFn) {
        console.log('Decode step: %o\nInput: %o', loc, input)
        return decodeFn(input)
    },
})
```

#### Possible questions

-   Is there any runtime overhead if I don't use tracking?

Yes, there is some, but it is reduced as possible.

-   Is `Logger` tree-shakable?

Yes, it should be.

## Compiler's Playground

Todo?

## Also

-   [Runtime's API](../api/definition-runtime)
-   [Compiler's API](../api/definition-compiler)
-   [@polkadot/types](https://github.com/polkadot-js/api/tree/master/packages/types) - another implementation of SCALE codec with a different namespaces approach
-   [ts-scale-codec](https://www.npmjs.com/package/@josepot/ts-scale-codec)- another lightweight implementation of SCALE
-   [Protobuf.js](https://protobufjs.github.io/protobuf.js/index.html) - implementation not of SCALE, but of Protobuf spec. Their specs have a lot in common.
