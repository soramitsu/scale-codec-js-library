# @scale-codec/namespace

This library provides tools for creating complex namespaces whose types need to be encoded and decoded through SCALE and which can depend on each other.

## Install

```sh
# Use your favorite PM
npm install @scale-codec/namespace jsbi
```

## Example

Rust source code:

```rust
use parity_scale_codec::{Decode, Encode};

#[derive(Encode, Decode)]
struct Id {
    name: String,
    domain: String,
    second_name: Option<String>,
    some_enum: CustomEnum,
    attempt: Result<(), String>,
}

#[derive(Encode, Decode)]
enum CustomEnum {
    One,
    Two(u64, bool, (String, i32)),
}

fn main() {
    let data: Vec<Id> = vec![Id {
        name: String::from("Alice"),
        domain: String::from("Wonderland"),
        second_name: None,
        some_enum: CustomEnum::Two(1234, false, (String::from("fas"), -55)),
        attempt: Ok(()),
    }];

    println!("{:?}", Encode::encode(&data));
    // [4, 20, 65, 108, 105, 99, 101, 40, 87, 111, 110, 100, 101, 114, 108, 97, 110, 100, 0, 1, 210, 4, 0, 0,
    // 0, 0, 0, 0, 0, 12, 102, 97, 115, 201, 255, 255, 255, 0]
}
```

Types namespace definition to use `Id`, `CustomEnum` and other underlying types:

```ts
import {
    Enum,
    EnumSchema,
    Option,
    Result,
    StdCodecs,
    StdTypes,
    Valuable,
    defAlias,
    defEnum,
    defNamespace,
    defOption,
    defResult,
    defStruct,
    defTuple,
    defVec,
} from '@scale-codec/namespace';

export type Namespace = StdTypes & {
    string: Namespace['str'];
    'Option<str>': Option<Namespace['str']>;
    '(string, i32)': [Namespace['string'], Namespace['i32']];
    '(u64, bool, (string, i32))': [Namespace['u64'], Namespace['bool'], Namespace['(string, i32)']];
    Id: {
        name: Namespace['str'];
        domain: Namespace['str'];
        second_name: Namespace['Option<str>'];
        some_enum: Namespace['CustomEnum'];
        attempt: Namespace['Result<(), str>'];
    };
    CustomEnum: Enum<{
        One: null;
        Two: Valuable<Namespace['(u64, bool, (string, i32))']>;
    }>;
    'Result<(), str>': Result<Namespace['()'], Namespace['str']>;
    'Vec<Id>': Namespace['Id'][];
};

export const types = defNamespace<Namespace>({
    ...StdCodecs,
    string: defAlias('str'),
    'Option<str>': defOption('str'),
    '(string, i32)': defTuple(['string', 'i32']),
    '(u64, bool, (string, i32))': defTuple(['u64', 'bool', '(string, i32)']),
    Id: defStruct([
        ['name', 'str'],
        ['domain', 'str'],
        ['second_name', 'Option<str>'],
        ['some_enum', 'CustomEnum'],
        ['attempt', 'Result<(), str>'],
    ]),
    CustomEnum: defEnum(
        new EnumSchema({
            One: { discriminant: 0 },
            Two: { discriminant: 1 },
        }),
        {
            Two: '(u64, bool, (string, i32))',
        },
    ),
    'Result<(), str>': defResult('()', 'str'),
    'Vec<Id>': defVec('Id'),
});
```

Usage:

```ts
/* Deconding */

const ENCODED_VEC_OF_IDS = new Uint8Array([
    4, 20, 65, 108, 105, 99, 101, 40, 87, 111, 110, 100, 101, 114, 108, 97, 110, 100, 0, 1, 210, 4, 0, 0, 0, 0, 0, 0, 0,
    12, 102, 97, 115, 201, 255, 255, 255, 0,
]);
const ids = types.decode('Vec<Id>', ENCODED_VEC_OF_IDS);
// `ids` is typed as `Namespace['Id'][]`

/* Encoding */

const uint8Array = types.encode('Id', ids[0]);
```

## API

### Primitive types

```ts
export interface PrimitiveTypes {
    // Strings will be decoded to JS string
    String: string;

    // Booleans will be a JS boolean
    bool: boolean;

    // Any integers will be encoded to JSBI (BigInt implementation)
    // see `jsbi` package
    u8: JSBI;
    u16: JSBI;
    u32: JSBI;
    u64: JSBI;
    i8: JSBI;
    i16: JSBI;
    i32: JSBI;
    i64: JSBI;
}

export const PrimitiveCodecs = {
    /* codecs for each primitive */
};
```

### Structs

```ts
interface NS extends StdTypes {
    // struct will be decoded directly to JS Object
    Animal: {
        name: NS['str'];
        type: NS['str'];
    };
    AnimalInHouse: {
        // here we reference to another namespace's entry
        // this style is convenient for automatic namespace generation
        animal: NS['Animal'];
        houseSize: StdTypes['u32'];
    };
}

const ns = defNamespace<NS>({
    ...StdCodecs,
    Animal: defStruct(
        // Order of them matters for codec.
        // Defining struct fields as tuples.
        [
            [
                // field name
                'name',
                // reference to field codec in current namespace
                'String',
            ],
            ['type', 'String'],
        ],
    ),
    AnimalInHouse: defStruct([
        ['animal', 'Animal'],
        ['houseSize', 'u32'],
    ]),
});

ns.decode('Animal', new UInt8Array([1, 2, 3]));
// => { name: string; type: string }
```

