# @scale-codec/core ![version](https://img.shields.io/npm/v/@scale-codec/core) ![license](https://img.shields.io/npm/l/@scale-codec/core)

Codecs for primitives and main containers according to the SCALE specification.

Read the [docs](https://soramitsu.github.io/scale-codec-js-library/guide/core)!

## Example

```ts
import { encodeVec, encodeBool, encodeStr, encodeStruct, Encode, encodeBigInt, JSBI } from '@scale-codec/core';

const encodeInt32: Encode<number> = (num) =>
    encodeBigInt(JSBI.BigInt(num), { bits: 64, signed: true, endianness: 'le' });

const bytes = encodeStruct(
    {
        name: 'Hey',
        coins: [5, 0, -88178782],
        adult: true,
    },
    {
        name: encodeStr,
        coins: (arr) => encodeVec(arr, encodeInt32),
        adult: encodeBool,
    },
    ['name', 'coins', 'adult'],
);
```

And there are more!
