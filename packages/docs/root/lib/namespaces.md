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

It exposes 3 core things - `ScaleInstance` abstract class, `ScaleBuilder` interface and `createScaleBuilder()` helper. First one is a generic container for a SCALE-encodable value; the second one defines a constructor for this container with several entrypoints; and the third one combines both via the unified protocol.

With these 3 tools it is easy to define your own codec. For example, codec for string:

```ts
import { encodeStrCompact, decodeStrCompact } from '@scale-codec/core';
import { createScaleBuilder } from '@scale-codec/definition-runtime';

const Str = createScaleBuilder<string>(
    // Name is assigned to the internally created class for better
    // debugging experience
    'Str',
    encodeStrCompact,
    decodeStrCompact,
);

// encode
const str = Str.fromValue('Omnia mea mecum porto');
const encoded = str.bytes;

// decode
const decodedBack = Str.fromBytes(encoded);
console.log(decodedBack.value); // 'Omnia mea mecum porto'
```

Also it supports extended functionality to handle wrap/unwrap functionality. It is very handy for complex structures with nested `ScaleInstance`s. Anyway, you probably never will work with `createScaleBuilder()` directly - the package also exposes individual helpers for each common SCALE complex type. For example, working with `struct`:

```ts
import { Str, createStructBuilder, InstanceViaBuilder } from '@scale-codec/definition-runtime';

const Person = createStructBuilder<{
    // We tell to the builder that in "wrapped" state the value
    // will have a field with another instance for string
    name: InstanceViaBuilder<typeof Str>;
}>('Person', [['name', () => Str]]);

// Verbose: create & access
let person = Person.fromValue({ name: Str.fromValue('TORII') });
person.value.name.value === 'TORII';

// Short: create & access
let unwrapped = person.unwrap();
unwrapped.name === 'TORII';
person = Person.fromUnwrapped(unwrapped);
```

The greatest thing here is that it is completely typed!

::: tip
Runtime package exposes a set of unparametrized builders like `Str`, `Bool` and others. The list is [below](#predefined-builders).
:::

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

<<< @/lib/snippets/namespace-schema.ts

**Compilation code:**

```ts
import { renderNamespaceDefinition } from '@scale-codec/definition-compiler';
import schema from './schema';

const code = renderNamespaceDefinition(schema);
console.log(code);
```

**Compiled output:**

<<< @/lib/snippets/namespace-schema-compiled.ts

Now the code is usable, and its execution depends on you!

## Predefined builders

<script setup>
import DefaultTypes from './components/DefaultTypes.vue'
</script>

<DefaultTypes />

These builders **defined** at Runtime and Compiler **knows** about them. Anyway, you can customize both runtime lib and known types (see [rendering params at API section](/api/definition-compiler.rendernamespacedefinitionparams.html)).

```ts
import { Str } from '@scale-codec/definition-runtime';
```

## Compiler's Playground

Todo?

## Also

-   [Runtime's API](/api/definition-runtime)
-   [Compiler's API](/api/definition-compiler)
-   [Polkadot.js / types](https://github.com/polkadot-js/api/tree/master/packages/types) - another implementation of SCALE codec with a different namespaces approach
-   [Protobuf.js](https://protobufjs.github.io/protobuf.js/index.html) - implementation not of SCALE, but of Protobuf spec. Their specs have a lot in common.
