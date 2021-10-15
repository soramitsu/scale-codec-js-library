# `@scale-codec/definition-compiler`

::: warning
The compiler design is still Work-In-Progress, as well as its implementation. Current goals are:

-   100% typed output
-   Good TypeScript performance
-   Tree-shake-ability of compiled code
-   Explicitness due to verbosity

If you have some insigts/ideas how to make it better, you are welcome to create [an issue on GitHub](https://github.com/soramitsu/scale-codec-js-library/issues)!

:::

::: info
This package goes arm-in-arm with `@scale-codec/definition-runtime` library.
:::

SCALE might (and should!) be used within huge types namespaces with structs, enums, tuples etc that reference to each other. This tool helps to define a namespace schema and compile it into a TypeScript code which represents ESModule.

**It works only in Node.js yet :&lt;.**

## Example: schema & compiled output

```ts
import { NamespaceDefinition } from '@scale-codec/definition-compiler';

const schema: NamespaceDefinition = {};

export default schema;
```

## Install

```shell
# compiler as dev dependency
npm i --save-dev @scale-codec/definition-compiler

# runtime as plain dependency if you want to run the compiled output
npm i @scale-codec/definition-runtime
```

::: tip
It is not necessary to install runtime library in the same package where you install compiler - it is only necessary for the final runtime, where you are going to finally run the compiled code. It's even possible to define any other runtime and its module name in params of the compiler's render function.
:::

## Playground

WIP. It doesn't work in Web yet because of implementation details.

## See also

-   [API](../api/definition-compiler)
-   [Polkadot.js / types](https://github.com/polkadot-js/api/tree/master/packages/types) - another implementation of SCALE codec
-   [Protobuf.js](https://protobufjs.github.io/protobuf.js/index.html) - implementation not of SCALE, but of Protobuf spec. Their specs have a lot in common.
