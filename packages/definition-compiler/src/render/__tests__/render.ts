import { expect, it } from 'vitest'
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

      Message: {
        t: 'alias',
        ref: 'Void',
      },
    }),
  ).toMatchInlineSnapshot(`
        "import { Void, createSetCodec, dynCodec } from '@scale-codec/definition-runtime'

        import type { Codec, Opaque, SetCodecAndFactory } from '@scale-codec/definition-runtime'

        // Dynamic codecs

        const __dyn_Message = dynCodec(() => Message)

        // Type: Message

        type Message = Void

        const Message: Codec<Message> = Void

        // Type: Set_Message

        type Set_Message__actual = Set<Message>

        interface Set_Message extends Opaque<Set_Message__actual, Set_Message> {}

        const Set_Message: SetCodecAndFactory<Set_Message__actual, Set_Message> = createSetCodec<Set_Message__actual, Set_Message>('Set_Message', __dyn_Message)

        // Exports

        export { Message, Set_Message }"
    `)
})

it('Renders map', () => {
  expect(
    renderFactory({
      Map_str_i64: {
        t: 'map',
        key: 'Str',
        value: 'I64',
      },
    }),
  ).toMatchInlineSnapshot(`
        "import { I64, Str, createMapCodec } from '@scale-codec/definition-runtime'

        import type { MapCodecAndFactory, Opaque } from '@scale-codec/definition-runtime'

        // Type: Map_str_i64

        type Map_str_i64__actual = Map<Str, I64>

        interface Map_str_i64 extends Opaque<Map_str_i64__actual, Map_str_i64> {}

        const Map_str_i64: MapCodecAndFactory<Map_str_i64__actual, Map_str_i64> = createMapCodec<Map_str_i64__actual, Map_str_i64>('Map_str_i64', Str, I64)

        // Exports

        export { Map_str_i64 }"
    `)
})

it('Renders array', () => {
  expect(
    renderFactory({
      Array_Str_15: {
        t: 'array',
        item: 'Str',
        len: 15,
      },
    }),
  ).toMatchInlineSnapshot(`
        "import { Str, createArrayCodec } from '@scale-codec/definition-runtime'

        import type { ArrayCodecAndFactory, Opaque } from '@scale-codec/definition-runtime'

        // Type: Array_Str_15

        interface Array_Str_15__actual extends Array<Str> {}

        interface Array_Str_15 extends Opaque<Array_Str_15__actual, Array_Str_15> {}

        const Array_Str_15: ArrayCodecAndFactory<Array_Str_15__actual, Array_Str_15> = createArrayCodec<Array_Str_15__actual, Array_Str_15>('Array_Str_15', Str, 15)

        // Exports

        export { Array_Str_15 }"
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
        some: 'U128',
      },
    }),
  ).toMatchInlineSnapshot(`
        "import { U128, createOptionCodec } from '@scale-codec/definition-runtime'

        import type { EnumCodecAndFactory, Opaque, Option } from '@scale-codec/definition-runtime'

        // Type: OptionHash

        interface OptionHash__actual extends Option<U128> {}

        interface OptionHash extends Opaque<OptionHash__actual, OptionHash> {}

        const OptionHash: EnumCodecAndFactory<OptionHash> = createOptionCodec<OptionHash__actual, OptionHash>('OptionHash', U128)

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
        "import { Str } from '@scale-codec/definition-runtime'

        import type { Codec } from '@scale-codec/definition-runtime'

        // Type: StringAlias

        type StringAlias = Str

        const StringAlias: Codec<StringAlias> = Str

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
        "import { Bool, U128, U8, createTupleCodec } from '@scale-codec/definition-runtime'

        import type { ArrayCodecAndFactory, Codec, Opaque } from '@scale-codec/definition-runtime'

        // Type: MultiTuple

        type MultiTuple__actual = [U8, Bool]

        interface MultiTuple extends Opaque<MultiTuple__actual, MultiTuple> {}

        const MultiTuple: ArrayCodecAndFactory<MultiTuple__actual, MultiTuple> = createTupleCodec<MultiTuple__actual, MultiTuple>('MultiTuple', [U8, Bool])

        // Type: SingleTuple

        type SingleTuple = U128

        const SingleTuple: Codec<SingleTuple> = U128

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
        "import { Str } from 'custom-runtime-lib'

        import type { Codec } from 'custom-runtime-lib'

        // Type: S

        type S = Str

        const S: Codec<S> = Str

        // Exports

        export { S }"
    `)
})

it('When custom runtimeTypes set is used, it is respected', () => {
  expect(
    renderFactory(
      {
        FooAlias: {
          t: 'alias',
          ref: 'Foo',
        },
      },

      { runtimeTypes: new Set(['Foo']) },
    ),
  ).toMatchInlineSnapshot(`
        "import { Foo } from '@scale-codec/definition-runtime'

        import type { Codec } from '@scale-codec/definition-runtime'

        // Type: FooAlias

        type FooAlias = Foo

        const FooAlias: Codec<FooAlias> = Foo

        // Exports

        export { FooAlias }"
    `)
})

it('When custom runtimeTypes set is used, default types are not available', () => {
  expect(() =>
    renderFactory(
      {
        StrAlias: {
          t: 'alias',
          ref: 'Str',
        },
      },
      { runtimeTypes: new Set(['Foo']) },
    ),
  ).toThrowError()
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

it('When optimizeDyns param is set to true, it is applied', () => {
  expect(
    renderFactory(
      {
        Foo: {
          t: 'option',
          some: 'Bar',
        },

        Bar: {
          t: 'option',
          some: 'Foo',
        },
      },

      {
        optimizeDyns: true,
      },
    ),
  ).toMatchInlineSnapshot(`
        "import { createOptionCodec, dynCodec } from '@scale-codec/definition-runtime'

        import type { EnumCodecAndFactory, Opaque, Option } from '@scale-codec/definition-runtime'

        // Dynamic codecs

        const __dyn_Bar = dynCodec(() => Bar)

        // Type: Foo

        interface Foo__actual extends Option<Bar> {}

        interface Foo extends Opaque<Foo__actual, Foo> {}

        const Foo: EnumCodecAndFactory<Foo> = createOptionCodec<Foo__actual, Foo>('Foo', __dyn_Bar)

        // Type: Bar

        interface Bar__actual extends Option<Foo> {}

        interface Bar extends Opaque<Bar__actual, Bar> {}

        const Bar: EnumCodecAndFactory<Bar> = createOptionCodec<Bar__actual, Bar>('Bar', Foo)

        // Exports

        export { Bar, Foo }"
    `)
})
