---
'@scale-codec/enum': minor
---

**feature**: add typed `Variant.as()` method to cast a variant to a particular tag:

```ts
declare const value: Enumerate<{
  Foo: [string]
  Bar: [number]
  Baz: []
}>

if (value.tag === 'Foo') {
    const str: string = value.as('Foo')
    
    // type error
    const num: number = value.as('Bar') // => never
}

value.as('Baz') // => never
```
