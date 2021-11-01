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

<p><template v-for="x in [1, 34_000, 891_000_000, '24141828384918234']">{{ x }}: <code><CompactEncode :num="String(x)" hex /></code><br></template></p>

[Playground](#compact-playground)

### Strings

```ts
import { encodeStr } from '@scale-codec/core';
import { hexifyBytes } from '@scale-codec/util';

console.log(hexifyBytes(encodeStr('Лев Николаевич Толстой')));
```

Result:

<code><StrEncode val="Лев Николаевич Толстой" /></code>

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

<code><CoreStructResult /></code>

### Enum

::: tip
Enums handling is based on `@scale-codec/enum` package. More info at [Enums guide](./enum.md).
:::

Enums handling is more low-level then other tools because of typing issues. Thus, the responsibility to define encode & decode schema correctly is on the end user.

```ts
import { Enum, Valuable, encodeEnum, decodeEnum, encodeStr, decodeStr } from '@scale-codec/core';

type Event = Enum<{
    Focus: null;
    KeyPress: Valuable<string>;
}>;

const myEvent = decodeEnum<Event>(new Uint8Array(/* ... */), {
    // map from discriminants to variant names
    // + optional decode fn for valuable variants
    0: { v: 'Focus' },
    1: { v: 'KeyPress', decode: decodeStr },
});

const encoded = encodeEnum(myEvent, {
    // map from variant names to discriminants
    // + optional encode fn for valuable variants
    Focus: { d: 0 },
    KeyPress: { d: 1, encode: encodeStr },
});
```

### Array, Vec, Tuple

```ts
import { decodeTuple, decodeArray, decodeVec, decodeStr, decodeBool } from '@scale-codec/core';

// [String; 10]
const strings = decodeArray(new Uint8Array(/* ... */), decodeStr, 10);

// (String, bool)
const [str, bool] = decodeTuple(new Uint8Array(/* ... */), [decodeStr, decodeBool]);

// Vec<bool>
const booleans = decodeVec(new Uint8Array(/* ... */), decodeBool);
```

### Map & Set

```ts
import { encodeSet, encodeMap, encodeStr, encodeBool } from '@scale-codec/core';

encodeMap(
    new Map<string, boolean>([
        ['foo', false],
        ['bar', true],
    ]),
    encodeStr,
    encodeBool,
);

encodeSet(new Set<string>(['a', 'b', 'c']), encodeStr);
```

## Play

### BigInt Playground

<BigIntPlayground class="mt-4" />

### Compact Playground

<CompactPlayground class="mt-4" />

## Also

-   [API](../api/core)

### Why `JSBI` for numbers?

Because it can be easily migrated to the native BigInt in the future with a [special JSBI's Babel plugin](https://github.com/GoogleChromeLabs/babel-plugin-transform-jsbi-to-bigint).
