# Enums

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

Variants are defined with `string | [tag: string, value: any]` signature

Enum value could be **created** with `.variant()` factory:

```ts
let msg: Message = Enum.variant('Quit')
msg = Enum.variant('Log', 'hello')
```

## Working with created enums

- `.is(tag)` - to check for enum's actual tag, and `.as(tag)` - to extract enum value if its tag is appropriate, throw otherwise

  ```ts
  const result: Result<number, string> = /* --snip-- */ ___

  if (result.is('Ok')) {
    const num = result.as('Ok')
    console.log('Task result num:', num)
  } else {
    const errorMessage = result.as('Err')
    console.error('Task resulted with an error:', errorMessage)
  }
  ```

- `.match(matchMap)` - to use a poor analogy of pattern matching

  ```ts
  const result: Result<number, string> = /* --snip-- */ ___

  const mapped: Option<number> = result.match({
    Ok(num) {
      return Enum.variant('Some', num)
    },
    Err() {
      return Enum.variant('None')
    },
  })
  ```

  ::: tip
  You can use `match` method just for side-effects without returning anything from it.
  :::

## Conclusion

Enums are just a part of SCALE. Let's dive into the core library.
