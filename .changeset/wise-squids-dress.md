---
'@scale-codec/definition-compiler': major
---

**BREAKING**

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

    import { createBuilder, FragmentBuilder } from '@scale-codec/definition-runtime';

    export const CustomNum: FragmentBuilder<number> = createBuilder('CustomNum', someEncodeFun, someDecodeFun);

    // After

    import { trackableCodec } from '@scale-codec/definition-runtime';

    type CustomNum = string;

    const CustomNum = trackableCodec<string>('CustomNum', someEncodeFun, someDecodeFun);

    export { CustomNum };
    ```

    
