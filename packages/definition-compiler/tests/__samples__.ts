import { NamespaceDefinition } from '../src/types';

interface Sample {
    def: NamespaceDefinition;
}

function defineSample(def: NamespaceDefinition): Sample {
    return { def };
}

export const aliases = defineSample({
    B: {
        t: 'alias',
        ref: 'Str',
    },
    A: { t: 'alias', ref: 'B' },
    C: { t: 'tuple', items: ['B', 'U8'] },
});

export const externals = defineSample({
    JustExternalInclusion: {
        t: 'import',
        module: '../externals-sample-help',
    },
    WithCustomExternalName: {
        t: 'import',
        module: '../externals-sample-help',
        nameInModule: 'Str',
    },
});

export const complexNamespace = defineSample({
    OptionMsg: {
        t: 'option',
        some: 'Msg',
    },
    VecBool: {
        t: 'vec',
        item: 'Bool',
    },
    SetU8: {
        t: 'set',
        entry: 'U8',
    },
    MapStrU8: {
        t: 'map',
        key: 'Str',
        value: 'U8',
    },
    ArraySetU8l2: {
        t: 'array',
        item: 'SetU8',
        len: 2,
    },
    Msg: {
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
    TupleMsgMsg: {
        t: 'tuple',
        items: ['Msg', 'Msg'],
    },
    StrAlias: {
        t: 'alias',
        ref: 'Str',
    },
    Character: {
        t: 'struct',
        fields: [
            {
                name: 'name',
                ref: 'Str',
            },
        ],
    },
});

export const structFieldsOrdering = defineSample({
    Mystery: {
        t: 'struct',
        fields: [
            { name: 'b', ref: 'Str' },
            { name: 'a', ref: 'Compact' },
            { name: 'A', ref: 'BytesVec' },
        ],
    },
});

export const unwrapCheck = defineSample({
    StructA: {
        t: 'struct',
        fields: [
            { name: 'primitive', ref: 'Bool' },
            { name: 'alias', ref: 'AliasA' },
            { name: 'enum', ref: 'EnumA' },
            { name: 'map', ref: 'MapA' },
            { name: 'set', ref: 'SetA' },
            { name: 'array', ref: 'ArrayA' },
            { name: 'bytesArray', ref: 'BytesArrayA' },
            { name: 'vec', ref: 'VecEnumA' },
            { name: 'tuple', ref: 'TupleA' },
        ],
    },
    TupleA: {
        t: 'tuple',
        items: ['Str'],
    },
    AliasA: {
        t: 'alias',
        ref: 'TupleA',
    },
    MapA: {
        t: 'map',
        key: 'Str',
        value: 'TupleA',
    },
    SetA: {
        t: 'set',
        entry: 'TupleA',
    },
    ArrayA: {
        t: 'array',
        item: 'Bool',
        len: 3,
    },
    BytesArrayA: {
        t: 'bytes-array',
        len: 5,
    },
    VecEnumA: {
        t: 'vec',
        item: 'EnumA',
    },
    OptionA: {
        t: 'option',
        some: 'TupleA',
    },
    ResultA: {
        t: 'result',
        ok: 'TupleA',
        err: 'Str',
    },
    EnumA: {
        t: 'enum',
        variants: [
            { name: 'Opt', discriminant: 0, ref: 'OptionA' },
            { name: 'Res', discriminant: 1, ref: 'ResultA' },
            { name: 'Empty', discriminant: 2 },
        ],
    },
});

/**
 * Some builder could be extended, e.g. enum builder.
 * Alias should handle it OK (type-only check).
 */
export const aliasToAnExtendedBuilder = defineSample({
    Message: {
        t: 'enum',
        variants: [
            {
                name: 'Empty',
                discriminant: 0,
            },
        ],
    },
    Msg: {
        t: 'alias',
        ref: 'Message',
    },
});
