import prettier from 'prettier';
import prettierConfig from '../../../.prettierrc.js';
import { NamespaceCodegenDefinition } from './types';
import { generate, GenerateOptions } from './gen';

function format(tsCode: string): string {
    return prettier.format(tsCode, {
        ...(prettierConfig as any),
        parser: 'typescript',
    });
}

function shouldMatchCode(def: NamespaceCodegenDefinition, opts: GenerateOptions, expectedLike: string) {
    const expected = format(expectedLike);
    const actual = format(generate(def, opts));

    expect(actual).toEqual(expected);
}

function shouldMatchSnapshot(def: NamespaceCodegenDefinition, opts: GenerateOptions) {
    expect(format(generate(def, opts))).toMatchSnapshot();
}

function sortImports(...imports: string[]): string {
    imports.sort();
    return imports.join(', ');
}

describe('generate()', () => {
    test('empty definition', () => {
        shouldMatchCode(
            {},
            {
                namespaceTypeName: 'CustomNamespace',
                namespaceValueName: 'ns',
                importLib: 'scale-codec',
            },
            `
            import { ${sortImports('StdTypes', 'StdCodecs', 'defNamespace')} } from 'scale-codec';

            export type CustomNamespace = StdTypes & {};

            export const ns = defNamespace<CustomNamespace>({
                ...StdCodecs
            })
            `,
        );
    });

    test('definition with alias to std', () => {
        shouldMatchCode(
            { String: 'str' },
            { namespaceTypeName: 'WithAlias', namespaceValueName: 'ns', importLib: 'scale-codec' },
            `
            import { ${sortImports('StdTypes', 'StdCodecs', 'defNamespace', 'defAlias')} } from 'scale-codec';

            export type WithAlias = StdTypes & {
                String: WithAlias['str']
            };

            export const ns = defNamespace<WithAlias>({
                ...StdCodecs, String: defAlias('str') })
            `,
        );
    });

    test('definition with struct', () => {
        shouldMatchSnapshot(
            {
                Id: {
                    t: 'struct',
                    fields: [
                        {
                            name: 'id',
                            ref: 'str',
                        },
                    ],
                },
            },
            {
                namespaceTypeName: 'WithId',
                namespaceValueName: 'withId',
                importLib: 'my-scale',
            },
        );
    });

    test('complex definition', () => {
        shouldMatchSnapshot(
            {
                String: 'str',
                '(u64, u32)': {
                    t: 'tuple',
                    items: ['u64', 'u32'],
                },
                'BTreeMap<String, bool>': {
                    t: 'map',
                    key: 'String',
                    value: 'bool',
                },
                'Option<(u64, u32)>': {
                    t: 'option',
                    some: '(u64, u32)',
                },
                'Result<String, String>': {
                    t: 'result',
                    ok: 'String',
                    err: 'String',
                },
                'Result<(), str>': {
                    t: 'result',
                    ok: '()',
                    err: 'str',
                },
                IpAddr: {
                    t: 'enum',
                    variants: [
                        {
                            name: 'V4',
                            discriminant: 0,
                            ref: 'u8',
                        },
                        {
                            name: 'V6',
                            discriminant: 1,
                            ref: 'u16',
                        },
                        {
                            name: 'Invalid',
                            discriminant: 3,
                            ref: null,
                        },
                    ],
                },
            },
            {
                namespaceTypeName: 'Complex',
                namespaceValueName: 'complex',
                importLib: '@scale-codec/namespace',
            },
        );
    });

    test('error if entry duplicated std type', () => {
        expect(() =>
            generate(
                {
                    str: 'u32',
                },
                { namespaceTypeName: 'test', namespaceValueName: 'test', importLib: 'test' },
            ),
        ).toThrow();
    });

    test('error if duplicated enum discriminants', () => {
        expect(() => {
            generate(
                {
                    SomeEnum: {
                        t: 'enum',
                        variants: [
                            {
                                name: 'one',
                                discriminant: 0,
                                ref: null,
                            },
                            {
                                name: 'two',
                                discriminant: 0,
                                ref: null,
                            },
                        ],
                    },
                },
                { namespaceTypeName: 'test', namespaceValueName: 'test', importLib: 'test' },
            );
        }).toThrow();
    });

    test.todo('other validation errors');

    test('struct props camelCased if related option is provided', () => {
        shouldMatchSnapshot(
            {
                Example: {
                    t: 'struct',
                    fields: [
                        {
                            name: 'foo_bar_baz',
                            ref: 'u64',
                        },
                        {
                            name: 'another_snake',
                            ref: 'u32',
                        },
                    ],
                },
            },
            {
                namespaceTypeName: 'test',
                namespaceValueName: 'test',
                importLib: 'test',

                structPropsCamelCase: true,
            },
        );
    });

    test('using set', () => {
        shouldMatchSnapshot(
            {
                'BTreeSet<str>': {
                    t: 'set',
                    entry: 'str',
                },
            },
            {
                namespaceTypeName: 'test',
                namespaceValueName: 'test',
                importLib: 'test',
            },
        );
    });

    test('array of bytes', () => {
        shouldMatchSnapshot(
            {
                '[u8; 512]': {
                    t: 'bytes-array',
                    len: 512,
                },
            },
            {
                namespaceTypeName: 'TYPE',
                namespaceValueName: 'VALUE',
                importLib: 'test',
            },
        );
    });
});
