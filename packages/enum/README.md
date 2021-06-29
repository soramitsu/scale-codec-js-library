# enum

Lightweight tool for working with Rust-style enums in JavaScript (with TypeScript support).

### Defining enum

This package containing base `Enum` class, that is very simple. It is generic-typed class. For example, with this Rust enum:

```rust
enum Roko {
    Tupa,
    Yool(u32)
}
```

You can define it in JS like this:

```ts
type Roko = Enum<{
    // Empty variant accepts any types except of `{ value: any }` - it is reserved for valuable variants
    // for consistence you can use `undefined` or `null`
    Tupa: undefined;
    // Valuable variants should be defined specially with helper type or directly
    // like `{ value: T }`
    // Such definition style eliminates ambiguity for TypeScript between empty and non-empty variants
    Yool: ValuableVariant<number>; // equivalent to { value: number }
}>;

const foo: Roko = Enum.create('Tupa');
const bar: Roko = Enum.create('Yool', 885);
```

Note that it is strongly typed, so you can't make things like this:

```ts
const a: Roko = Enum.create('Yool'); // error, expects second argument for valuable variant
const b: Roko = Enum.create('Tupa', false); // error, unexpected second argument for empty variant
const c: Roko = Enum.create('Yool', '._.'); // error, number expected, not string
```

### Working with enum

```ts
interface VariantsDefinition {
    Pam: ValuableVariant<number>;
    Param: ValuableVariant<[number, boolean]>;
    Papam: ValuableVariant<{ value: string }>;
}

const items: Enum<VariantsDefinition>[] = [/* ... */];

for (const item of items) {
    // Check which variant it is
    if (item.is('Pam')) {
        console.log('it is pam!');

        // extract value of 'Pam'
        // this cast works fine withoug `is` check, but can throw error at runtime
        // it is assertive
        const num = item.as('Pam');
        console.log('Pam value: %i', num);
    }

    // you can use simplest "pattern matching"

    // without any return
    item.match({
        Pam(num) => console.log('Pam num', num),
        Param([num, flag]) => console.log('Param!', num, flag),
        Papam({ value }) => console.log('Papam...', value);
    })

    // or with return
    const containsNum: boolean = item.match({
        Pam: () => true,
        Param: () => true,
        Papam: () => false
    })
}
```

### Common enums - Option and Result

> Draft, will be deleted?

There are defined to most common Rust's enums - `Option<T>` for defining the presense or absense of some content, and `Result<Ok, Err>` for defining results of operations that can be failed. `Option` and `Result` are classes that extends base `Enum` and introduce some helpfull methods:

```ts
const maybeNumber: Option<number> = Option.Some(929);
const maybeBool: Option<boolean> = Option.None();
```

**TODO**: add more helper methods like in Rust.

**TODO**: more examples
