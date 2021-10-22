import { Enum, InstanceViaBuilder, Str, U32, U8, Valuable, createArrayBuilder, createEnumBuilder, createMapBuilder, createStructBuilder, createTupleBuilder, createVecBuilder } from '@scale-codec/definition-runtime'

export var Array_u8_32 = createArrayBuilder<InstanceViaBuilder<typeof U8>[]>('Array_u8_32', () => U8, 32)

export var Passport = createTupleBuilder<[
    InstanceViaBuilder<typeof U32>,
    InstanceViaBuilder<typeof U32>
]>('Passport', [() => U32, () => U32])

export var Person = createStructBuilder<{
    name: InstanceViaBuilder<typeof Str>,
    age: InstanceViaBuilder<typeof U8>,
    document: InstanceViaBuilder<typeof PersonDocument>
}>('Person', [['name', () => Str], ['age', () => U8], ['document', () => PersonDocument]])

export var PersonDocument = createEnumBuilder<Enum<{
    Id: Valuable<InstanceViaBuilder<typeof U8>>,
    Passport: Valuable<InstanceViaBuilder<typeof Passport>>
}>>('PersonDocument', [[0, 'Id', () => U8], [1, 'Passport', () => Passport]])

export var PersonsMap = createMapBuilder<Map<InstanceViaBuilder<typeof U8>, InstanceViaBuilder<typeof Person>>>('PersonsMap', () => U8, () => Person)

export var PersonsVec = createVecBuilder<InstanceViaBuilder<typeof Person>[]>('PersonsVec', () => Person)

export var PublicKey = createStructBuilder<{
    payload: InstanceViaBuilder<typeof Array_u8_32>
}>('PublicKey', [['payload', () => Array_u8_32]])
