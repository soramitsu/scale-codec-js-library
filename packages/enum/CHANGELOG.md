# @scale-codec/enum

## 2.0.0

### Major Changes

- 7e81bbc: **refactor**: introduce a complete new design of tagged unions

  #### What is the change

  Enums are declared with `Enumerate<T>` type.

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
  import { Enumerate } from '@scale-codec/enum'

  type Message = Enumerate<{
    Ping: []
    Text: [string]
    Coords: [[number, number]]
    User: [{ name: string }]
  }>
  ```
  
  Once enum type is declared, it could be used to create its **variants**.

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

  let msg: Message = variant('Ping')
  msg = variant('Text', 'foo')
  msg = variant('Coords', [4, 2])
  msg = variant('User', { name: 'bar' })
  ```

  **Variant instance** has `tag` and `content` fields to work with:

  ```ts
  declare const msg: MessageVariant

  if (msg.tag === 'Text') {
    console.log(msg.content.trim())
  }
  ```
  
  There are other changes as well, but that's all for major ones.


  #### Why the change was made

  The goal is to be consistent with [TypeScript support of discriminated unions](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes-func.html#discriminated-unions). The consequence is that TypeScript now able to narrow types and to check for exhaustiveness in code that works with enums. In other words, **new enums are type-stronger**.

  #### How a consumer should update their code

  - Re-write enum declarations:

    ```ts
    // before
    type MyEnum = Enum<'None' | ['Some', string]>

    // after
    type MyEnum = Enum<{ None: []; Some: [string] }>
    ```

  - Create variants with `variant` helper:

    ```ts
    // before
    const value1: MyEnum = Enum.variant('Some', 'foo')

    // after
    const value2 = variant<MyEnum>('Some', 'foo')
    const value3: MyEnum = variant('Some', 'foo')
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

## 1.1.1

### Patch Changes

- 822202d: **fix**: specify `exports.*.types` field in `package.json` so TypeScript works fine in `nodenext` module resolution mode

## 1.1.0

### Minor Changes

- e72d4de: Change build artifacts: `lib.cjs.js` → `lib.cjs`, `lib.esm.js` → `lib.mjs`

## 1.0.2

### Patch Changes

- 1f92e19: **types**: extend `Enum.variant()` typing

## 1.0.1

### Patch Changes

- eeeb481: **fix**: fix typing for `.as()` return value

## 1.0.0

### Major Changes

- **feat**: **BREAKING** `Enum` now uses new definitions approach.

  For example, instead of:

  ```ts
  type OptNum = Enum<{
    None: null
    Some: { value: number }
  }>
  ```

  it should be:

  ```ts
  type OptNum = Enum<'None' | ['Some', number]>
  ```

  This definition way is much easier for TypeScript to handle, and it allows to avoid some constraints and auto-inference problems

- **feat**: **BREAKING** `empty()` and `valuable()` static methods are replaced with a single `variant()` creation factory. It is type-safe and easy to use thanks to the new definitions approach.

  For example, instead of:

  ```ts
  type OptNum = Option<number>

  const opt1: OptNum = Enum.empty('None')
  const opt2: OptNum = Enum.valuable('Some', 42)
  ```

  it should be:

  ```ts
  const opt3: OptNum = Enum.variant('None')
  const opt4: OptNum = Enum.variant('Some', 42)
  ```

## 0.2.2

### Patch Changes

- b4c91cf: **feat**: better error messages when use `.as(tag)`

## 0.2.1

### Patch Changes

- 27b7927: Add build status badge to the README

## 0.2.0

### Minor Changes

- c78d861: **Breaking changes**:

  - drop `create()` static method, add `valuable()` and `empty()` instead
  - update internal fields which are used by other packages

### Patch Changes

- 26c9dd0: Update readme and `homepage` at `package.json`
- 334a28d: Add keywords to package.json

## 0.1.1

### Patch Changes

- b79934e: Add more inline documentation
