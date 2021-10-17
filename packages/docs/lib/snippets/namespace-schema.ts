import { NamespaceDefinition } from '@scale-codec/definition-compiler';

const schema: NamespaceDefinition = {
    Person: {
        t: 'struct',
        fields: [
            {
                name: 'name',
                ref: 'str',
            },
            {
                name: 'age',
                ref: 'u8',
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
                ref: 'u8',
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
        items: ['u32', 'u32'],
    },
    PersonsMap: {
        t: 'map',
        key: 'u8',
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
        item: 'u8',
        len: 32,
    },
};

export default schema;
