import { renderNamespaceDefinition } from '..'
import { NamespaceDefinition, RenderNamespaceDefinitionParams } from '../../types'

function renderFactory(def: NamespaceDefinition, params?: RenderNamespaceDefinitionParams): string {
    return renderNamespaceDefinition(def, params)
}

it('Renders vec', () => {
    expect(
        renderFactory({
            Vec_str: {
                t: 'vec',
                item: 'Str',
            },
        }),
    ).toMatchInlineSnapshot(`
        "import { Str, createVecCodec } from '@scale-codec/definition-runtime'

        import type { ArrayCodecAndFactory, Opaque } from '@scale-codec/definition-runtime'

        // Type: Vec_str

        type Vec_str__actual = Str[]

        interface Vec_str extends Opaque<Vec_str__actual, Vec_str> {}

        const Vec_str: ArrayCodecAndFactory<Vec_str__actual, Vec_str> = createVecCodec<Vec_str__actual, Vec_str>('Vec_str', Str)

        // Exports

        export { Vec_str }"
    `)
})

it('Renders struct + tuple', () => {
    expect(
        renderFactory({
            Structural: {
                t: 'struct',
                fields: [
                    {
                        name: 'nums',
                        ref: 'Tuple_u8_i128',
                    },

                    {
                        name: 'mur',
                        ref: 'Bool',
                    },
                ],
            },

            Tuple_u8_i128: {
                t: 'tuple',
                items: ['U8', 'I128'],
            },
        }),
    ).toMatchInlineSnapshot(`
        "import { Bool, I128, U8, createStructCodec, createTupleCodec, dynCodec } from '@scale-codec/definition-runtime'

        import type { ArrayCodecAndFactory, Opaque, StructCodecAndFactory } from '@scale-codec/definition-runtime'

        // Dynamic codecs

        const __dyn_Tuple_u8_i128 = dynCodec(() => Tuple_u8_i128)

        // Type: Structural

        interface Structural__actual {
            nums: Tuple_u8_i128
            mur: Bool
        }

        interface Structural extends Opaque<Structural__actual, Structural> {}

        const Structural: StructCodecAndFactory<Structural__actual, Structural> = createStructCodec<Structural__actual, Structural>('Structural', [
            ['nums', __dyn_Tuple_u8_i128],
            ['mur', Bool]
        ])

        // Type: Tuple_u8_i128

        type Tuple_u8_i128__actual = [U8, I128]

        interface Tuple_u8_i128 extends Opaque<Tuple_u8_i128__actual, Tuple_u8_i128> {}

        const Tuple_u8_i128: ArrayCodecAndFactory<Tuple_u8_i128__actual, Tuple_u8_i128> = createTupleCodec<Tuple_u8_i128__actual, Tuple_u8_i128>('Tuple_u8_i128', [U8, I128])

        // Exports

        export { Structural, Tuple_u8_i128 }"
    `)
})

it('Renders enum', () => {
    expect(
        renderFactory({
            Message: {
                t: 'enum',
                variants: [
                    {
                        name: 'Quit',
                        discriminant: 0,
                    },

                    {
                        name: 'Greeting',
                        discriminant: 1,
                        ref: 'Str',
                    },
                ],
            },
        }),
    ).toMatchInlineSnapshot(`
        "import { Enum, Str, createEnumCodec } from '@scale-codec/definition-runtime'

        import type { EnumCodecAndFactory, Opaque } from '@scale-codec/definition-runtime'

        // Type: Message

        type Message__actual = Enum<
            | 'Quit'
            | ['Greeting', Str]
        >

        interface Message extends Opaque<Message__actual, Message> {}

        const Message: EnumCodecAndFactory<Message> = createEnumCodec<Message__actual, Message>('Message', [
            [0, 'Quit'],
            [1, 'Greeting', Str]
        ])

        // Exports

        export { Message }"
    `)
})

it('Renders set', () => {
    expect(
        renderFactory({
            Set_Message: {
                t: 'set',
                entry: 'Message',
            },
        }),
    ).toMatchInlineSnapshot(`
        "import { createSetCodec, dynCodec } from '@scale-codec/definition-runtime'

        import type { Opaque, SetCodecAndFactory } from '@scale-codec/definition-runtime'

        // Dynamic codecs

        const __dyn_Message = dynCodec(() => Message)

        // Type: Set_Message

        type Set_Message__actual = Set<Message>

        interface Set_Message extends Opaque<Set_Message__actual, Set_Message> {}

        const Set_Message: SetCodecAndFactory<Set_Message__actual, Set_Message> = createSetCodec<Set_Message__actual, Set_Message>('Set_Message', __dyn_Message)

        // Exports

        export { Set_Message }"
    `)
})

