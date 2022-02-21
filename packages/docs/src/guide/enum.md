# Enums

::: tip
`@scale-codec/core` package re-exports everything from `@scale-codec/enum`:

```ts
import { Enum, Option /* and other */ } from '@scale-codec/core'
```

:::

## The Why

SCALE spec comes from Rust programming language that has [Enums](https://doc.rust-lang.org/book/ch06-01-defining-an-enum.html), so any implementation of this codec has to work with this concept. Obviously, JavaScript doesn't have any native syntax/semantics to handle it. TypeScript's enums don't suit here neither because of the difference between them and Rust's ones (primarily because they don't have values associated with variants like in Rust). Thus, this library exists and tries to solve the problem of enums definition, creation and handling.

## Package

Available on NPM:

```bash
npm i @scale-codec/enum
```

## Defininition and Creation

`Enum` class from this package of course is not the same as enums in Rust. It's just a simple strongly-typed generic class with enum tag and associated content if it exists. Associations validation is up to TypeScript.

Let's take a look at the sample enum from Rust:

```rust
enum Message {
    Quit,
    Log(String)
}

let msg = Message::Quit;
let msg = Message::Log("Rock".to_owned());
```

It contains one empty variant - `Quit`, and one valuable (non-empty) variant - `Log(String)`.

With `@scale-codec/enum` you can define the same enum in this way:

```ts
import { Enum } from '@scale-codec/enum'

type Message = Enum<'Quit' | ['Log', string]>

let msg: Message = Enum.variant('Quit')
msg = Enum.variant('Log', 'hello')
```

Enum variants are defined with `string | [tag: string, value: any]` signature, and enum instances could be created via `.variant()` factory.

## Working with created enums

-   `.is(tag)` - to check for enum's actual tag
-   `.as(tag)` - to extract enum value if its tag is appropriate, throw otherwise
-   `.match(matchMap)` - to use a poor analogy of pattern matching

```ts
import { Result, Option, Enum } from '@scale-codec/enum'

function makeSomeTask(): Result<number, string> {
    const randomNum = Math.random()

    if (randomNum > 0.5) {
        return Enum.variant('Ok', randomNum)
    }

    return Enum.variant('Err', 'Oops, bad luck :<')
}

const result = makeSomeTask()

if (result.is('Ok')) {
    const num = result.as('Ok')
    console.log('Task result num:', num)
} else {
    const errorMessage = result.as('Err')
    console.error('Task resulted with an error:', errorMessage)
}

const mapped: Option<number> = result.match({
    Ok(num) {
        return Enum.valuable('Some', num)
    },
    Err() {
        return Enum.empty('None')
    },
})
```

::: tip
You can use `match` method just for side-effects without returning anything from it.
:::

---

Well, now its time to overview the core library, which enum codecs are implemented with this package.
