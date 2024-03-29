# @scale-codec/definition-compiler

## 4.0.1

### Patch Changes

- c3d70a8: **chore**: bump `immutable` and `ts-pattern`
- c3d70a8: **docs**: update README
- Updated dependencies [c3d70a8]
- Updated dependencies [c3d70a8]
  - @scale-codec/enum@2.1.1
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

### Patch Changes

- Updated dependencies [7da2814]
  - @scale-codec/enum@2.1.0

## 3.0.0

### Minor Changes

- 7e81bbc: **style**: generate each import/export on a new line
- 7e81bbc: **refactor**: update enum generation following the major update in enum design
- 7e81bbc: **refactor**: generate `unique symbol` for opaque types

### Patch Changes

- Updated dependencies [7e81bbc]
  - @scale-codec/enum@2.0.0

## 2.2.2

### Patch Changes

- 822202d: **fix**: specify `exports.*.types` field in `package.json` so TypeScript works fine in `nodenext` module resolution mode
- Updated dependencies [822202d]
  - @scale-codec/enum@1.1.1
  - @scale-codec/util@1.1.1

## 2.2.0

### Minor Changes

- e72d4de: Change build artifacts: `lib.cjs.js` → `lib.cjs`, `lib.esm.js` → `lib.mjs`

### Patch Changes

- Updated dependencies [e72d4de]
  - @scale-codec/enum@1.1.0
  - @scale-codec/util@1.1.0

## 2.1.0

### Minor Changes

- 22042cf: **feat**: **BREAKING** add refs graph validation, and if it has unresolved references, compiler will throw

### Patch Changes

- 42d05b4: **feat**: add `optimizeDyns` option to enable experimental optimization

## 2.0.0

### Major Changes

- 1f92e19: **BREAKING**

  - **What is the change**

    Now compiled type consists from 1 entry that is a type and a variable simultaneously. Variable actually is a codec and **a factory** to create values.

    You can see the new approach by looking at this example of compiled `VecU32` type.

    **Before**:

    ```ts
    import { U32, VecCodec, Codec, createVecCodec } from '@scale-codec/definition-runtime'

    export const VecU32: VecCodec<typeof U32> = createVecCodec('VecU32', U32)
    ```

    **After**:

    ```ts
    import { Opaque, U32, createVecCodec, Codec } from '@scale-codec/definition-runtime'

    interface VecU32 extends Opaque<number[], VecU32> {}

    const VecU32: Codec<VecU32> & ((actual: number[]) => VecU32) = createVecCodec('VecU32', U32)

    export { VecU32 }
    ```

    - You can use `VecU32` just as a type
    - You can use `VecU32` as codec, i.e. `VecU32.toBuffer(VecU32([1, 2, 3]))`
    - You can only pass data to `VecU32` codec only if you define it explicitly via factory (`VecU32([1, 2, 3])`) or with `as` keyword (`[1, 2, 3] as VecU32`). Thanks to `Opaque` type from `type-fest` library.

  - **Why the change was made**

    There was no way to securely construct values and pass it to codecs - the task to infer types was too heavy for TypeScript to solve on huge namespaces. And there was no clear way to extract actual types from codecs, and you had to use something like `CodecValueEncodable<typeof VecU32>`

    New approach is more easy and secure to use.

  - **How you should update your code**

    Compiler input schema is not changed, but you should update the usage of compiled output and the way how external modules are defined.

    **Usage of compiled output**:

    ```ts
    import { VecU32 } from './compiled'

    // Before
    const data1 = VecU32.toBuffer([1, 2, 3])

    // After
    const data2 = VecU32.toBuffer(VecU32([1, 2, 3]))
    const data3 = VecU32.toBuffer([1, 2, 3] as VecU32) // or
    ```

    **External module format**:

    ```ts
    // Before

    import { createBuilder, FragmentBuilder } from '@scale-codec/definition-runtime'

    export const CustomNum: FragmentBuilder<number> = createBuilder('CustomNum', someEncodeFun, someDecodeFun)

    // After

    import { trackableCodec } from '@scale-codec/definition-runtime'

    type CustomNum = string

    const CustomNum = trackableCodec<string>('CustomNum', someEncodeFun, someDecodeFun)

    export { CustomNum }
    ```

### Patch Changes

- Updated dependencies [1f92e19]
  - @scale-codec/enum@1.0.2

## 1.0.0

### Major Changes

- **BREAKING** - update compiler due to the slightly updated runtime package.

### Patch Changes

- Updated dependencies
  - @scale-codec/util@1.0.0

## 0.8.1

### Patch Changes

- 27b7927: Add build status badge to the README
- Updated dependencies [27b7927]
  - @scale-codec/util@0.1.3

## 0.8.0

### Minor Changes

- 31a546d: **breaking**: drop `createAliasBuilder` & `dynBuilder`, introduce `dynGetters` for both cases.

  There were 2 problems:

  - `DynBuilder` didn't support extended builders such as `ScaleEnumBuilder` with its own helpers to define variants.
  - `createAliasBuilder` didn't support the same thing and generally was like a stub for `DynBuilder`

  Now, it is solved with `dynGetters` that creates a Proxy to any object and dispatches its props in the moment when they are being got. It supports simple extensions over `FragmentBuilder` like `ScaleEnumBuilder`'s are. And now any aliases are closer to be "just another name for the object", except the fact that it will be a proxy to an object. Compiler now respects this approach.

## 0.4.0

### Minor Changes

- c78d861: **Breaking**:

  - Runtime: new approach with `Fragment`, `FragmentBuilder` and others
  - Compiler: drop vue & prettier + new approach for new runtime

- 3441cdb: **Breaking**: definition for "external" types now uses `import` tag instead of `external`

### Patch Changes

- 26c9dd0: Update readme and `homepage` at `package.json`
- 334a28d: Add keywords to package.json
- Updated dependencies [26c9dd0]
  - @scale-codec/util@0.1.2

## 0.3.0

### Minor Changes

- 1904251: Update type exports and documentation

### Patch Changes

- 07d0d6e: Hide `WithTMark` from public API; fix doc comment

## 0.2.0

### Minor Changes

- ac55aa8: feat: new optional feature - rollup single tuple into an alias of the inner type
- a1b1a98: feat: support definitions for external types
- 4a77d16: feat: now it is possible to define codec aliases

### Patch Changes

- cfec796: Update dependencies
