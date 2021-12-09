# enum ![build status](https://img.shields.io/github/checks-status/soramitsu/scale-codec-js-library/master) ![version](https://img.shields.io/npm/v/@scale-codec/enum) ![license](https://img.shields.io/npm/l/@scale-codec/enum)

Lightweight tool for working with Rust-style enums in JavaScript (with TypeScript support).

Read the [docs](https://soramitsu.github.io/scale-codec-js-library/guide/enum)!

## Example

```ts
import { Enum, Valuable } from '@scale-codec/enum';

// 1. Define enum
type Event = Enum<{
    MouseClick: Valuable<{ x: number; y: number }>;
    PageLoaded: null;
    KeyPress: Valuable<string>;
}>;

// 2. Construct typed enum (100% typed)
const event1: Event = Enum.valuable('KeyPress', '<enter>');
const event2: Event = Enum.valuable('MouseClick', { x: 5, y: 10 });
const event3: Event = Enum.empty('PageLoaded');

// 3. Access enum's contents

// with `is` & `as`
if (event1.is('MouseClick')) {
    const { x, y } = event1.as('MouseClick');
}

// with match
event1.match({
    PageLoaded() {
        console.log('Loaded');
    },
    MouseClick({ x, y }) {
        console.log('Click at %o : %o', x, y);
    },
    KeyPress(key) {
        console.log('Key pressed:', key);
    },
});
```
