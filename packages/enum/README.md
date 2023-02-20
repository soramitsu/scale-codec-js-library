# `@scale-codec/enum` ![build status](https://img.shields.io/github/checks-status/soramitsu/scale-codec-js-library/master) ![version](https://img.shields.io/npm/v/@scale-codec/enum) ![license](https://img.shields.io/npm/l/@scale-codec/enum)

Small tagged-union library for TypeScript.

## Features

- **Type narrowing** and **exhaustiveness check** (due to the library following TypeScript's [discriminated union pattern](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes-func.html#discriminated-unions))
- Type-safe variants creation
- Type inference on variants creation

## Installation

Available on NPM:

```shell
npm i @scale-codec/enum
```

## Example

**Enum in Rust:**

```rust
enum Event {
  PageLoaded,
  KeyPress(String),
  MouseClick { x: u32, y: u32 }
}
```

**Enum in TypeScript:**

```ts
import { Enumerate, variant } from '@scale-codec/enum'

// Define the enum
type Event = Enumerate<{
  PageLoaded: []
  KeyPress: [string]
  MouseClick: [{ x: number; y: number }]
}>

// Construct an actual value
const event1: Event = variant('KeyPress', '<enter>')
const event2 = variant<Event>('MouseClick', { x: 5, y: 10 })
const event3 = variant<Event>('PageLoaded')

// Access the content
if (event1.tag === 'MouseClick') {
  // Types are narrowed
  const { x, y } = event1.content
}
```

## API

[Link](https://soramitsu.github.io/scale-codec-js-library/api/modules/scale_codec_enum)
