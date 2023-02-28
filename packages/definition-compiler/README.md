# @scale-codec/definition-compiler ![build status](https://img.shields.io/github/checks-status/soramitsu/scale-codec-js-library/master) ![version](https://img.shields.io/npm/v/@scale-codec/definition-compiler) ![license](https://img.shields.io/npm/l/@scale-codec/definition-compiler)

Code generation for SCALE namespaces.

## Installation

Available on NPM:

```shell
npm i @scale-codec/definition-compiler
```

## Features

- Support all codecs provided by `@scale-codec/core`
- Support type aliases
- Support circular references between types
- Support type imports from other places
- Each compiled type is opaque (except aliases)
- Defaults are configurable, including "std" types and the runtime library itself

## Example

Having the following namespace in Rust:

```rust
struct Person {
    name: String,
    age: u8,
    document: PersonDocument
}

enum PersonDocument {
    Id(u8),
    Passport(Passport)
}

struct Passport(u32, u32);

type PersonsMap = HashMap<u8, Person>;

type PersonsVec = Vec<Person>;

struct PublicKey {
    // Fixed-len array
    payload: [u8; 32]
}
```

You can define a schema for it and compile it into TypeScript module:

```ts
import { NamespaceDefinition, renderNamespaceDefinition } from '@scale-codec/definition-compiler'

const schema: NamespaceDefinition = {
  Person: {
    t: 'struct',
    fields: [
      {
        name: 'name',
        ref: 'Str',
      },
      {
        name: 'age',
        ref: 'U8',
      },
      {
        name: 'document',
        ref: 'PersonDocument',
      },
    ],
  },
  PersonDocument: {
    t: 'enum',
    variants: [
      {
        name: 'Id',
        discriminant: 0,
        ref: 'U8',
      },
      {
        name: 'Passport',
        discriminant: 1,
        ref: 'Passport',
      },
    ],
  },
  Passport: {
    t: 'tuple',
    items: ['U32', 'U32'],
  },
  PersonsMap: {
    t: 'map',
    key: 'U8',
    value: 'Person',
  },
  PersonsVec: {
    t: 'vec',
    item: 'Person',
  },
  PublicKey: {
    t: 'struct',
    fields: [
      {
        name: 'payload',
        ref: 'Array_u8_32',
      },
    ],
  },
  Array_u8_32: {
    t: 'array',
    item: 'U8',
    len: 32,
  },
}

const code = renderNamespaceDefinition(schema)
```

`code` could be written into a module and then used as:

```ts
import { Person, PersonDocument } from './compiled-module'

function printPersonName(person: Person) {
    console.log(person.name)
}

const person = Person({
  name: 'James',
  age: 52,
  document: PersonDocument('Id', 911),
})

const bytes: Uint8Array = Person.toBuffer(person)
```

**Note:** all compiled codecs are also _factories_ to define values. Values themselves are defined as _opaque_ types, i.e. they could be defined either through its factory (`Person({...})`), or through explicit type casting (`{...} as Person`).

## API

[Link](https://soramitsu.github.io/scale-codec-js-library/api/modules/scale_codec_definition_compiler)

