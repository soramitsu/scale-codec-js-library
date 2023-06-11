# @scale-codec/definition-runtime

## 4.0.1

### Patch Changes

- c3d70a8: **docs**: update README
- Updated dependencies [c3d70a8]
- Updated dependencies [c3d70a8]
  - @scale-codec/core@2.0.1
  - @scale-codec/util@1.1.2

## 4.0.0

### Major Changes

- 8235d0a: **refactor!**: rename `Void` codec and type to `Unit`
- 6cdaed7: **refactor**: use the local opaque type pattern, remove `type-fest` dependency (and `Opaque` re-export accordingly); work around enum issues with `EnumBox` type; update generation to produce less code

  #### Opaque types

  Each generated codec type is **opaque**, which means it can be instantiated only through the codec factory or by an explicit `as` conversion. It used to be implemented via `Opaque` type from `type-fest` library. Now it is implemented in the following way:

  ```ts
  declare const __opaqueTag: unique symbol

  type LocalOpaque<Tag, T> = { [__opaqueTag]: Tag } & T

  // ...some type
  type VecU32 = LocalOpaque<'VecU32', number[]>
  ```

  With this approach it is possible to define types with the same name in different generated modules without worrying about naming conflicts.

  **No code updates are required unless `Opaque` type was used.**

  #### Enum issues and `EnumBox`

  The previous enum generation approach had a set of drawbacks when it came to large namespaces and circular references. TypeScript computed wrong types for enum factories and frequently failed to resolve types in general because of circuits.

  Now all enum codecs are based on `EnumBox<V>` type:

  ```ts
  type EnumBox<V extends VariantAny> = {
    enum: V
  }
  ```

  With this approach, TypeScript is able to handle abovementioned problems. However, it has a runtime drawback: each enum is now wrapped into `EnumBox`.

  You should add `.enum` property accessor in any place you work with enums:

  ```ts
  import { OptionString } from './generated-definition'

  declare const opt: OptionString

  if (opt.enum.tag === 'Some') {
    console.log(opt.enum.content)
  }
  ```

## 3.0.0

### Major Changes

- 7e81bbc: **refactor**: update due to the major update of the core library and enum design. Update `createEnumCodec` function signature and `EnumCodecAndFactory` type.
- 7e81bbc: **refactor**: remove `Opaque` usage from codec factories but still provide a type argument to specify an opaque type returned by the factory

### Minor Changes

- d7bff80: **chore**: update `type-fest` to v3

### Patch Changes

- Updated dependencies [7e81bbc]
- Updated dependencies [7e81bbc]
  - @scale-codec/core@2.0.0

## 2.2.2

### Patch Changes

- 822202d: **fix**: specify `exports.*.types` field in `package.json` so TypeScript works fine in `nodenext` module resolution mode
- Updated dependencies [822202d]
  - @scale-codec/core@1.1.1
  - @scale-codec/util@1.1.1

## 2.2.1

### Patch Changes

- 3554f7d: Update `fmt-subs` version to ESM-compatible

## 2.2.0

### Minor Changes

- e72d4de: Change build artifacts: `lib.cjs.js` → `lib.cjs`, `lib.esm.js` → `lib.mjs`

### Patch Changes

- Updated dependencies [e72d4de]
  - @scale-codec/core@1.1.0
  - @scale-codec/util@1.1.0

## 2.0.0

### Major Changes

- 1f92e19: **BREAKING**: updated runtime for updated compiler. See related compiler's changelog

### Patch Changes

- Updated dependencies [1f92e19]
  - @scale-codec/core@1.0.1

## 1.0.0

### Major Changes

- **BREAKING**

  - **What is the change**

    - `Fragment`s are dropped - they produced a lot of performance overhead
    - Simple codecs built on top of the new performant `core` library

  - **Why the change was made**

    Due to performance reasons.

### Patch Changes

- Updated dependencies
- Updated dependencies
  - @scale-codec/core@1.0.0
  - @scale-codec/util@1.0.0

## 0.8.2

### Patch Changes

- 54c0866: docs: clean README

## 0.8.1

### Patch Changes

- 27b7927: Add build status badge to the README
- Updated dependencies [27b7927]
  - @scale-codec/core@0.4.1
  - @scale-codec/util@0.1.3

## 0.8.0

### Minor Changes

- 31a546d: **breaking**: drop `createAliasBuilder` & `dynBuilder`, introduce `dynGetters` for both cases.

  There were 2 problems:

  - `DynBuilder` didn't support extended builders such as `ScaleEnumBuilder` with its own helpers to define variants.
  - `createAliasBuilder` didn't support the same thing and generally was like a stub for `DynBuilder`

  Now, it is solved with `dynGetters` that creates a Proxy to any object and dispatches its props in the moment when they are being got. It supports simple extensions over `FragmentBuilder` like `ScaleEnumBuilder`'s are. And now any aliases are closer to be "just another name for the object", except the fact that it will be a proxy to an object. Compiler now respects this approach.

## 0.7.0

### Minor Changes

- **feat**: add `defineUnwrap` helper to the generic `FragmentBuilder`
- **feat**: add `variants` and `variantsUnwrapped` helpers to the Enum builders

## 0.6.0

### Minor Changes

- **feat**: Tracking API

## 0.5.0

### Minor Changes

- 8890415: **breaking**: update int codecs due to breaking changes in core package

### Patch Changes

- Updated dependencies [56a9d2c]
- Updated dependencies [8890415]
  - @scale-codec/core@0.4.0

## 0.4.0

### Minor Changes

- c78d861: **Breaking**:

  - Runtime: new approach with `Fragment`, `FragmentBuilder` and others
  - Compiler: drop vue & prettier + new approach for new runtime

### Patch Changes

- 26c9dd0: Update readme and `homepage` at `package.json`
- 334a28d: Add keywords to package.json
- Updated dependencies [26c9dd0]
- Updated dependencies [97dfb7d]
- Updated dependencies [6d26250]
- Updated dependencies [97dfb7d]
- Updated dependencies [ab6d899]
- Updated dependencies [334a28d]
- Updated dependencies [c78d861]
  - @scale-codec/core@0.3.0
  - @scale-codec/util@0.1.2

## 0.1.3

### Patch Changes

- b427748: Add general package documentation
- Updated dependencies [86cf787]
- Updated dependencies [e1598bb]
- Updated dependencies [a3d7d34]
  - @scale-codec/core@0.2.3

## 0.1.2

### Patch Changes

- cfec796: Update dependencies
- Updated dependencies [cfec796]
  - @scale-codec/core@0.2.2
