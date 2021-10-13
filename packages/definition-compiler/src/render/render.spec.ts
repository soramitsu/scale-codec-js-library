import { NamespaceDefinition } from '../definitions';
import { renderNamespaceDefinition } from './render';

async function expectRenderToMatchSnapshot(
    def: NamespaceDefinition,
    importLib = '@scale-codec/definition-compiler-runtime',
) {
    expect(await renderNamespaceDefinition(def, { importLib })).toMatchSnapshot();
}

it('Renders vec', () => {
    return expectRenderToMatchSnapshot({
        Vec_str: {
            t: 'vec',
            item: 'str',
        },
    });
});

it('Renders struct + tuple', () => {
    return expectRenderToMatchSnapshot({
        Structural: {
            t: 'struct',
            fields: [
                {
                    name: 'nums',
                    ref: 'Tuple_u8_i128',
                },
                {
                    name: 'mur',
                    ref: 'bool',
                },
            ],
        },
        Tuple_u8_i128: {
            t: 'tuple',
            items: ['u8', 'i128'],
        },
    });
});

it('Renders enum', () => {
    return expectRenderToMatchSnapshot({
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
                    ref: 'str',
                },
            ],
        },
    });
});

it('Renders set', () => {
    return expectRenderToMatchSnapshot({
        Set_Message: {
            t: 'set',
            entry: 'Message',
        },
    });
});

it('Renders map', () => {
    return expectRenderToMatchSnapshot({
        Map_str_Message: {
            t: 'map',
            key: 'str',
            value: 'Message',
        },
    });
});

it('Renders array', () => {
    return expectRenderToMatchSnapshot({
        Array_Item_15: {
            t: 'array',
            item: 'Item',
            len: 15,
        },
    });
});

it('Renders bytes array', () => {
    return expectRenderToMatchSnapshot({
        Hash: {
            t: 'bytes-array',
            len: 64,
        },
    });
});

it('Renders option', () => {
    return expectRenderToMatchSnapshot({
        OptionHash: {
            t: 'option',
            some: 'Hash',
        },
    });
});

it('Renders empty struct as void alias', () => {
    return expectRenderToMatchSnapshot({
        EmptyStruct: {
            t: 'struct',
            fields: [],
        },
    });
});

it('Renders empty tuple as void alias', () => {
    return expectRenderToMatchSnapshot({
        EmptyTuple: {
            t: 'tuple',
            items: [],
        },
    });
});

it('Renders an alias for some inner type', () => {
    return expectRenderToMatchSnapshot({
        StringAlias: {
            t: 'alias',
            ref: 'str',
        },
    });
});

it('Renders single tuple as alias in case when the related option is enabled', async () => {
    expect(
        await renderNamespaceDefinition(
            {
                SingleTuple: { t: 'tuple', items: ['u128'] },
                MultiTuple: { t: 'tuple', items: ['u8', 'bool'] },
            },
            {
                importLib: '@scale-codec/definition-runtime',
                rollupSingleTuplesIntoAliases: true,
            },
        ),
    ).toMatchSnapshot();
});

it('Render import for the external type as expected', () => {
    return expectRenderToMatchSnapshot({
        MyCustomExternal: {
            t: 'external',
            module: './module-with-externals',
        },
    });
});

it('Renders imports for the external type using the custom name if provided', () => {
    return expectRenderToMatchSnapshot({
        ReExportMe: {
            t: 'external',
            module: 'some-package',
            nameInModule: 're_export_me',
        },
    });
});