it('Renders map', () => {
    expect(
        renderFactory({
            Map_str_Message: {
                t: 'map',
                key: 'Str',
                value: 'Message',
            },
        }),
    ).toMatchInlineSnapshot(`
        "import { Str, createMapCodec, dynCodec } from '@scale-codec/definition-runtime'

        import type { MapCodecAndFactory, Opaque } from '@scale-codec/definition-runtime'

        // Dynamic codecs

        const __dyn_Message = dynCodec(() => Message)

        // Type: Map_str_Message

        type Map_str_Message__actual = Map<Str, Message>

        interface Map_str_Message extends Opaque<Map_str_Message__actual, Map_str_Message> {}

        const Map_str_Message: MapCodecAndFactory<Map_str_Message__actual, Map_str_Message> = createMapCodec<Map_str_Message__actual, Map_str_Message>('Map_str_Message', Str, __dyn_Message)

        // Exports

        export { Map_str_Message }"
    `)
})

it('Renders array', () => {
    expect(
        renderFactory({
            Array_Item_15: {
                t: 'array',
                item: 'Item',
                len: 15,
            },
        }),
    ).toMatchInlineSnapshot(`
        "import { createArrayCodec, dynCodec } from '@scale-codec/definition-runtime'

        import type { ArrayCodecAndFactory, Opaque } from '@scale-codec/definition-runtime'

        // Dynamic codecs

        const __dyn_Item = dynCodec(() => Item)

        // Type: Array_Item_15

        interface Array_Item_15__actual extends Array<Item> {}

        interface Array_Item_15 extends Opaque<Array_Item_15__actual, Array_Item_15> {}

        const Array_Item_15: ArrayCodecAndFactory<Array_Item_15__actual, Array_Item_15> = createArrayCodec<Array_Item_15__actual, Array_Item_15>('Array_Item_15', __dyn_Item, 15)

        // Exports

        export { Array_Item_15 }"
    `)
})

it('Renders bytes array', () => {
    expect(
        renderFactory({
            Hash: {
                t: 'bytes-array',
                len: 64,
            },
        }),
    ).toMatchInlineSnapshot(`
        "import { createArrayU8Codec } from '@scale-codec/definition-runtime'

        import type { Codec } from '@scale-codec/definition-runtime'

        // Type: Hash

        type Hash = Uint8Array

        const Hash: Codec<Hash> = createArrayU8Codec('Hash', 64)

        // Exports

        export { Hash }"
    `)
})

it('Renders option', () => {
    expect(
        renderFactory({
            OptionHash: {
                t: 'option',
                some: 'Hash',
            },
        }),
    ).toMatchInlineSnapshot(`
        "import { createOptionCodec, dynCodec } from '@scale-codec/definition-runtime'

        import type { EnumCodecAndFactory, Opaque, Option } from '@scale-codec/definition-runtime'

        // Dynamic codecs

        const __dyn_Hash = dynCodec(() => Hash)

        // Type: OptionHash

        interface OptionHash__actual extends Option<Hash> {}

        interface OptionHash extends Opaque<OptionHash__actual, OptionHash> {}

        const OptionHash: EnumCodecAndFactory<OptionHash> = createOptionCodec<OptionHash__actual, OptionHash>('OptionHash', __dyn_Hash)

        // Exports

        export { OptionHash }"
    `)
})

it('Renders empty struct as void alias', () => {
    expect(
        renderFactory({
            EmptyStruct: {
                t: 'struct',
                fields: [],
            },
        }),
    ).toMatchInlineSnapshot(`
        "// Type: EmptyStruct

        import { Void as EmptyStruct } from '@scale-codec/definition-runtime'

        // Exports

        export { EmptyStruct }"
    `)
})

it('Renders empty tuple as void alias', () => {
    expect(
        renderFactory({
            EmptyTuple: {
                t: 'tuple',
                items: [],
            },
        }),
    ).toMatchInlineSnapshot(`
        "// Type: EmptyTuple

        import { Void as EmptyTuple } from '@scale-codec/definition-runtime'

        // Exports

        export { EmptyTuple }"
    `)
})

it('Renders an alias for some inner type', () => {
    expect(
        renderFactory({
            StringAlias: {
                t: 'alias',
                ref: 'Str',
            },
        }),
    ).toMatchInlineSnapshot(`
        "import { Str, dynCodec } from '@scale-codec/definition-runtime'

        import type { Codec } from '@scale-codec/definition-runtime'

        // Type: StringAlias

        interface StringAlias extends Str {}

        const StringAlias: Codec<StringAlias> = dynCodec(() => Str)

        // Exports

        export { StringAlias }"
    `)
})

