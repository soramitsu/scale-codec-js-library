# `@scale-codec/definition-compiler`

::: warning
The compiler design is still Work-In-Progress, as well as its implementation. Current goals are:

-   100% typed output
-   Good TypeScript performance
-   Tree-shake ability of the compiled code
-   Explicitness due to verbosity

If you have some insigts/ideas how to make it better, you are welcome to create [an issue on GitHub](https://github.com/soramitsu/scale-codec-js-library/issues)!

:::

::: info
This package goes arm-in-arm with `@scale-codec/definition-runtime` library.
:::

SCALE might (and should!) be used within huge types namespaces with structs, enums, tuples etc that reference to each other. This tool helps to define a namespace schema and compile it into a TypeScript code which represents ESModule.

**It works only in Node.js yet :&lt;**

## Contents

[[toc]]

## Concept

Let's play around simple `Message` struct:

```rust
struct Message {
    content: String,
    timestamp: u128
}
```

You would like to construct it, mutate, access to its contents, encode to binary and decode from binary. Compiler will generate for you 4 entries related to this type:

-   `Message_Decoded` is an interface of **decoded** type representation, in our case it is:

```ts
interface Message_Decoded {
    content: string;
    timestamp: JSBI;
}
```

-   `Message_Encodable` is an interface that defines **encodable** structure for this type. It is an extension of `*_Decoded` type usually with some additions to make possible to skip already encoded parts for performance reasons. For `Message` it is:

```ts
interface Message_Encodable {
    content: string | EncodeAsIs;
    timestamp: JSBI | EncodeAsIs;
}
```

::: tip
Each complex type (tuple, enum, map, vec etc) has its own `Encodable` building approach.
:::

-   `Message_decode` is a **decode function** for `Message` that accepts `Uint8Array` as the input and returns `DecodeResult<Message_Decoded>` as the output:

```ts
declare function Message_decode(bytes: Uint8Array): DecodeResult<Message_Decoded>;
```

-   `Message_encode` is an **encode function** for `Message` that accepts `Message_Encodable` as the input and returns `Uint8Array` as the output:

```ts
declare function Message_encode(encodable: Message_Encodable): Uint8Array;
```

Usage of compiled output might look like this:

```ts
import { JSBI } from '@scale-codec/definition-runtime';
import { Message_Decoded, Message_encode } from './compiled';

const msg: Message_Decoded = {
    content: 'Omnia mea mecum porto',
    timestamp: JSBI.BigInt(88182348),
};

const encoded = Message_encode(msg);
```

## Example: schema & compiled output

Rust types definition:

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

Definition for `@scale-codec/definition-compiler`:

<<< @/lib/snippets/namespace-schema.ts

Compilation code:

```ts
import { renderNamespaceDefinition } from '@scale-codec/definition-compiler';
import schema from './schema';

renderNamespaceDefinition(schema, {
    importLib: '@scale-codec/definition-runtime',
}).then((x) => {
    console.log(x);
});
```

<details>
<summary>Compiled output</summary>

<<< @/lib/snippets/namespace-schema-compiled.ts

</details>

Now the code is usable, and its execution depends on you!

::: tip
Mind that compiled code depends on `@scale-codec/definition-runtime` library.
:::

## Install

```shell
# compiler as dev dependency
npm i --save-dev @scale-codec/definition-compiler

# runtime as plain dependency if you want to run the compiled output
npm i @scale-codec/definition-runtime
```

::: tip
It is not necessary to install runtime library in the same package where you install compiler - it is only necessary for the final runtime, where you are going to finally run the compiled code. It's even possible to define any other runtime and its module name in params of the compiler's render function.
:::

## Available STDs

<<< @/../definition-compiler/src/definitions.ts#stds

## Playground

WIP. It doesn't work in Web yet because of implementation details.

## Also

-   [API](/api/definition-compiler)
-   [Polkadot.js / types](https://github.com/polkadot-js/api/tree/master/packages/types) - another implementation of SCALE codec
-   [Protobuf.js](https://protobufjs.github.io/protobuf.js/index.html) - implementation not of SCALE, but of Protobuf spec. Their specs have a lot in common.
