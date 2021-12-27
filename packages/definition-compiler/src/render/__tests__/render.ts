import { renderNamespaceDefinition } from '..'
import { NamespaceDefinition, RenderNamespaceDefinitionParams } from '../../types'

function matchSnapshot(def: NamespaceDefinition, params?: RenderNamespaceDefinitionParams) {
    expect(renderNamespaceDefinition(def, params)).toMatchSnapshot()
}

it('Renders vec', () => {
    matchSnapshot({
        Vec_str: {
            t: 'vec',
            item: 'Str',
        },
    })
})

it('Renders struct + tuple', () => {
    matchSnapshot({
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
    })
})

it('Renders enum', () => {
    matchSnapshot({
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
    })
})

it('Renders set', () => {
    matchSnapshot({
        Set_Message: {
            t: 'set',
            entry: 'Message',
        },
    })
})

it('Renders map', () => {
    matchSnapshot({
        Map_str_Message: {
            t: 'map',
            key: 'Str',
            value: 'Message',
        },
    })
})

it('Renders array', () => {
    matchSnapshot({
        Array_Item_15: {
            t: 'array',
            item: 'Item',
            len: 15,
        },
    })
})

it('Renders bytes array', () => {
    matchSnapshot({
        Hash: {
            t: 'bytes-array',
            len: 64,
        },
    })
})

it('Renders option', () => {
    matchSnapshot({
        OptionHash: {
            t: 'option',
            some: 'Hash',
        },
    })
})

it('Renders empty struct as void alias', () => {
    matchSnapshot({
        EmptyStruct: {
            t: 'struct',
            fields: [],
        },
    })
})

it('Renders empty tuple as void alias', () => {
    matchSnapshot({
        EmptyTuple: {
            t: 'tuple',
            items: [],
        },
    })
})

it('Renders an alias for some inner type', () => {
    matchSnapshot({
        StringAlias: {
            t: 'alias',
            ref: 'Str',
        },
    })
})

it('Renders single tuple as alias in case when the related option is enabled', async () => {
    matchSnapshot(
        {
            SingleTuple: { t: 'tuple', items: ['U128'] },
            MultiTuple: { t: 'tuple', items: ['U8', 'Bool'] },
        },
        {
            rollupSingleTuplesIntoAliases: true,
        },
    )
})

it('Render import for the external type as expected', () => {
    matchSnapshot({
        MyCustomExternal: {
            t: 'import',
            module: './module-with-externals',
        },
    })
})

it('Renders imports for the external type using the custom name if provided', () => {
    matchSnapshot({
        ReExportMe: {
            t: 'import',
            module: 'some-package',
            nameInModule: 're_export_me',
        },
    })
})

it('Renders result', () => {
    matchSnapshot({
        ResultI128Str: {
            t: 'result',
            ok: 'I128',
            err: 'Str',
        },
    })
})

it('Respects custom `runtimeLib` param', () => {
    matchSnapshot(
        {
            S: {
                t: 'alias',
                ref: 'Str',
            },
        },
        { runtimeLib: 'custom-runtime-lib' },
    )
})

it('Respects custom set of knowns types set', () => {
    matchSnapshot(
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
    )
})
