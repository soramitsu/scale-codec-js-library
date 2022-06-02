import { createNs, ModelRenderParams } from '../namespace'
import { Set } from 'immutable'

const ns = createNs<'createArrayCodec', 'Codec'>()

const SAMPLE_RENDER_PARAMS: ModelRenderParams = {
  libModule: 'test',
  libTypes: Set(),
}

test('When model is empty, result is empty too', () => {
  expect(ns({ refs: [] }).render(SAMPLE_RENDER_PARAMS)).toEqual('')
})

test('When some runtime helper is used, import is rendered', () => {
  expect(
    ns({
      refs: [ns.refScope('a')`const a = ${ns.libRuntimeHelper('createArrayCodec')}()`],
    }).render(SAMPLE_RENDER_PARAMS),
  ).toMatchInlineSnapshot(`
        "import { createArrayCodec } from 'test'

        // Type: a

        const a = createArrayCodec()

        // Exports

        export { a }"
    `)
})

test('When some type helper is used, import is rendered', () => {
  expect(ns({ refs: [ns.refScope('A')`const a: ${ns.libTypeHelper('Codec')}`] }).render(SAMPLE_RENDER_PARAMS))
    .toMatchInlineSnapshot(`
        "import type { Codec } from 'test'

        // Type: A

        const a: Codec

        // Exports

        export { A }"
    `)
})

test('When (non-lib) ref is used as a variable, dynCodec for it should be rendered', () => {
  expect(
    ns({
      refs: [ns.refScope('something')`const ${ns.self} = ${ns.refVar('another')}`, ns.refScope('another')`p`],
    }).render(SAMPLE_RENDER_PARAMS),
  ).toMatchInlineSnapshot(`
        "import { dynCodec } from 'test'

        // Dynamic codecs

        const __dyn_another = dynCodec(() => another)

        // Type: another

        p

        // Type: something

        const something = __dyn_another

        // Exports

        export { another, something }"
    `)
})

test('When ref from lib is used, then it is imported', () => {
  expect(
    ns({
      refs: [
        ns.refScope('StrOption')`type ${ns.self} = ${ns.refType('Str')}\n\nconst ${ns.self} = createOption(${ns.refVar(
          'Str',
        )})`,
      ],
    }).render({
      ...SAMPLE_RENDER_PARAMS,
      libTypes: Set(['Str']),
    }),
  ).toMatchInlineSnapshot(`
        "import { Str } from 'test'

        // Type: StrOption

        type StrOption = Str

        const StrOption = createOption(Str)

        // Exports

        export { StrOption }"
    `)
})

test('When ns is constructed from multiple refs with custom parts, it is rendered OK', () => {
  const self = ns.part`${ns.self}`

  const foo = ns.refScope('Foo')`const ${self}: ${ns.libTypeHelper('Codec')} = ${ns.libRuntimeHelper(
    'createArrayCodec',
  )}(${ns.refVar('Bar')})`

  const bar = ns.refScope('Bar')`const ${self}: ${ns.libTypeHelper('Codec')} = ${ns.libRuntimeHelper(
    'createArrayCodec',
  )}(${ns.refVar('Str')})`

  const result = ns({ refs: [foo, bar] }).render({
    libModule: 'foobar',
    libTypes: Set(['Str']),
  })

  expect(result).toMatchInlineSnapshot(`
        "import { Str, createArrayCodec, dynCodec } from 'foobar'

        import type { Codec } from 'foobar'

        // Dynamic codecs

        const __dyn_Bar = dynCodec(() => Bar)

        // Type: Bar

        const Bar: Codec = createArrayCodec(Str)

        // Type: Foo

        const Foo: Codec = createArrayCodec(__dyn_Bar)

        // Exports

        export { Bar, Foo }"
    `)
})

test('When ref used as var, but as pure var, then dyn is not rendered', () => {
  expect(
    ns({
      refs: [ns.refScope('a')`const a = ${ns.refVar('NotDyn', true)}()`],
    }).render(SAMPLE_RENDER_PARAMS),
  ).toMatchInlineSnapshot(`
        "// Type: a

        const a = NotDyn()

        // Exports

        export { a }"
    `)
})

