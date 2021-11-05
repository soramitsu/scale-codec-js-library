# Core package

`@scale-codec/core` package contains all necessary low-level tools to perform encoding and decoding between SCALE binaries and their JS representations.

## Contents

[[toc]]

## Supported types

**Low-level:**

-   Integers - signed & unsigned, 8/16/32/64/128 bits. For ints with bits less than or equal 32 both `number` & `bigint` could be used, for 64+ bits integers - only `bigint`.
-   Compact (int) - as `bigint`
-   String - as JS `String`
-   Boolean - as JS `Boolean`
-   Void (just for consistence) - as `null`

**Higher-order:**

-   Fixed-length Array - as JS `Array`
-   `[u8; len]` as JS `Uint8Array`
-   Vector - as JS `Array`
-   `Vec<u8>` as JS `Uint8Array`
-   Set - as JS `Set`
-   Map - as JS `Map`
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
import { encodeBigInt, encodeInt } from '@scale-codec/core';

console.log(encodeInt(5_012_009, 'u32'));
console.log(encodeBigInt(-9_009_000_000_000_000_000n, 'i128'));
```

Result:

<BigIntEncode ty="u32" num="5012009" /><br>
<BigIntEncode ty="i128" num="-9009000000000000000" />

[Playground](#bigint-playground)

### Compact

```ts
import { encodeCompact } from '@scale-codec/core';
import { hexifyBytes } from '@scale-codec/util';

for (const num of [1, 34_000, 891_000_000, '24141828384918234']) {
    const encoded = encodeCompact(BigInt(num));
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
import { encodeStruct, encodeStr, encodeBigInt } from '@scale-codec/core';
import { hexifyBytes } from '@scale-codec/util';

interface Message {
    author: string;
    timestamp: bigint;
}

const msg: Message = {
    author: 'Clara',
    timestamp: BigInt('16488182899412'),
};

const msgEncoded = encodeStruct(
    msg,
    {
        author: encodeStr,
        timestamp: (v) => encodeBigInt(v, 'u128'),
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
