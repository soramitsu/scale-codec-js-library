---
sidebarDepth: 3
---

# `@scale-codec/enum`

Lightweight tool for working with Rust-style enums in JavaScript (with TypeScript support of course).

## Contents

[[toc]]

## The Why

SCALE spec comes from Rust programming language that has [Enums](https://doc.rust-lang.org/book/ch06-01-defining-an-enum.html), so any implementation of this codec has to work with this concept. Obviously, JavaScript doesn't have any native syntax/semantics to handle it. TypeScript's enums don't suit here neither because of the difference between them and Rust's ones (primarily because they don't have values associated with variants like in Rust). Thus, this library exists and tries to solve the problem of enums definition, creation and runtime-handling.

## Install

The package is available via NPM Registry, so just use your favorite package manager:

```shell
npm i @scale-codec/enum
```

::: tip
`@scale-codec/core` package reexports everything from `@scale-codec/enum`:

```ts
import { Enum, Option /* and other */ } from '@scale-codec/core';
```

:::

## Enums defininition and creation

`Enum` in this package works a lot differently from how it does in Rust. It's just a simple strongly-typed generic class with some variant name and its contents if it exists. Let's take a look at the sample Rust's enum:

```rust
enum Message {
    Quit,
    Log(String)
}

let msg = Message::Quit;
let msg = Message::Log("Rock".to_owned());
```

It contains one empty variant - `Quit`, and one valuable (non-empty) variant - `Log(String)`.

JavaScript analog definition:

```ts
import { Enum, Valuable } from '@scale-codec/enum';

type Message = Enum<{
    Quit: null;
    Log: Valuable<string>;
}>;

let msg: Message = Enum.create('Quit');
msg = Enum.create('Log', 'hello');
```

Without type inference:

```ts
Enum.create<
    {
        Quit: null;
        Log: Valuable<string>;
    },
    'Quit'
>('Quit');

// or
type MessageVariants = {
    Quit: null;
    Log: Valuable<string>;
};
Enum.create<MessageVariants, 'Log'>('Log', 'hello');
```

::: info
`Valuable` type is a helper to distinguish empty variant from non-empty. In expanded form it is:

```ts
// they are equivalent

type MessageVariants = {
    Quit: null;
    Log: Valuable<string>;
};

type MessageVariants = {
    Quit: null;
    Log: { value: string };
};
```

So, for **valuable** variants you should specify `Valuable<T>` or `{ value: T }`, and for **empty** variants any other type (prefer `null` or `undefined` for better readability).

:::

## Working with created enums

There are several usefull methods to work with `Enum` instances:

```ts
import { Result, Option, Enum } from '@scale-codec/enum';

function makeSomeTask(): Result<number, string> {
    const randomNum = Math.random();

    if (randomNum > 0.5) {
        return Enum.create('Ok', randomNum);
    }
    return Enum.create('Err', 'Oops, bad luck :<');
}

const result = makeSomeTask();

// Check for variant
if (result.is('Ok')) {
    // Extract the content
    const num = result.as('Ok');
    console.log('Task result num:', num);
} else {
    const errorMessage = result.as('Err');
    console.error('Task resulted with an error:', errorMessage);
}

// Use 'match' syntax
const mapped: Option<number> = result.match({
    Ok(num) {
        return Enum.create('Some', num);
    },
    Err() {
        return Enum.create('None');
    },
});
```

::: tip
You can use `match` method just for side-effects without returning anything from it.
:::

## See also

-   [API](../api/enum)