### Arrays and Vecs (`Vec<T>` etc)

```ts
interface NS extends StdTypes {
    // Decoded arrays will be JS native `Array`s
    'Vec<u64>': NS['u64'][]; // or directly `JSBI[]`;

    // Array with some non-primitive type
    'Vec<Something>': NS['Something'][];

    // fixed arrays from Rust will be default JS arrays
    '[u64, 5]': NS['u64'][];
}

const ns = defNamespace<NS>({
    ...StdCodecs,
    'Vec<u64>': defVec(
        // reference to inner value codec
        'u64',
    ),
    'Vec<Something>': defVec('Something'),
    '[u64, 5]': defArray('u64', 5),
});
```

### Tuples

Tuples are very similar with arrays. They have different typings and codec definitions.

```ts
interface NS extends StdTypes {
    '(u32, bool)': [NS['u32'], NS['bool']];
    '(String, (u32, bool))': [NS['str'], NS['(u32, bool)']];
}

const ns = defNamespace<NS>({
    '(u32, bool)': defTuple(['u32', 'bool']),
    '(String, (u32, bool))': defTuple(['str', '(u32, bool)']),
});
```

### Enums

Example in Rust:

```rust
enum MyEnum {
    EmptyVariant,
    VariantWithStr(String),
    VariantWithTuple(u32, u32)
}
```

Definition:

```ts
interface NS extends StdTypes {
    // In namespace we specifying actual decoded types, and for any
    // enum it will be `EnumInstance<Variants>`
    // Keys - variant names
    // Values - inner variant value. Empty variants may be null or undefined.
    // Valuable variants defining with special `Valuable<T>` type, which is shorthand for
    // `{ value: T }`
    MyEnum: Enum<{
        EmptyVariant: null;
        VariantWithStr: Valuable<NS['str']>;
        // Inner values for 'tuple enums' should be defined separately as tuples
        VariantWithTuple: Valuable<NS['(u32, u32)']>;
    }>;
    '(u32, u32)': [NS['u32'], NS['u32']];
}

const ns = defNamespace<NS>({
    ...StdCodecs,
    '(u32, u32)': defTuple(['u32', 'u32']),
    MyEnum: defEnum(
        // schema contains data about variants and discriminants
        // of the values
        new EnumSchema({
            EmptyVariant: { discriminant: 0 },
            VariantWithStr: { discriminant: 1 },
            VariantWithTuple: { discriminant: 2 },
        }),
        // as second argument we must provide references to codecs
        // for each non-empty variant
        {
            VariantWithStr: 'str',
            VariantWithTuple: '(u32, u32)',
        },
    ),
});
```

Creation:

```ts
// Use type inference
const val1: NS['MyEnum'] = Enum.create('EmptyVariant');
const val2: NS['MyEnum'] = Enum.create('VariantWithStr', 'Hey!');
const val3: NS['MyEnum'] = Enum.create('VariantWithTuple', [JSBI.BigInt(412), JSBI.BigInt(1_000)]);
const val4: NS['MyEnum'] = Enum.create('EmptyVariant', 'some unexpected value'); // error!
const val5: NS['MyEnum'] = Enum.create('VariantWithStr'); // error! where is string?
```

Handy methods:

```ts
// Imperative variant checks
if (myEnumInstance.is('EmptyVariant')) {
    // unable to cast for empty variants
    // `myEnumInstance.as('EmptyVariant')` will fail
    console.log('empty');
} else if (myEnumInstance.is('VariantWithStr')) {
    // here you can safely extract inner variant value
    const val: string = myEnumInstance.as('VariantWithStr');
    console.log('inner:', val);
}

// Simple "pattern matching"
const someMatchReturn: string = myEnumInstance.match({
    EmptyVariant: () => 'this is empty',
    VariantWithStr: (str) => `it contains str: ${str}`,
    VariantWithTuple: ([x, y]) => `it looks like coords: (${x}; ${y})`,
});
// also you can return void from `match` but use it for some
// side-effects
```

Predefined codecs and types for `Option<T>` and `Result<Ok, Err>`:

```ts
function findSomeInteger(numbers: number[]): Option<JSBI> {
    for (const num of numbers) {
        if (num === ~~num) {
            return Enum.create('Some', JSBI.BigInt(num));
        }
    }
    return Enum.create('None');
}

function tryToMakeSomeStuff(): Result<[], string> {
    return Math.random() > 0.3 ? Enum.create('Ok', []) : Enum.create('Err', 'ooops ._.');
}

interface NS extends StdTypes {
    'Option<u32>': Option<JSBI>;
    'Result<(), String>': Result<[], string>;
    '()': [];
}

const ns = defNamespace({
    ...StdCodecs,
    'Option<u32>': defOptionEnum('u32'),
    'Result<(), String>': defResultEnum('()', 'str'),
    '()': defTuple([]),
});
```

### Maps (`HashMap`, `BTreeMap` etc)

```ts
interface NS extends StdTypes {
    // any Rust maps will be converted to native JS `Map`s
    'HashMap<String, u32>': Map<string, JSBI>;
}

const ns = defNamespace({
    ...StdCodecs,
    'HashMap<String, u32>': defMap('String', 'u32'),
});
```
