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
import { Enum, Valuable } from '@scale-codec/enum';

type Roko = Enum<{
    // Empty variant accepts any types except of `{ value: any }` - it is reserved for valuable variants
    // for consistence you can use `undefined` or `null`
    Tupa: undefined;
    // Valuable variants should be defined specially with helper type or directly
    // like `{ value: T }`
    // Such definition style eliminates ambiguity for TypeScript between empty and non-empty variants
    Yool: Valuable<number>; // equivalent to { value: number }
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
    Pam: Valuable<number>;
    Param: Valuable<[number, boolean]>;
    Papam: Valuable<{ value: string }>;
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

They are exposed from package only as types for convenient inference. It can be used like this:

```ts
const opt1: Option<number> = Enum.create('None');
const opt2: Option<number> = Enum.create('Some', 5);

const res1: Result<null, Error> = Enum.create('Ok', null);
const res2: Result<null, Error> = Enum.create('Err', new Error('boom'));
```
