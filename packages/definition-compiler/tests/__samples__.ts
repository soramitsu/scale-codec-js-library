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
        t: 'external',
        module: '../externals-sample-help',
    },
    WithCustomExternalName: {
        t: 'external',
        module: '../externals-sample-help',
        nameInModule: 'Str',
    },
});

// export const enums = defineSample({
//     Message: {
//         t: 'enum',
//         variants: [
//             {
//                 discriminant: 0,
//                 name: 'Quit',
//             },
//             {
//                 discriminant: 1,
//                 name: 'Greeting',
//                 ref: 'Str',
//             },
//         ],
//     },
//     OptionMessage: {
//         t: 'option',
//         some: 'Message',
//     },
// });

// export const struct = defineSample({
//     Character: {
//         t: 'struct',
//         fields: [
//             {
//                 name: 'name',
//                 ref: 'Str',
//             },
//             {
//                 name: 'age',
//                 ref: 'U8',
//             },
//         ],
//     },
// });

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
