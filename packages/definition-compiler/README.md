# @scale-codec/definition-compiler ![build status](https://img.shields.io/github/checks-status/soramitsu/scale-codec-js-library/master) ![version](https://img.shields.io/npm/v/@scale-codec/definition-compiler) ![license](https://img.shields.io/npm/l/@scale-codec/definition-compiler)

Compiler for `@scale-codec/definition-runtime`.

Read the [docs](https://soramitsu.github.io/scale-codec-js-library/guide/namespaces)!

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
import {
    FragmentFromBuilder,
    ScaleStructBuilder,
    Str,
    createBytesArrayBuilder,
    createStructBuilder,
    dynBuilder,
} from '@scale-codec/definition-runtime'

export const Bytes32 = createBytesArrayBuilder('Bytes32', 32)

export const PublicKey: ScaleStructBuilder<{
    digest: FragmentFromBuilder<typeof Str>
    payload: FragmentFromBuilder<typeof Bytes32>
}> = createStructBuilder('PublicKey', [
    ['digest', dynBuilder(() => Str)],
    ['payload', dynBuilder(() => Bytes32)],
])
```

## TODO

-   [ ] Implement builders sorting due to their dependencies between each other to minimize `dynBuilder()`s' amount.
