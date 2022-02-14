# @scale-codec/definition-compiler ![build status](https://img.shields.io/github/checks-status/soramitsu/scale-codec-js-library/master) ![version](https://img.shields.io/npm/v/@scale-codec/definition-compiler) ![license](https://img.shields.io/npm/l/@scale-codec/definition-compiler)

Compiler for `@scale-codec/definition-runtime`.

<!-- TODO -->
<!-- Read the [docs](https://soramitsu.github.io/scale-codec-js-library/guide/namespaces)! -->

## Example

```ts
import { renderNamespaceDefinition } from '@scale-codec/definition-compiler'
import fs from 'fs'

const code = renderNamespaceDefinition({
    PublicKey: {
        t: 'struct',
        fields: [
            { name: 'digest', ref: 'Str' },
            { name: 'payload', ref: 'Bytes32' },
        ],
    },
    Bytes32: {
        t: 'bytes-array',
        len: 32,
    },
})

fs.writeFileSync('./output.ts', code)
```

```ts
// output.ts
import { Str, StructCodec, createArrayU8Codec, createStructCodec, dynCodec } from '@scale-codec/definition-runtime'

export const Bytes32 = createArrayU8Codec('Bytes32', 32)

export const PublicKey: StructCodec<{
    digest: typeof Str
    payload: typeof Bytes32
}> = createStructCodec('PublicKey', [
    ['digest', dynCodec(() => Str)],
    ['payload', dynCodec(() => Bytes32)],
])
```

## TODO

-   [ ] Implement builders sorting due to their dependencies between each other to minimize `dynBuilder()`s' amount.
-   [ ] Optimize creation of `DynBuilder`s - do it only once per module, hoist them at the beginning of it.
