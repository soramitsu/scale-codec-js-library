# Core package

`@scale-codec/core` package contains all necessary low-level tools to perform encoding and decoding between SCALE binaries and their JS representations.

## Contents

[[toc]]

## Supported types

-   Primitives
    -   Integers - signed & unsigned, 8/16/32/64/128 bits, as [`JSBI` (`BigInt` replacement for compatibility)](https://github.com/GoogleChromeLabs/jsbi), and...
        -   Compact (special integers representation) - as `JSBI` too
    -   String - as native JS `String`
    -   Boolean - as native JS `Boolean`
    -   Void (just for consistence) - as `null`
-   Complex
    -   Fixed-length Array - as JS `Array`, and...
        -   `[u8; len]` as JS `Uint8Array`
    -   Vector - as JS `Array`, and...
        -   `Vec<u8>` as JS `Uint8Array`
    -   Set - as native JS `Set`
    -   Map - as native JS `Map`
    -   Struct - as JS object
    -   Tuple - as JS `Array`
    -   Enum (+ special codec for OptionBool) - as `Enum` from [`@scale-codec/enum` package](./enum)

## Usage examples

<script setup>
import BigIntPlayground from './components/BigIntPlayground.vue'
import BigIntEncode from './components/BigIntEncode.vue'
import CompactPlayground from './components/CompactPlayground.vue'
import CompactEncode from './components/CompactEncode.vue'
import StrEncode from './components/StrEncode.vue'
import CoreStructResult from './components/CoreStructResult.vue'
</script>

### Integers

```ts
import { encodeBigInt, JSBI } from '@scale-codec/core';

const num = JSBI.BigInt(5_012_009);
const encoded = encodeBigInt(num, {
    bits: 32,
    signed: false,
    endianness: 'le',
});

console.log(encoded);
```

Result:

<BigIntEncode :bits="32" endianness="le" num="5012009" />

[Playground](#bigint-playground)

### Compact

```ts
import { encodeCompact, JSBI } from '@scale-codec/core';
import { hexifyBytes } from '@scale-codec/util';

for (const num of [1, 34_000, 891_000_000, '24141828384918234']) {
    const encoded = encodeCompact(JSBI.BigInt(num));
    console.log('%s: %s', num, hexifyBytes(encoded));
}
```

Result:

<div><template v-for="x in [1, 34_000, 891_000_000, '24141828384918234']">{{ x }}: <CompactEncode :num="String(x)" hex /><br></template></div>

[Playground](#compact-playground)

### Strings

```ts
import { encodeStrCompact } from '@scale-codec/core';
import { hexifyBytes } from '@scale-codec/util';

console.log(hexifyBytes(encodeStrCompact('Лев Николаевич Толстой')));
```

Result:

<StrEncode val="Лев Николаевич Толстой" />

### Other primitives

```ts
import { encodeBool, decodeBool, encodeVoid, decodeVoid } from '@scale-codec/core';

function assertEq(a: any, b: any) {
    // asserting deep equality between a & b...
}

assertEq(encodeBool(false), new Uint8Array([0]));
assertEq(encodeBool(true), new Uint8Array([1]));
assertEq(decodeBool(new Uint8Array([1])), [true, 1]);

assertEq(decodeVoid(new Uint8Array()), [null, 0]);
assertEq(decodeVoid(new Uint8Array([1, 2, 4, 5])), [null, 0]);
```

### Struct

Definition in Rust:

```rust
use parity_scale_codec::{Encode, Decode};

#[derive(Encode, Decode)]
struct Message {
    author: String,
    timestamp: u128
}
```

Definition & encoding in JavaScript:

```ts
import { encodeStruct, JSBI, encodeStrCompact, encodeBigInt } from '@scale-codec/core';
import { hexifyBytes } from '@scale-codec/util';

interface Message {
    author: string;
    timestamp: JSBI;
}

const msg: Message = {
    author: 'Clara',
    timestamp: JSBI.BigInt('16488182899412'),
};

const msgEncoded = encodeStruct(
    msg,
    {
        author: encodeStrCompact,
        timestamp: (v) =>
            encodeBigInt(v, {
                bits: 128,
                signed: false,
                endianness: 'le',
            }),
    },
    ['author', 'timestamp'],
);

console.log(hexifyBytes(msgEncoded));
```

Output:

<CoreStructResult />

### More example

Todo for:

-   Map
-   Set
-   Tuple
-   Array & Vec
-   Enum

## Play

### BigInt Playground

<BigIntPlayground class="mt-4" />

### Compact Playground

<CompactPlayground class="mt-4" />

## Also

-   [API](../api/core)
