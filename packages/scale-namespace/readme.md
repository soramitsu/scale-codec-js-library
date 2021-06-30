# @scale-codec/namespace

This library provides tools for creating complex namespaces whose types need to be encoded and decoded through SCALE and which can depend on each other.

## Example

> **TODO**: update examples after enums refactoring

Rust source code:

```rust
use parity_scale_codec::{Decode, Encode};

#[derive(Encode, Decode)]
struct Person {
    first_name: String,
    last_name: String,
    age: u32,
    gender: Gender,
}

#[derive(Encode, Decode)]
enum Gender {
    Male,
    Female,
}

#[derive(Encode, Decode)]
struct Country {
    persons: Vec<Person>,
    government: GovernmentType,
}

#[derive(Encode, Decode)]
enum GovernmentType {
    Anarchy,
    Dictatorship(DictatorInfo),
    Senate(SenateInfo),
}

#[derive(Encode, Decode)]
struct DictatorInfo {
    person: Person,
    assasination_attempts: u32,
}

#[derive(Encode, Decode)]
struct SenateInfo {
    senators_count: u32,
}

fn main() {
    let country = Country {
        persons: vec![
            Person {
                first_name: String::from("Ro"),
                last_name: String::from("Ra"),
                age: 20,
                gender: Gender::Male,
            },
            Person {
                first_name: String::from("Oty"),
                last_name: String::from("Pola"),
                age: 30,
                gender: Gender::Female,
            },
        ],
        government: GovernmentType::Senate(SenateInfo {
            senators_count: 152,
        }),
    };

    println!("Encoded via SCALE: {:?}", country.encode());
    // => [8, 8, 82, 111, 8, 82, 97, 20, 0, 0, 0, 0, 12, 79, 116, 121,
    //     16, 80, 111, 108, 97, 30, 0, 0, 0, 1, 2, 152, 0, 0, 0]
}
```

Defining namespace with `@scale-codec/namespace` (this step can be automated, so some dirt is permissible here):

```ts
import {
    EnumInstance,
    EnumSchema,
    PrimitiveTypes,
    defNamespaceWithPrimitives,
    defStruct,
    defVec,
    defEnum,
} from '@scale-codec/namespace';

type EnumInstanceVariants<I extends EnumInstance<any>> = I extends EnumInstance<infer V> ? V : never;

/**
 * Namespace definition, where key - type name, value - decoded type value
 *
 * This can be auto-generated
 */
interface MyNamespace {
    Person: {
        firstName: PrimitiveTypes['String'];
        lastName: PrimitiveTypes['String'];
        age: PrimitiveTypes['u32'];
        gender: MyNamespace['Gender'];
    };
    Gender: EnumInstance<{
        Male: null;
        Female: null;
    }>;
    'Vec<Person>': MyNamespace['Person'][];
    Country: {
        persons: MyNamespace['Vec<Person>'];
        government: MyNamespace['GovernmentType'];
    };
    GovernmentType: EnumInstance<{
        Anarchy: null;
        Dictatorship: MyNamespace['DictatorInfo'];
        Senate: MyNamespace['SenateInfo'];
    }>;
    DictatorInfo: {
        person: MyNamespace['Person'];
        assasinationAttempts: PrimitiveTypes['u32'];
    };
    SenateInfo: {
        senatorsCount: PrimitiveTypes['u32'];
    };
}

/**
 * Definition of actual dynamic namespace with codecs
 *
 * This also can be auto-generated
 */
const namespace = defNamespaceWithPrimitives<MyNamespace>({
    Person: defStruct([
        ['firstName', 'String'],
        ['lastName', 'String'],
        ['age', 'u32'],
        ['gender', 'Gender'],
    ]),
    Gender: defEnum(
        new EnumSchema<EnumInstanceVariants<MyNamespace['Gender']>>({
            Male: { discriminant: 0 },
            Female: { discriminant: 1 },
        }),
        {},
    ),
    'Vec<Person>': defVec('Person'),
    Country: defStruct([
        ['persons', 'Vec<Person>'],
        ['government', 'GovernmentType'],
    ]),
    GovernmentType: defEnum(
        new EnumSchema<EnumInstanceVariants<MyNamespace['GovernmentType']>>({
            Anarchy: { discriminant: 0 },
            Dictatorship: { discriminant: 1 },
            Senate: { discriminant: 2 },
        }),
        { Dictatorship: 'DictatorInfo', Senate: 'SenateInfo' },
    ),
    DictatorInfo: defStruct([
        ['person', 'Person'],
        ['assasinationAttempts', 'u32'],
    ]),
    SenateInfo: defStruct([['senatorsCount', 'u32']]),
});
```

Using namespace type-safely:

