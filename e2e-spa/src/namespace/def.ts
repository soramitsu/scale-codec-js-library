import { NamespaceCodegenDefinition } from '@scale-codec/namespace-codegen';

const def: NamespaceCodegenDefinition = {
    string: 'str',
    'Option<str>': {
        t: 'option',
        some: 'str',
    },
    '(string, i32)': {
        t: 'tuple',
        items: ['string', 'i32'],
    },
    '(u64, bool, (string, i32))': {
        t: 'tuple',
        items: ['u64', 'bool', '(string, i32)'],
    },
    Id: {
        t: 'struct',
        fields: [
            {
                name: 'name',
                ref: 'str',
            },
            {
                name: 'domain',
                ref: 'str',
            },
            {
                name: 'second_name',
                ref: 'Option<str>',
            },
            {
                name: 'enum',
                ref: 'CustomEnum',
            },
            {
                name: 'attempt',
                ref: 'Result<(), str>',
            },
        ],
    },
    CustomEnum: {
        t: 'enum',
        variants: [
            {
                name: 'One',
                ref: null,
                discriminant: 0,
            },
            {
                name: 'Two',
                ref: '(u64, bool, (string, i32))',
                discriminant: 1,
            },
        ],
    },
    'HashMap<str, Id>': {
        t: 'map',
        key: 'str',
        value: 'Id',
    },
    'Vec<HashMap<str, Id>>': {
        t: 'vec',
        item: 'HashMap<str, Id>',
    },
    '[Vec<HashMap<str, Id>>; 8]': {
        t: 'array',
        item: 'Vec<HashMap<str, Id>>',
        len: 8,
    },
    'Result<(), str>': {
        t: 'result',
        ok: '()',
        err: 'str',
    },
};

export default def;