it('Renders single tuple as alias in case when the related option is enabled', async () => {
    expect(
        renderFactory(
            {
                SingleTuple: { t: 'tuple', items: ['U128'] },
                MultiTuple: { t: 'tuple', items: ['U8', 'Bool'] },
            },

            {
                rollupSingleTuplesIntoAliases: true,
            },
        ),
    ).toMatchInlineSnapshot(`
        "import { Bool, U128, U8, createTupleCodec, dynCodec } from '@scale-codec/definition-runtime'

        import type { ArrayCodecAndFactory, Codec, Opaque } from '@scale-codec/definition-runtime'

        // Type: MultiTuple

        type MultiTuple__actual = [U8, Bool]

        interface MultiTuple extends Opaque<MultiTuple__actual, MultiTuple> {}

        const MultiTuple: ArrayCodecAndFactory<MultiTuple__actual, MultiTuple> = createTupleCodec<MultiTuple__actual, MultiTuple>('MultiTuple', [U8, Bool])

        // Type: SingleTuple

        interface SingleTuple extends U128 {}

        const SingleTuple: Codec<SingleTuple> = dynCodec(() => U128)

        // Exports

        export { MultiTuple, SingleTuple }"
    `)
})

it('Render import for the external type as expected', () => {
    expect(
        renderFactory({
            MyCustomExternal: {
                t: 'import',
                module: './module-with-externals',
            },
        }),
    ).toMatchInlineSnapshot(`
        "// Type: MyCustomExternal

        import { MyCustomExternal } from './module-with-externals'

        // Exports

        export { MyCustomExternal }"
    `)
})

it('Renders imports for the external type using the custom name if provided', () => {
    expect(
        renderFactory({
            ReExportMe: {
                t: 'import',
                module: 'some-package',
                nameInModule: 're_export_me',
            },
        }),
    ).toMatchInlineSnapshot(`
        "// Type: ReExportMe

        import { re_export_me as ReExportMe } from 'some-package'

        // Exports

        export { ReExportMe }"
    `)
})

it('Renders result', () => {
    expect(
        renderFactory({
            ResultI128Str: {
                t: 'result',
                ok: 'I128',
                err: 'Str',
            },
        }),
    ).toMatchInlineSnapshot(`
        "import { I128, Str, createResultCodec } from '@scale-codec/definition-runtime'

        import type { EnumCodecAndFactory, Opaque, Result } from '@scale-codec/definition-runtime'

        // Type: ResultI128Str

        interface ResultI128Str__actual extends Result<I128, Str> {}

        interface ResultI128Str extends Opaque<ResultI128Str__actual, ResultI128Str> {}

        const ResultI128Str: EnumCodecAndFactory<ResultI128Str> = createResultCodec<ResultI128Str__actual, ResultI128Str>('ResultI128Str', I128, Str)

        // Exports

        export { ResultI128Str }"
    `)
})

it('Respects custom `runtimeLib` param', () => {
    expect(
        renderFactory(
            {
                S: {
                    t: 'alias',
                    ref: 'Str',
                },
            },

            { runtimeLib: 'custom-runtime-lib' },
        ),
    ).toMatchInlineSnapshot(`
        "import { Str, dynCodec } from 'custom-runtime-lib'

        import type { Codec } from 'custom-runtime-lib'

        // Type: S

        interface S extends Str {}

        const S: Codec<S> = dynCodec(() => Str)

        // Exports

        export { S }"
    `)
})

it('Respects custom set of knowns types set', () => {
    expect(
        renderFactory(
            {
                FooAlias: {
                    t: 'alias',
                    ref: 'Foo',
                },

                // Should not be imported from runtime lib
                StrAlias: {
                    t: 'alias',
                    ref: 'Str',
                },
            },

            { runtimeTypes: new Set(['Foo']) },
        ),
    ).toMatchInlineSnapshot(`
        "import { Foo, dynCodec } from '@scale-codec/definition-runtime'

        import type { Codec } from '@scale-codec/definition-runtime'

        // Type: FooAlias

        interface FooAlias extends Foo {}

        const FooAlias: Codec<FooAlias> = dynCodec(() => Foo)

        // Type: StrAlias

        interface StrAlias extends Str {}

        const StrAlias: Codec<StrAlias> = dynCodec(() => Str)

        // Exports

        export { FooAlias, StrAlias }"
    `)
})

it('When type for void aliases is defined, it is used', () => {
    expect(
        renderFactory(
            {
                EmptyTuple: {
                    t: 'tuple',
                    items: [],
                },
            },

            { typeForVoidAliasing: 'SomeCustomVoid' },
        ),
    ).toMatchInlineSnapshot(`
        "// Type: EmptyTuple

        import { SomeCustomVoid as EmptyTuple } from '@scale-codec/definition-runtime'

        // Exports

        export { EmptyTuple }"
    `)
})