```ts
/* Deconding */

const SOME_ENCODED_COUNTRY = new Uint8Array([
    8, 8, 82, 111, 8, 82, 97, 20, 0, 0, 0, 0, 12, 79, 116, 121, 16, 80, 111, 108, 97, 30, 0, 0, 0, 1, 2, 152, 0, 0, 0,
]);
const country = namespace.decode('Country', SOME_ENCODED_COUNTRY);

// Let's print persons
country.persons.forEach(({ firstName, age, gender }) => {
    const genderFormatted: string = gender.match({
        Male: () => '♂',
        Female: () => '♀',
    });

    console.log(`${firstName}, ${age}yo, ${genderFormatted}`);
});

// Conditional enum-behavior
if (country.government.is('Senate')) {
    console.log('Senators count:', country.government.as('Senate').senatorsCount);
}

/* Encoding */

// Specifying type explicitly
const somePerson: MyNamespace['Person'] = {
    firstName: 'Mora',
    lastName: 'Preshy',
    age: JSBI.BigInt(15),
    gender: EnumInstance.create('Female'),
};
const somePersonEncoded = namespace.encode('Person', somePerson);

// With automatic type inference
namespace.encode('SenateInfo', {
    senatorsCount: JSBI.BigInt(112),
});
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
interface NS {
    // struct will be decoded directly to JS Object
    Animal: {
        name: PrimitiveTypes['String'];
        type: PrimitiveTypes['String'];
    };
    AnimalInHouse: {
        // here we reference to another namespace's entry
        // this style is convenient for automatic namespace generation
        animal: NS['Animal'];
        houseSize: PrimitiveTypes['u32'];
    };
}

const ns = defNamespaceWithPrimitives<NS>({
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

### Arrays (`Vec<T>` etc)

```ts
interface NS {
    // Decoded arrays will be JS native `Array`s
    'Vec<u64>': PrimitiveTypes['u64'][]; // or directly `JSBI[]`;

    // Array with some non-primitive type
    'Vec<Something>': NS['Something'][];

    Something: {
        foo: PrimitiveTypes['String'];
    };
}

const ns = defNamespaceWithPrimitives<NS>({
    'Vec<u64>': defVec(
        // reference to inner value codec
        'u64',
    ),
    'Vec<Something>': defVec('Something'),
    Something: defStruct(/* ... */),
});
```

### Tuples

Tuples are very similar with arrays. They have different typings and codec definitions.

```ts
interface NS {
    '(u32, bool)': [PrimitiveTypes['u32'], PrimitiveTypes['bool']];
    '(String, (u32, bool))': [PrimitiveTypes['String'], NS['(u32, bool)']];
}

const ns = defNamespaceWithPrimitives<NS>({
    '(u32, bool)': defTuple(['u32', 'bool']),
    '(String, (u32, bool))': defTuple(['String', '(u32, bool)']),
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
interface NS {
    // In namespace we specifying actual decoded types, and for any
    // enum it will be `EnumInstance<Variants>`
    // Keys - variant names
    // Values - inner variant value (or `null` for empty variants)
    MyEnum: EnumInstance<{
        EmptyVariant: null;
        VariantWithStr: PrimitiveTypes['String'];
        // Inner values for 'tuple enums' should be defined separately as tuples
        VariantWithTuple: NS['(u32, u32)'];
    }>;
    '(u32, u32)': [PrimitiveTypes['u32'], PrimitiveTypes['u32']];
}

const ns = defNamespaceWithPrimitives<NS>({
    '(u32, u32)': defTuple(['u32', 'u32']),
    MyEnum: defEnum(
        // schema contains data about variants and discriminants
        // of the values
        new EnumSchema<EnumInstanceVariants<NS['MyEnum']>>({
            EmptyVariant: { discriminant: 0 },
            VariantWithStr: { discriminant: 1 },
            VariantWithTuple: { discriminant: 2 },
        }),
        // as second argument we must provide references to codecs
        // for each non-empty variant
        {
            VariantWithStr: 'String',
            VariantWithTuple: '(u32, u32)',
        },
    ),
});
```

Creation:

```ts
// Use type inference
const val1: NS['MyEnum'] = EnumInstance.create('EmptyVariant');
const val2: NS['MyEnum'] = EnumInstance.create('VariantWithStr', 'Hey!');
const val3: NS['MyEnum'] = EnumInstance.create('VariantWithTuple', [JSBI.BigInt(412), JSBI.BigInt(1_000)]);
const val4: NS['MyEnum'] = EnumInstance.create('EmptyVariant', 'some unexpected value'); // error!
const val5: NS['MyEnum'] = EnumInstance.create('VariantWithStr'); // error! where is string?
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
function findSomeInteger(numbers: number[]): OptionInstance<JSBI> {
    for (const num of numbers) {
        if (num === ~~num) {
            return EnumInstance.create('Some', JSBI.BigInt(num));
        }
    }
    return EnumInstance.create('None');
}

function tryToMakeSomeStuff(): Result<[], string> {
    return Math.random() > 0.3 ? EnumInstance.create('Ok', []) : EnumInstance.create('Err', 'ooops ._.');
}

interface NS {
    'Option<u32>': OptionInstance<JSBI>;
    'Result<(), String>': ResultInstance<[], string>;
    '()': [];
}

const ns = defNamespaceWithPrimitives({
    'Option<u32>': defOptionEnum('u32'),
    'Result<(), String>': defResultEnum('()', 'String'),
    '()': defTuple([]),
});
```

> TODO: maybe provide classes / more convenient tools for `Result` and `Option`?

### Maps (`HashMap`, `BTreeMap` etc)

```ts
interface NS {
    // any Rust maps will be converted to native JS `Map`s
    'HashMap<String, u32>': Map<string, JSBI>;
}

const ns = defNamespaceWithPrimitives({
    'HashMap<String, u32>': defMap('String', 'u32'),
});
```
