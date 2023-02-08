---
'@scale-codec/definition-compiler': major
'@scale-codec/definition-runtime': major
---

**refactor**: use local opaque type pattern, remove `type-fest` dep (and `Opaque` re-export); workaround enum issues with `EnumBox` type; update generation, generate less code

#### Opaque types

Each generated codec type is **opaque** - it can be instantiated only through the codec factory or by explicit `as` conversion. It **was** implemented with `Opaque` type from `type-fest` library. Now it is implemented with the following technique:

```ts
declare const __opaqueTag: unique symbol

type LocalOpaque<Tag, T> = { [__opaqueTag]: Tag } & T

// ...some type
type VecU32 = LocalOpaque<'VecU32', number[]>
```

This approach allows to define types with same name in different generated modules and not to worry about their intersections.

**A consumer shouldn't update their code**, unless they used `Opaque` type on their own.

#### Enum issues and `EnumBox`

Previous enum generation approach had a set of drawbacks when it came to large namespaces and circular references. TypeScript computed wrong types for enum factories and frequently failed to resolve types in general because of circuits.

Now all enum codecs are based on `EnumBox<V>` type:

```ts
type EnumBox<V extends VariantAny> = {
  enum: V
}
```

With this approach, TypeScript is able to handle abovementioned problems, but it has a runtime drawback - **each enum is now wrapped** into `EnumBox`.

A consumer should add `.enum` property accessor in any place they work with enums:

```ts
import { OptionString } from './generated-definition'

declare const opt: OptionString

if (opt.enum.tag === 'Some') {
  console.log(opt.enum.content)
}
```
