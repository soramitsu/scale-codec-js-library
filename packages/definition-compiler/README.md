# @scale-codec/definition-compiler

Compiler for SCALE-codec definitions

## A little bit about how it works

It accepts a definition in the format like this:

```ts
import fs from 'fs/promises';
import { renderNamespaceDefinition } from '@scale-codec/definition-compiler';

renderNamespaceDefinition(
    {
        Person: {
            t: 'struct',
            fields: [
                {
                    name: 'first_name',
                    ref: 'str',
                },
                {
                    name: 'age',
                    ref: 'u8',
                },
            ],
        },
        Map_Person_bool: {
            t: 'map',
            key: 'Person',
            value: 'bool',
        },
    },
    {
        importLib: '@scale-codec/definition-runtime',
    },
).then(async (code) => {
    // write TypeScript `code` into some file
    await fs.writeFile('generated.ts', code);
});
```

`generated.ts`:

```ts
/* eslint-disable */
import {
    DecodeResult,
    Encode,
    EncodeAsIs,
    bool_Decoded,
    bool_Encodable,
    bool_decode,
    bool_encode,
    decodeMap,
    decodeStruct,
    encodeMap,
    encodeStruct,
    makeEncoderAsIsRespectable,
    str_Decoded,
    str_Encodable,
    str_decode,
    str_encode,
    u8_Decoded,
    u8_Encodable,
    u8_decode,
    u8_encode,
} from '@scale-codec/definition-runtime';

// Map_Person_bool

export type Map_Person_bool_Decoded = Map<Person_Decoded, bool_Decoded>;

export type Map_Person_bool_Encodable = Map<Person_Encodable | EncodeAsIs, bool_Encodable | EncodeAsIs>;

const [Map_Person_bool_encode_key, Map_Person_bool_encode_value] = [Person_encode, bool_encode].map(
    makeEncoderAsIsRespectable,
) as [Encode<Person_Encodable | EncodeAsIs>, Encode<bool_Encodable | EncodeAsIs>];

export function Map_Person_bool_decode(bytes: Uint8Array): DecodeResult<Map_Person_bool_Decoded> {
    return decodeMap(bytes, Person_decode, bool_decode);
}

export function Map_Person_bool_encode(encodable: Map_Person_bool_Encodable): Uint8Array {
    return encodeMap(encodable, Map_Person_bool_encode_key, Map_Person_bool_encode_value);
}

// Person

export type Person_Decoded = {
    first_name: str_Decoded;
    age: u8_Decoded;
};

export type Person_Encodable = {
    first_name: str_Encodable | EncodeAsIs;
    age: u8_Encodable | EncodeAsIs;
};

const Person_order: (keyof Person_Decoded)[] = ['first_name', 'age'];
const Person_decoders = {
    first_name: str_decode,
    age: u8_decode,
};
const Person_encoders = {
    first_name: makeEncoderAsIsRespectable(str_encode),
    age: makeEncoderAsIsRespectable(u8_encode),
};

export function Person_decode(bytes: Uint8Array): DecodeResult<Person_Decoded> {
    return decodeStruct(bytes, Person_decoders, Person_order);
}

export function Person_encode(encodable: Person_Encodable): Uint8Array {
    return encodeStruct(encodable, Person_encoders, Person_order);
}
```

## Supported STDs

All type references in the definition should reference either to one of the STD types or to the type from the definition itself.

Available STDs:

-   `str`
-   `bool`
-   Integers (`i8`, `u8`, `i16`, `u16` ... `i128`, `u128`)
-   `Compact`
-   `Void` (Rust's `()`, in JS it will be just a `null`)
-   `BytesVec` (Rust's `Vec<u8>`, uses native JS's `Uint8Array` instead of `JSBI[]`)

All stds are exported from `@scale-codec/definition-runtime`

## TODO

-   Make a detailed description of definition schema. Note corner cases with empty structs and tuples.
-   Generate factories for each enum variant
-   Provide a possibility to write comments in definitions to insert them then into a rendered code?

## Also

See related `@scale-codec/definition-runtime` package with the runtime for generated code.
