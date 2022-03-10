import { createNs, ModelRenderParams } from '../namespace'

const ns = createNs<'createArrayCodec', 'Codec'>()

const SAMPLE_RENDER_PARAMS: ModelRenderParams = {
    libModule: 'test',
    libTypes: new Set(),
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
        ns({ refs: [ns.refScope('something')`const ${ns.self} = ${ns.refVar('another')}`] }).render(
            SAMPLE_RENDER_PARAMS,
        ),
    ).toMatchInlineSnapshot(`
        "import { dynCodec } from 'test'

        // Dynamic codecs

        const __dyn_another = dynCodec(() => another)

        // Type: something

        const something = __dyn_another

        // Exports

        export { something }"
    `)
})

test('When ref from lib is used, then it is imported', () => {
    expect(
        ns({
            refs: [
                ns.refScope('StrOption')`type ${ns.self} = ${ns.refType('Str')}\n\nconst ${
                    ns.self
                } = createOption(${ns.refVar('Str')})`,
            ],
        }).render({
            ...SAMPLE_RENDER_PARAMS,
            libTypes: new Set(['Str']),
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

// test('When ref scope is used, then self ref is rendered', () => {
//     expect(
//         ns`const b = ${ns.refScope('TEST')`<using ${ns.selfRef()}>`}`.render(SAMPLE_RENDER_PARAMS),
//     ).toMatchInlineSnapshot()
// })

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
        libTypes: new Set(['Str']),
    })

    expect(result).toMatchInlineSnapshot(`
        "import { Str, createArrayCodec, dynCodec } from 'foobar'

        import type { Codec } from 'foobar'

        // Dynamic codecs

        const __dyn_Bar = dynCodec(() => Bar)

        // Type: Foo

        const Foo: Codec = createArrayCodec(__dyn_Bar)

        // Type: Bar

        const Bar: Codec = createArrayCodec(Str)

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
        "// Type: Foo

        import { Foo } from 'SOME MODULE'

        // Type: Bar

        import { Something as Bar } from 'test'

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
