# @scale-codec/core ![version](https://img.shields.io/npm/v/@scale-codec/core) ![license](https://img.shields.io/npm/l/@scale-codec/core)

Low-level tools to perform serialization and deserialization via SCALE spec.

Read the [docs](https://soramitsu.github.io/scale-codec-js-library/guide/core)!

## Example

```ts
import { encodeVec, encodeBool, encodeStr, encodeStruct, Encode, encodeInt } from '@scale-codec/core';

const encodeInt32: Encode<number> = (num) => encodeInt(num, 'i32');

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

console.log(bytes);
```

```
Uint8Array(18) [
   12,  72, 101, 121, 12, 5,   0,
    0,   0,   0,   0,  0, 0, 162,
  127, 190, 250,   1
]
```

And there is more!
