import { describe, expect, test } from 'vitest'
import { renderNamespaceDefinition } from '..'
import { NamespaceDefinition, RenderNamespaceDefinitionParams } from '../../types'

function renderFactory(def: NamespaceDefinition, params?: RenderNamespaceDefinitionParams): string {
  return renderNamespaceDefinition(def, params)
}

describe('Render', () => {
  test('Renders vec', () => {
    expect(
      renderFactory({
        Vec_str: {
          t: 'vec',
          item: 'Str',
        },
      }),
    ).toMatchInlineSnapshot(`
      "import {
          Str,
          createVecCodec
      } from '@scale-codec/definition-runtime'

      import type {
          ArrayCodecAndFactory,
          Opaque
      } from '@scale-codec/definition-runtime'

      // Type: Vec_str

      type __Vec_str__transparent = Str[]

      declare const __uid0__Vec_str__brand: unique symbol

      type Vec_str = Opaque<__Vec_str__transparent, typeof __uid0__Vec_str__brand>

      const Vec_str: ArrayCodecAndFactory<__Vec_str__transparent, Vec_str> = createVecCodec<__Vec_str__transparent, Vec_str>('Vec_str', Str)

      // Exports

      export {
          Vec_str
      }"
    `)
  })

  test('Renders struct + tuple', () => {
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
      "import {
          Bool,
          I128,
          U8,
          createStructCodec,
          createTupleCodec,
          dynCodec
      } from '@scale-codec/definition-runtime'

      import type {
          ArrayCodecAndFactory,
          Opaque,
          StructCodecAndFactory
      } from '@scale-codec/definition-runtime'

      // Dynamic codecs

      const __dyn_Tuple_u8_i128 = dynCodec(() => Tuple_u8_i128)

      // Type: Structural

      interface __Structural__transparent {
          nums: Tuple_u8_i128
          mur: Bool
      }

      declare const __uid0__Structural__brand: unique symbol

      type Structural = Opaque<__Structural__transparent, typeof __uid0__Structural__brand>

      const Structural: StructCodecAndFactory<__Structural__transparent, Structural> = createStructCodec<__Structural__transparent, Structural>('Structural', [
          ['nums', __dyn_Tuple_u8_i128],
          ['mur', Bool]
      ])

      // Type: Tuple_u8_i128

      type __Tuple_u8_i128__transparent = [U8, I128]

      declare const __uid1__Tuple_u8_i128__brand: unique symbol

      type Tuple_u8_i128 = Opaque<__Tuple_u8_i128__transparent, typeof __uid1__Tuple_u8_i128__brand>

      const Tuple_u8_i128: ArrayCodecAndFactory<__Tuple_u8_i128__transparent, Tuple_u8_i128> = createTupleCodec<__Tuple_u8_i128__transparent, Tuple_u8_i128>('Tuple_u8_i128', [U8, I128])

      // Exports

      export {
          Structural,
          Tuple_u8_i128
      }"
    `)
  })

  test('Renders enum', () => {
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
      "import {
          Str,
          createEnumCodec
      } from '@scale-codec/definition-runtime'

      import type {
          EnumCodecAndFactory,
          Enumerate,
          Opaque
      } from '@scale-codec/definition-runtime'

      // Type: Message

      type __Message__enum = Enumerate<{
          'Quit': []
          'Greeting': [Str]
      }>

      declare const __uid0__Message__brand: unique symbol

      type Message = Opaque<__Message__enum, typeof __uid0__Message__brand>

      const Message: EnumCodecAndFactory<Message> = createEnumCodec<Message>('Message', [
          [0, 'Quit'],
          [1, 'Greeting', Str]
      ])

      // Exports

      export {
          Message
      }"
    `)
  })

  test('Renders set', () => {
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
      "import {
          Void,
          createSetCodec,
          dynCodec
      } from '@scale-codec/definition-runtime'

      import type {
          Codec,
          Opaque,
          SetCodecAndFactory
      } from '@scale-codec/definition-runtime'

      // Dynamic codecs

      const __dyn_Message = dynCodec(() => Message)

      // Type: Message

      type Message = Void

      const Message: Codec<Message> = Void

      // Type: Set_Message

      type __Set_Message__transparent = Set<Message>

      declare const __uid0__Set_Message__brand: unique symbol

      type Set_Message = Opaque<__Set_Message__transparent, typeof __uid0__Set_Message__brand>

      const Set_Message: SetCodecAndFactory<__Set_Message__transparent, Set_Message> = createSetCodec<__Set_Message__transparent, Set_Message>('Set_Message', __dyn_Message)

      // Exports

      export {
          Message,
          Set_Message
      }"
    `)
  })

  test('Renders map', () => {
    expect(
      renderFactory({
        Map_str_i64: {
          t: 'map',
          key: 'Str',
          value: 'I64',
        },
      }),
    ).toMatchInlineSnapshot(`
      "import {
          I64,
          Str,
          createMapCodec
      } from '@scale-codec/definition-runtime'

      import type {
          MapCodecAndFactory,
          Opaque
      } from '@scale-codec/definition-runtime'

      // Type: Map_str_i64

      type __Map_str_i64__transparent = Map<Str, I64>

      declare const __uid0__Map_str_i64__brand: unique symbol

      type Map_str_i64 = Opaque<__Map_str_i64__transparent, typeof __uid0__Map_str_i64__brand>

      const Map_str_i64: MapCodecAndFactory<__Map_str_i64__transparent, Map_str_i64> = createMapCodec<__Map_str_i64__transparent, Map_str_i64>('Map_str_i64', Str, I64)

      // Exports

      export {
          Map_str_i64
      }"
    `)
  })

  test('Renders array', () => {
    expect(
      renderFactory({
        Array_Str_15: {
          t: 'array',
          item: 'Str',
          len: 15,
        },
      }),
    ).toMatchInlineSnapshot(`
      "import {
          Str,
          createArrayCodec
      } from '@scale-codec/definition-runtime'

      import type {
          ArrayCodecAndFactory,
          Opaque
      } from '@scale-codec/definition-runtime'

      // Type: Array_Str_15

      interface __Array_Str_15__transparent extends Array<Str> {}

      declare const __uid0__Array_Str_15__brand: unique symbol

      type Array_Str_15 = Opaque<__Array_Str_15__transparent, typeof __uid0__Array_Str_15__brand>

      const Array_Str_15: ArrayCodecAndFactory<__Array_Str_15__transparent, Array_Str_15> = createArrayCodec<__Array_Str_15__transparent, Array_Str_15>('Array_Str_15', Str, 15)

      // Exports

      export {
          Array_Str_15
      }"
    `)
  })

  test('Renders bytes array', () => {
    expect(
      renderFactory({
        Hash: {
          t: 'bytes-array',
          len: 64,
        },
      }),
    ).toMatchInlineSnapshot(`
      "import {
          createArrayU8Codec
      } from '@scale-codec/definition-runtime'

      import type {
          Codec
      } from '@scale-codec/definition-runtime'

      // Type: Hash

      type Hash = Uint8Array

      const Hash: Codec<Hash> = createArrayU8Codec('Hash', 64)

      // Exports

      export {
          Hash
      }"
    `)
  })

  test('Renders option', () => {
    expect(
      renderFactory({
        OptionHash: {
          t: 'option',
          some: 'U128',
        },
      }),
    ).toMatchInlineSnapshot(`
      "import {
          U128,
          createOptionCodec
      } from '@scale-codec/definition-runtime'

      import type {
          EnumCodecAndFactory,
          Opaque,
          RustOption
      } from '@scale-codec/definition-runtime'

      // Type: OptionHash

      declare const __uid0__OptionHash__brand: unique symbol

      type OptionHash = Opaque<RustOption<U128>, typeof __uid0__OptionHash__brand>

      const OptionHash: EnumCodecAndFactory<OptionHash> = createOptionCodec<OptionHash>('OptionHash', U128)

      // Exports

      export {
          OptionHash
      }"
    `)
  })

  test('Renders empty struct as void alias', () => {
    expect(
      renderFactory({
        EmptyStruct: {
          t: 'struct',
          fields: [],
        },
      }),
    ).toMatchInlineSnapshot(`
      "// Type: EmptyStruct

      import {
          Void as EmptyStruct
      } from '@scale-codec/definition-runtime'

      // Exports

      export {
          EmptyStruct
      }"
    `)
  })

  test('Renders empty tuple as void alias', () => {
    expect(
      renderFactory({
        EmptyTuple: {
          t: 'tuple',
          items: [],
        },
      }),
    ).toMatchInlineSnapshot(`
      "// Type: EmptyTuple

      import {
          Void as EmptyTuple
      } from '@scale-codec/definition-runtime'

      // Exports

      export {
          EmptyTuple
      }"
    `)
  })

  test('Renders an alias for some inner type', () => {
    expect(
      renderFactory({
        StringAlias: {
          t: 'alias',
          ref: 'Str',
        },
      }),
    ).toMatchInlineSnapshot(`
      "import {
          Str
      } from '@scale-codec/definition-runtime'

      import type {
          Codec
      } from '@scale-codec/definition-runtime'

      // Type: StringAlias

      type StringAlias = Str

      const StringAlias: Codec<StringAlias> = Str

      // Exports

      export {
          StringAlias
      }"
    `)
  })

  test('Renders single tuple as alias in case when the related option is enabled', async () => {
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
      "import {
          Bool,
          U128,
          U8,
          createTupleCodec
      } from '@scale-codec/definition-runtime'

      import type {
          ArrayCodecAndFactory,
          Codec,
          Opaque
      } from '@scale-codec/definition-runtime'

      // Type: MultiTuple

      type __MultiTuple__transparent = [U8, Bool]

      declare const __uid0__MultiTuple__brand: unique symbol

      type MultiTuple = Opaque<__MultiTuple__transparent, typeof __uid0__MultiTuple__brand>

      const MultiTuple: ArrayCodecAndFactory<__MultiTuple__transparent, MultiTuple> = createTupleCodec<__MultiTuple__transparent, MultiTuple>('MultiTuple', [U8, Bool])

      // Type: SingleTuple

      type SingleTuple = U128

      const SingleTuple: Codec<SingleTuple> = U128

      // Exports

      export {
          MultiTuple,
          SingleTuple
      }"
    `)
  })

  test('Render import for the external type as expected', () => {
    expect(
      renderFactory({
        MyCustomExternal: {
          t: 'import',
          module: './module-with-externals',
        },
      }),
    ).toMatchInlineSnapshot(`
      "// Type: MyCustomExternal

      import {
          MyCustomExternal
      } from './module-with-externals'

      // Exports

      export {
          MyCustomExternal
      }"
    `)
  })

  test('Renders imports for the external type using the custom name if provided', () => {
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

      import {
          re_export_me as ReExportMe
      } from 'some-package'

      // Exports

      export {
          ReExportMe
      }"
    `)
  })

  test('Renders result', () => {
    expect(
      renderFactory({
        ResultI128Str: {
          t: 'result',
          ok: 'I128',
          err: 'Str',
        },
      }),
    ).toMatchInlineSnapshot(`
      "import {
          I128,
          Str,
          createResultCodec
      } from '@scale-codec/definition-runtime'

      import type {
          EnumCodecAndFactory,
          Opaque,
          RustResult
      } from '@scale-codec/definition-runtime'

      // Type: ResultI128Str

      declare const __uid0__ResultI128Str__brand: unique symbol

      type ResultI128Str = Opaque<RustResult<I128, Str>, typeof __uid0__ResultI128Str__brand>

      const ResultI128Str: EnumCodecAndFactory<ResultI128Str> = createResultCodec<ResultI128Str>('ResultI128Str', I128, Str)

      // Exports

      export {
          ResultI128Str
      }"
    `)
  })

  test('Respects custom `runtimeLib` param', () => {
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
      "import {
          Str
      } from 'custom-runtime-lib'

      import type {
          Codec
      } from 'custom-runtime-lib'

      // Type: S

      type S = Str

      const S: Codec<S> = Str

      // Exports

      export {
          S
      }"
    `)
  })

  test('When custom runtimeTypes set is used, it is respected', () => {
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
      "import {
          Foo
      } from '@scale-codec/definition-runtime'

      import type {
          Codec
      } from '@scale-codec/definition-runtime'

      // Type: FooAlias

      type FooAlias = Foo

      const FooAlias: Codec<FooAlias> = Foo

      // Exports

      export {
          FooAlias
      }"
    `)
  })

  test('When custom runtimeTypes set is used, default types are not available', () => {
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

  test('When type for void aliases is defined, it is used', () => {
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

      import {
          SomeCustomVoid as EmptyTuple
      } from '@scale-codec/definition-runtime'

      // Exports

      export {
          EmptyTuple
      }"
    `)
  })

  test('When optimizeDyns param is set to true, it is applied', () => {
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
      "import {
          createOptionCodec,
          dynCodec
      } from '@scale-codec/definition-runtime'

      import type {
          EnumCodecAndFactory,
          Opaque,
          RustOption
      } from '@scale-codec/definition-runtime'

      // Dynamic codecs

      const __dyn_Bar = dynCodec(() => Bar)

      // Type: Foo

      declare const __uid1__Foo__brand: unique symbol

      type Foo = Opaque<RustOption<Bar>, typeof __uid1__Foo__brand>

      const Foo: EnumCodecAndFactory<Foo> = createOptionCodec<Foo>('Foo', __dyn_Bar)

      // Type: Bar

      declare const __uid0__Bar__brand: unique symbol

      type Bar = Opaque<RustOption<Foo>, typeof __uid0__Bar__brand>

      const Bar: EnumCodecAndFactory<Bar> = createOptionCodec<Bar>('Bar', Foo)

      // Exports

      export {
          Bar,
          Foo
      }"
    `)
  })
})
