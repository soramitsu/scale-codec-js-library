---
'@scale-codec/enum': major
---

Introduce complete new design of how to handle tagged unions in TypeScript.

### What is the change

Enums now have two sides: declaration of the whole enum, and an instance of one of its variants.

Enum **declaration** is a record of variants, where each key is a variant tag and each value is an empty type or the type of content:

**Enum in Rust:**

```rust
enum Message {
  Ping,
  Text(String),
  Coords(u32, u32),
  User { name: String }
}
```

**Enum in TypeScript with `@scale-codec/enum`:**

```ts
import { Enum } from '@scale-codec/enum'

// `Enum<...>` is just a type helper and could be omitted to just `...`
type Message = Enum<{
  Ping: []
  Text: [string]
  Coords: [[number, number]]
  User: [{ name: string }]
}>
```

`[]` (empty tuple) type means no content; `[T]` (single-element tuple) means that the variant has content of type `T`.

Enum **variant** is a combination of a particular tag and content made from enum declaration.

**Creating variants in Rust:**

```rust
let mut msg = Message::Ping;
msg = Message::Text("foo".to_owned());
msg = Message::Coords(4, 2);
msg = Message::User { name: "bar".to_owned() };
```

**Creating variants in TypeScript with `@scale-codec/enum`:**

```ts
import { variant } from '@scale-codec/enum'

let msg = variant<Message>('Ping')
msg = variant('Text', 'foo')
msg = variant('Coords', [4, 2])
msg = variant('User', { name: 'bar' })
```

All possible enum variants could be extracted with `VariantOf<E>` type:

```ts
type MessageVariant = VariantOf<Message>
```

And finally, the variant instance has `tag` and `content` fields to work with:

```ts
declare const msg: MessageVariant

if (msg.tag === 'Text') {
    console.log(msg.content.trim())
}
```

Read more in the package README.

### Why the change was made

The goal is to be consistent with [TypeScript support of discriminated unions](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes-func.html#discriminated-unions). The consequence is that TypeScript now able to narrow types and to check for exhaustiveness in code that works with enums. In other words, **new enums are type-stronger**.

### How a consumer should update their code

- Re-write enum declarations:

  ```ts
  // before
  type MyEnum = Enum<'None' | ['Some', string]>

  // after
  type MyEnum = Enum<{ None: []; Some: [string] }>
  ```

- Work with enum variant type through `VariantOf<E>` helper:

  ```ts
  // before
  declare function fn1(value: MyEnum): void

  // after
  declare function fn1(value: VariantOf<MyEnum>): void
  ```

- Create variants with `variant` helper:

  ```ts
  // before
  const value1: MyEnum = Enum.variant('Some', 'foo')

  // after
  const value2 = variant<MyEnum>('Some', 'foo')
  const value3: VariantOf<MyEnum> = variant('Some', 'foo')
  ```

- Replace `Option` and `Result` imports with `RustOption` and `RustResult`.

- Remove `.match()` usage. If you need real pattern-matching in TypeScript, consider using `ts-pattern` library:

    ```ts
    import { match } from 'ts-pattern'
    import { VariantOf, RustOption } from '@scale-codec/enum'
    
    declare const value: VariantOf<RustOption<string>>
    
    const show = match(value)
      .with({ tag: 'None' }, () => 'Nothing')
      .with({ tag: 'Some', content: 'foo' }, () => 'Foo!')
      .with({ tag: 'Some' }, ({ content }) => `Some(${content})`)
      .exhaustive()
    ```
