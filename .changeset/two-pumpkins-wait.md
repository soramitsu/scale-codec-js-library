---
'@scale-codec/definition-compiler': major
'@scale-codec/definition-runtime': major
---

**refactor**: use the local opaque type pattern, remove `type-fest` dependency (and `Opaque` re-export accordingly); work around enum issues with `EnumBox` type; update generation to produce less code

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
