# Core

This library is a pure low-level performant implementation of SCALE.

## Supported types

-   **Primitive:**

    | Spec    | JS Type             | Details                                                                                                                                                             |
    | ------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
    | Int     | `number`, `bigint`  | signed & unsigned, 8/16/32/64/128/etc bits. For ints with bits less than or equal 32 both `number` & `bigint` could be used, for 64+ bits integers - only `bigint`. |
    | Compact | `number`, `bigint`  | -                                                                                                                                                                   |
    | String  | `string`            | -                                                                                                                                                                   |
    | Bool    | `boolean`           | -                                                                                                                                                                   |
    | Void    | `null`, `undefined` | `()` in Rust. Unfortunately, JavaScript doesn't have zero-cost abstractions, so this codec could be used to handle it.                                              |

-   **Higher-order:**

    | Spec   | JS Type                                        |
    | ------ | ---------------------------------------------- |
    | Array  | `Array`                                        |
    | Vector | `Array`                                        |
    | Tuple  | `Array`, but tuple in TypeScript               |
    | Set    | `Set`                                          |
    | Map    | `Map`                                          |
    | Struct | Plain Object                                   |
    | Enum   | `Enum` from [`@scale-codec/enum`](/guide/enum) |

-   **Special:**

    -   Efficient codec for arrays of bytes, or `[u8; x]` in Rust and `Uint8Array` in JS
    -   Efficient codec for vectors of bytes, or `Vec<u8>` in Rust and `Uint8Array` in JS
    -   `OptionBool`

## Package

Available on NPM:

```bash
npm i @scale-codec/core
```

## Core Concept

All codec functions in the library are built on top of these core types:

```ts
interface Walker {
    u8: Uint8Array
    idx: number
    view: DataView
}

interface Encode<T> {
    (value: T, walker: Walker): void
    sizeHint: (value: T) => number
}

type Decode<T> = (walker: Walker) => T
```

While **encoding**, firstly you should compute the value size prediction with a `.sizeHint(value)` function of `Encode` function, allocate buffer for it, put it into Walker interface and the pass it to the Encode function itself, which will mutate it's buffer and offset index. For example, here is a boolean encode function:

```ts
const encodeBool: Encode<boolean> = (value, walker) => {
    walker.u8[walker.idx++] = value ? 1 : 0
}

encodeBool.sizeHint = () => 1
```

While **decoding**, each decode function reading from Walker's buffer and incrementing it's offset index. For example, here is a boolean decode function:

```ts
const decodeBool: Decode<boolean> = (walker) => {
    return walker.u8[walker.idx++] === 1
}
```

Core library provides a very useful `WalkerImpl` utility to work with codecs:

```ts
const encoded: Uint8Array = WalkerImpl.encode(false, encodeBool)

const decoded: boolean = WalkerImpl.decode(encoded, decodeBool)
```

## Typing Tips

### Tuples

You can use TypeScript tuples to define tuple codecs safely:

```ts
import {
    createTupleEncoder,
    encodeU8,
    encodeStr,
} from '@scale-codec/core'

// (u8, str)
type MyTuple = [number, string]

const encoder = createTupleEncoder<MyTuple>([encodeU8, encodeStr])
```

### Structs

Struct codecs type definition is not completely automatic due to performance reasons and TypeScript limitations. Let's define a sample structure.

Definition in Rust:

```rust
use parity_scale_codec::{Encode, Decode};

#[derive(Encode, Decode)]
struct Message {
    author: String,
    timestamp: u128
}
```

Codecs with core library:

```ts
import {
    createStructEncoder,
    createStructDecoder,
    encodeU128,
    decodeU128,
    encodeStr,
    decodeStr,
} from '@scale-codec/core'

interface Message {
    author: string
    timestamp: bigint
}

const encoder = createStructEncoder<Message>([
    ['author', encodeStr],
    ['timestamp', encodeU128],
])

const decoder = createStructDecoder<Message>([
    ['author', decodeStr],
    ['timestamp', decodeU128],
])
```

Tuples passed to factories are typed only partially, i.e. TypeScript does not provide a guarantee that passed encoders/decoders schema will result into correct codecs. You should ensure by yourself that:

-   The order of fields is correct
-   All fields are defined

### Enums

::: tip
Enums handling is based on `@scale-codec/enum` package. More info at [Enums guide](./enum.md).
:::

::: tip
Core package re-exports everything from `@scale-codec/enum`, so:

```ts
import { Enum, Option /* ... */ } from '@scale-codec/core'
```

:::

Enums codecs _creation_ is even less strongly typed as struct ones. You are responsible to provide the correct schema. Let's define a sample enum.

In Rust:

```rust
enum Event {
    Focus,
    KeyPress(String)
}
```

In TypeScript:

```ts
import { Enum } from '@scale-codec/core'

type Event = Enum<'Focus' | ['KeyPress', string]>
```

Encoder:

```ts
import { createEnumEncoder, encodeStr } from '@scale-codec/core'

const encoder = createEnumEncoder<Event>({
    // map from <tag name> to <discriminant> for empty variants
    Focus: 0,
    // or [<discriminant>, <encode>] for valuable variants
    KeyPress: [1, encodeStr],
})
```

Decoder:

```ts
import { createEnumDecoder, decodeStr } from '@scale-codec/core'

const decoder = createEnumDecoder<Event>({
    // Map from <discriminant> to <tag name> for empty variants
    0: 'Focus',
    // or [<tag name>, <decode>] for valuable variants
    1: ['KeyPress', decodeStr],
})
```

Such approach is not very convenient to use, but it is worth it due to performance reasons.

Enums handling is more low-level then other tools because of typing issues. Thus, the responsibility to define encode & decode schema correctly is on the end user.

## Wrapping Up

This page doesn't describe all functions that it includes. For the more detailed API please refer to the related section.

Anyway, if you need to build a large namespace and avoid a lot of symmetric "encode/decode" functions, use tracking functionality for debugging with almost the same performance, you probably need to explore the next section.
