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
          CodecArray
      } from '@scale-codec/definition-runtime'

      declare const __opaqueTag: unique symbol

      type LocalOpaque<Tag, T> = { [__opaqueTag]: Tag } & T

      // Type: Vec_str

      type Vec_str = LocalOpaque<'Vec_str', Str[]>

      const Vec_str = createVecCodec('Vec_str', Str) as CodecArray<Vec_str>

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
          CodecStruct
      } from '@scale-codec/definition-runtime'

      declare const __opaqueTag: unique symbol

      type LocalOpaque<Tag, T> = { [__opaqueTag]: Tag } & T

      // Dynamic codecs

      const __dyn_Tuple_u8_i128 = dynCodec(() => Tuple_u8_i128)

      // Type: Structural

      type Structural = LocalOpaque<'Structural', {
          nums: Tuple_u8_i128
          mur: Bool
      }>

      const Structural = createStructCodec('Structural', [
          ['nums', __dyn_Tuple_u8_i128],
          ['mur', Bool]
      ]) as CodecStruct<Structural>

      // Type: Tuple_u8_i128

      type __Tuple_u8_i128__pureTuple = [U8, I128]

      type Tuple_u8_i128 = LocalOpaque<'Tuple_u8_i128', __Tuple_u8_i128__pureTuple>

      const Tuple_u8_i128 = createTupleCodec<__Tuple_u8_i128__pureTuple, Tuple_u8_i128>('Tuple_u8_i128', [U8, I128])

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
          CodecEnum,
          Enumerate
      } from '@scale-codec/definition-runtime'

      declare const __opaqueTag: unique symbol

      type LocalOpaque<Tag, T> = { [__opaqueTag]: Tag } & T

      // Type: Message

      type Message = LocalOpaque<'Message', {
          enum: Enumerate<{
              'Quit': []
              'Greeting': [Str]
          }>
      }>

      const Message = createEnumCodec('Message', [
          [0, 'Quit'],
          [1, 'Greeting', Str]
      ]) as CodecEnum<Message>

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
          CodecSet
      } from '@scale-codec/definition-runtime'

      declare const __opaqueTag: unique symbol

      type LocalOpaque<Tag, T> = { [__opaqueTag]: Tag } & T

      // Dynamic codecs

      const __dyn_Message = dynCodec(() => Message)

      // Type: Message

      type Message = Void

      const Message: Codec<Message> = Void

      // Type: Set_Message

      type Set_Message = LocalOpaque<'Set_Message', Set<Message>>

      const Set_Message = createSetCodec('Set_Message', __dyn_Message) as CodecSet<Set_Message>

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
          CodecMap
      } from '@scale-codec/definition-runtime'

      declare const __opaqueTag: unique symbol

      type LocalOpaque<Tag, T> = { [__opaqueTag]: Tag } & T

      // Type: Map_str_i64

      type Map_str_i64 = LocalOpaque<'Map_str_i64', Map<Str, I64>>

      const Map_str_i64 = createMapCodec('Map_str_i64', Str, I64) as CodecMap<Map_str_i64>

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
          CodecArray
      } from '@scale-codec/definition-runtime'

      declare const __opaqueTag: unique symbol

      type LocalOpaque<Tag, T> = { [__opaqueTag]: Tag } & T

      // Type: Array_Str_15

      type Array_Str_15 = LocalOpaque<'Array_Str_15', Str[]>

      const Array_Str_15 = createArrayCodec('Array_Str_15', Str, 15) as CodecArray<Array_Str_15>

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
          CodecEnum,
          RustOption
      } from '@scale-codec/definition-runtime'

      declare const __opaqueTag: unique symbol

      type LocalOpaque<Tag, T> = { [__opaqueTag]: Tag } & T

      // Type: OptionHash

      type OptionHash = LocalOpaque<'OptionHash', { enum: RustOption<U128> }>

      const OptionHash = createOptionCodec('OptionHash', U128) as CodecEnum<OptionHash>

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
          Codec
      } from '@scale-codec/definition-runtime'

      declare const __opaqueTag: unique symbol

      type LocalOpaque<Tag, T> = { [__opaqueTag]: Tag } & T

      // Type: MultiTuple

      type __MultiTuple__pureTuple = [U8, Bool]

      type MultiTuple = LocalOpaque<'MultiTuple', __MultiTuple__pureTuple>

      const MultiTuple = createTupleCodec<__MultiTuple__pureTuple, MultiTuple>('MultiTuple', [U8, Bool])

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
          CodecEnum,
          RustResult
      } from '@scale-codec/definition-runtime'

      declare const __opaqueTag: unique symbol

      type LocalOpaque<Tag, T> = { [__opaqueTag]: Tag } & T

      // Type: ResultI128Str

      type ResultI128Str = LocalOpaque<'ResultI128Str', { enum: RustResult<I128, Str> }>

      const ResultI128Str = createResultCodec('ResultI128Str', I128, Str) as CodecEnum<ResultI128Str>

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
          CodecEnum,
          RustOption
      } from '@scale-codec/definition-runtime'

      declare const __opaqueTag: unique symbol

      type LocalOpaque<Tag, T> = { [__opaqueTag]: Tag } & T

      // Dynamic codecs

      const __dyn_Bar = dynCodec(() => Bar)

      // Type: Foo

      type Foo = LocalOpaque<'Foo', { enum: RustOption<Bar> }>

      const Foo = createOptionCodec('Foo', __dyn_Bar) as CodecEnum<Foo>

      // Type: Bar

      type Bar = LocalOpaque<'Bar', { enum: RustOption<Foo> }>

      const Bar = createOptionCodec('Bar', Foo) as CodecEnum<Bar>

      // Exports

      export {
          Bar,
          Foo
      }"
    `)
  })
})
