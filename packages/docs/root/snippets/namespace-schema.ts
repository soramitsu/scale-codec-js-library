import { NamespaceDefinition } from '@scale-codec/definition-compiler';

const schema: NamespaceDefinition = {
    Person: {
        t: 'struct',
        fields: [
            {
                name: 'name',
                ref: 'Str',
            },
            {
                name: 'age',
                ref: 'U8',
            },
            {
                name: 'document',
                ref: 'PersonDocument',
            },
        ],
    },
    PersonDocument: {
        t: 'enum',
        variants: [
            {
                name: 'Id',
                discriminant: 0,
                ref: 'U8',
            },
            {
                name: 'Passport',
                discriminant: 1,
                ref: 'Passport',
            },
        ],
    },
    Passport: {
        t: 'tuple',
        items: ['U32', 'U32'],
    },
    PersonsMap: {
        t: 'map',
        key: 'U8',
        value: 'Person',
    },
    PersonsVec: {
        t: 'vec',
        item: 'Person',
    },
    PublicKey: {
        t: 'struct',
        fields: [
            {
                name: 'payload',
                ref: 'Array_u8_32',
            },
        ],
    },
    Array_u8_32: {
        t: 'array',
        item: 'U8',
        len: 32,
    },
};

export default schema;
