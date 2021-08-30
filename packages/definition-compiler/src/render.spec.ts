import { NamespaceDefinition } from './definitions';
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
