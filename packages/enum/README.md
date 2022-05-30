# enum ![build status](https://img.shields.io/github/checks-status/soramitsu/scale-codec-js-library/master) ![version](https://img.shields.io/npm/v/@scale-codec/enum) ![license](https://img.shields.io/npm/l/@scale-codec/enum)

Lightweight tool for working with Rust enums in JavaScript (with TypeScript support).

[Documentation](https://soramitsu.github.io/scale-codec-js-library/guide/enum)

## Example

```ts
import { Enum } from '@scale-codec/enum'

// Define enum
type Event = Enum<
  | 'PageLoaded'
  | ['KeyPress', string]
  | [
      'MouseClick',
      {
        x: number
        y: number
      },
    ]
>

// Construct actual value (100% typed)
const event1: Event = Enum.variant('KeyPress', '<enter>')
const event2: Event = Enum.variant('MouseClick', { x: 5, y: 10 })
const event3: Event = Enum.variant('PageLoaded')

// Access to the content

// with `is` & `as`
if (event1.is('MouseClick')) {
  const { x, y } = event1.as('MouseClick')
}

// with match
event1.match({
  PageLoaded() {
    console.log('Loaded')
  },
  MouseClick({ x, y }) {
    console.log('Click at %o : %o', x, y)
  },
  KeyPress(key) {
    console.log('Key pressed:', key)
  },
})
```
