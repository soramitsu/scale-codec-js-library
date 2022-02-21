# Definition

::: info
Design of this part of the library is still debatable. If you have any suggestions, [you are welcome](https://github.com/soramitsu/scale-codec-js-library/issues)!
:::

## Runtime

It is a wrapper around [Core](./core) library that provides:

-   `Codec`s, that are a combination of encode & decode and some sugar
-   Optional tracking functionality for debugging purposes.
-   [Predefined](#predefined-builders) non-parametrized codecs, such as `Str`, `Bool` etc

Available on NPM:

```bash
npm i @scale-codec/definition-runtime
```

## Compiler

The main usa case for SCALE is to use type schema from Rust in another language, in our case in JavaScript. Compiler receives such schema and generates TypeScript code that is compatible with Runtime package.

### Example: schema & compiled output

**Rust types definition:**

```rust
// struct
struct Person {
    name: String,
    age: u8,
    document: PersonDocument
}

// enum
enum PersonDocument {
    Id(u8),
    Passport(Passport)
}

// tuple of passport nums
struct Passport(u32, u32)

// Map
type PersonsMap = HashMap<u8, Person>

// Vec
type PersonsVec = Vec<Person>

struct PublicKey {
    // Fixed-len array
    payload: [u8; 32]
}
```

**Definition for Compiler:**

<<< @/snippets/namespace-schema.ts

**Compilation code:**

```ts
import { renderNamespaceDefinition } from '@scale-codec/definition-compiler'
import schema from './schema'

const code = renderNamespaceDefinition(schema)
console.log(code)
```

**Compiled output:**

<<< @/snippets/namespace-schema-compiled.ts

Now the code is usable, and its execution depends on you!

## Predefined Builders

<<< @/../../definition-compiler/src/const.ts

These builders **defined** at Runtime and Compiler **knows** about them. Anyway, you can customize both runtime lib and known types (see [rendering params at API section](/api/definition-compiler.rendernamespacedefinitionparams.html)).

```ts
import { Str } from '@scale-codec/definition-runtime'
```

## Debugging

TODO

`@scale-codec/definition-runtime` provides special Tracking API and one of its possible implementations - Logger. With it, you can enable logging of decode process and/or decode failures. Its usage may look like this:

```ts
import {
    Logger,
    createStructBuilder,
} from '@scale-codec/definition-runtime'

// some complex builder
const StructBuilder = createStructBuilder('Struct' /* ...args */)

// creating logger and mounting it as a current tracker
const logger = new Logger({
    logDecodeSuccesses: true,
})
logger.mount()

// Decode some bytes
const decodedAndUnwrapped = StructBuilder.fromBytes(
    new Uint8Array([
        /* ...bytes */
    ]),
).unwrap()

// Unmount logger if you don't need it more
logger.unmount()
```

Example of its output in Node.js console:

![Example of logger output in node](/img/logger-node-err.png)

And in browser dev tools:

![Example of logger output in Devtools](/img/logger-devtools-err.png)

You can use Tracking API to implement any logic you need. Example of usage:

```ts
import { setCurrentTracker } from '@scale-codec/definition-runtime'

setCurrentTracker({
    decode(loc, input, decodeFn) {
        console.log('Decode step: %o\nInput: %o', loc, input)
        return decodeFn(input)
    },
})
```

#### Possible questions

-   Is there any runtime overhead if I don't use tracking?

Yes, there is some, but it is reduced as possible.

-   Is `Logger` tree-shakable?

Yes, it is.

## Compiler's Playground

Todo?

## Also

-   [Runtime's API](../api/definition-runtime)
-   [Compiler's API](../api/definition-compiler)
-   [@polkadot/types](https://github.com/polkadot-js/api/tree/master/packages/types) - another implementation of SCALE codec with a different namespaces approach
-   [ts-scale-codec](https://www.npmjs.com/package/@josepot/ts-scale-codec)- another lightweight implementation of SCALE
-   [Protobuf.js](https://protobufjs.github.io/protobuf.js/index.html) - implementation not of SCALE, but of Protobuf spec. Their specs have a lot in common.
