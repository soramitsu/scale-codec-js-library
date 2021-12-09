---
'@scale-codec/definition-compiler': minor
'@scale-codec/definition-runtime': minor
---

**breaking**: drop `createAliasBuilder` & `dynBuilder`, introduce `dynGetters` for both cases.

There were 2 problems:

-   `DynBuilder` didn't support extended builders such as `ScaleEnumBuilder` with its own helpers to define variants.
-   `createAliasBuilder` didn't support the same thing and generally was like a stub for `DynBuilder`

Now, it is solved with `dynGetters` that creates a Proxy to any object and dispatches its props in the moment when they are being got. It supports simple extensions over `FragmentBuilder` like `ScaleEnumBuilder`'s are. And now any aliases are closer to be "just another name for the object", except the fact that it will be a proxy to an object. Compiler now respects this approach.