test('When import is used, it is rendered', () => {
  expect(
    ns({
      refs: [
        ns.refScope('Foo')`${ns.import({ importWhat: ns.self, moduleName: 'SOME MODULE' })}`,
        ns.refScope('Bar')`${ns.import({ importWhat: 'Something', importAs: ns.self, moduleName: ns.lib })}`,
      ],
    }).render(SAMPLE_RENDER_PARAMS),
  ).toMatchInlineSnapshot(`
        "// Type: Bar

        import { Something as Bar } from 'test'

        // Type: Foo

        import { Foo } from 'SOME MODULE'

        // Exports

        export { Bar, Foo }"
    `)
})

test('When lib name is used, it is rendered', () => {
  expect(
    ns({
      refs: [ns.refScope('Foo')`${ns.lib}`],
    }).render(SAMPLE_RENDER_PARAMS),
  ).toMatchInlineSnapshot(`
        "// Type: Foo

        test

        // Exports

        export { Foo }"
    `)
})

describe('Validation', () => {
  test('When there is an unresolved reference (var) within namespace, it throws', () => {
    expect(() =>
      ns({ refs: [ns.refScope('A')`unresolved: ${ns.refVar('B')}`] }).render({
        libModule: 'test',
        libTypes: Set([]),
      }),
    ).toThrowError('unresolved reference: A -> B')
  })

  test('When there is an unresolved reference (type) within namespace, it throws', () => {
    expect(() =>
      ns({ refs: [ns.refScope('T')`unresolved: ${ns.refType('U')}`] }).render({
        libModule: 'test',
        libTypes: Set([]),
      }),
    ).toThrowError('unresolved reference: T -> U')
  })

  test('When first ref has errors, but next not, it throws', () => {
    expect(() =>
      ns({ refs: [ns.refScope('T')`unresolved: ${ns.refType('U')}`, ns.refScope('NoDeps')``] }).render({
        libModule: 'test',
        libTypes: Set([]),
      }),
    ).toThrowError()
  })
})

describe('Concatenation', () => {
  test.each([
    [
      ns.concat('first', ns.part` Ha ha ${'hey'} ${ns.refType('SomeType')}`, ns.refVar('Var')),
      ns.part`first Ha ha ${'hey'} ${ns.refType('SomeType')}${ns.refVar('Var')}`,
    ],
    [ns.concat(ns.part``, ns.part``), ns.part``],
    [ns.concat(), ns.part``],
  ])('Concat case %#', (actual, expected) => {
    expect(actual).toEqual(expected)
  })
})

describe('Dyns optimization', () => {
  test('When related option is used, it is applied fine (complex test)', () => {
    expect(
      ns({
        refs: [
          ns.refScope('C1')`cyclic: ${ns.refVar('C2')}`,
          ns.refScope('C2')`cyclic: ${ns.refVar('C1')}`,
          ns.refScope('CT1')`cyclic, but only type: ${ns.refType('CT2')}`,
          ns.refScope('CT2')`cyclic, but only type: ${ns.refType('CT1')}`,
          ns.refScope('Z')`no links here, just testing alphabetic sorting`,
          ns.refScope('A')`link to B: ${ns.refVar('B')}`,
          ns.refScope('B')`nothing here`,
        ],
      }).render({
        libModule: 'lib',
        libTypes: Set(['LibA', 'LibB']),
        optimizeDyns: true,
      }),
    ).toMatchInlineSnapshot(`
            "import { dynCodec } from 'lib'

            // Dynamic codecs

            const __dyn_C1 = dynCodec(() => C1)

            // Type: B

            nothing here

            // Type: A

            link to B: B

            // Type: C2

            cyclic: __dyn_C1

            // Type: C1

            cyclic: C2

            // Type: CT2

            cyclic, but only type: CT1

            // Type: CT1

            cyclic, but only type: CT2

            // Type: Z

            no links here, just testing alphabetic sorting

            // Exports

            export { A, B, C1, C2, CT1, CT2, Z }"
        `)
  })
})
