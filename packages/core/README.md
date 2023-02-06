# @scale-codec/core ![build status](https://img.shields.io/github/checks-status/soramitsu/scale-codec-js-library/master) ![version](https://img.shields.io/npm/v/@scale-codec/core) ![license](https://img.shields.io/npm/l/@scale-codec/core)

Low-level tools to perform serialization and deserialization according to SCALE spec.

[Documentation](https://soramitsu.github.io/scale-codec-js-library/guide/core)

## Example

```ts
import { createStructEncoder, encodeU8, encodeBool, createTupleEncoder, WalkerImpl } from '@scale-codec/core'

type SampleTuple = [number, boolean]

type SampleStruct = {
  tuple: SampleTuple
}

const tupleEncoder = createTupleEncoder<SampleTuple>([encodeU8, encodeBool])
const structEncoder = createStructEncoder<SampleStruct>([['tuple', tupleEncoder]])

const bytes: Uint8Array = WalkerImpl.encode<SampleStruct>({ tuple: [5, false] }, structEncoder)
```
