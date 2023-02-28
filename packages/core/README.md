# @scale-codec/core ![build status](https://img.shields.io/github/checks-status/soramitsu/scale-codec-js-library/master) ![version](https://img.shields.io/npm/v/@scale-codec/core) ![license](https://img.shields.io/npm/l/@scale-codec/core)

Low-level tools to perform serialization and deserialization according to SCALE spec.

## Installation

Available on NPM:

```bash
npm i @scale-codec/core
```

## Example

**Encode:**

```ts
import { createStructEncoder, Encode, encodeStr, encodeU64, WalkerImpl } from '@scale-codec/core'

const foo = { bar: 'baz', foo: 90n }

const encodeFoo: Encode<typeof foo> = createStructEncoder([
  ['bar', encodeStr],
  ['foo', encodeU64],
])

const bytes = WalkerImpl.encode(foo, encodeFoo)
```

**Decode:**

```ts
import { Decode, WalkerImpl, createStructDecoder, decodeStr, decodeU64 } from '@scale-codec/core'

const bytes = new Uint8Array([12, 98, 97, 122, 90, 0, 0, 0, 0, 0, 0, 0])

interface Foo {
  bar: string
  foo: bigint
}

const decodeFoo: Decode<Foo> = createStructDecoder([
  ['bar', decodeStr],
  ['foo', decodeU64],
])

const foo = WalkerImpl.decode(bytes, decodeFoo)
```

## Supported types

**Primitive:**

| Spec      | JS Type             | Details                                                                                                                                                           |
| --------- | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Int       | `number`, `bigint`  | signed/unsigned, 8/16/32/64/128/etc bits. For integers with 64+ bits, you can only use `bigint`. For integers with less bits, you can use both `number` and `bigint`. |
| Compact   | `number`, `bigint`  | -                                                                                                                                                                 |
| String    | `string`            | -                                                                                                                                                                 |
| Bool      | `boolean`           | -                                                                                                                                                                 |
| Unit type | `null`, `undefined` | `()` in Rust. JavaScript doesn't have zero-cost abstractions, so this codec could be used to handle them.                                            |

**Higher-order:**

| Spec   | JS Type                                                                                                             |
| ------ | ------------------------------------------------------------------------------------------------------------------- |
| Array  | `Array`                                                                                                             |
| Vector | `Array`                                                                                                             |
| Tuple  | `Array`, but tuple in TypeScript                                                                                    |
| Set    | `Set`                                                                                                               |
| Map    | `Map`                                                                                                               |
| Struct | Plain `Object`                                                                                                      |
| Enum   | `Variant` from [`@scale-codec/enum`](https://github.com/soramitsu/scale-codec-js-library/tree/master/packages/enum) |

**Special:**

- Efficient codec for arrays of bytes (`[u8; x]` in Rust and `Uint8Array` in JS)
- Efficient codec for vectors of bytes (`Vec<u8>` in Rust and `Uint8Array` in JS)
- `OptionBool`

## API

[Link](https://soramitsu.github.io/scale-codec-js-library/api/modules/scale_codec_core)