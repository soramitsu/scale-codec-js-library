# @scale-codec/definition-runtime ![build status](https://img.shields.io/github/checks-status/soramitsu/scale-codec-js-library/master) ![version](https://img.shields.io/npm/v/@scale-codec/definition-runtime) ![license](https://img.shields.io/npm/l/@scale-codec/definition-runtime)

Base tool to build complex type namespaces with SCALE-codec.

<!-- TODO -->
<!-- Read the [docs](https://soramitsu.github.io/scale-codec-js-library/guide/namespaces)! -->

## Example

```ts
import {
    createTupleCodec,
    createStructCodec,
    TupleCodec,
    StructCodec,
    U8,
    Bool,
    CodecValueDecoded,
} from '@scale-codec/definition-runtime'

const SampleTuple: TupleCodec<[typeof U8, typeof Bool]> = createTupleCodec('SampleTuple', [U8, Bool])

const SampleStruct: StructCodec<{
    tuple: typeof SampleTuple
}> = createStructCodec('SampleStruct', [['tuple', SampleTuple]])

const bytes: Uint8Array = SampleStruct.toBuffer({ tuple: [5, false] })

const value: CodecValueDecoded<typeof SampleStruct> = SampleStruct.fromBuffer(bytes)

// actual type
const actual: { tuple: [number, boolean] } = value
```
