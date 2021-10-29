import { Enum, InstanceViaBuilder, ScaleArrayBuilder, ScaleEnumBuilder, ScaleMapBuilder, ScaleStructBuilder, ScaleTupleBuilder, Str, U32, U8, Valuable, createArrayBuilder, createEnumBuilder, createMapBuilder, createStructBuilder, createTupleBuilder, createVecBuilder, dynBuilder } from '@scale-codec/definition-runtime'

export const Array_u8_32: ScaleArrayBuilder<InstanceViaBuilder<typeof U8>[]> = createArrayBuilder('Array_u8_32', dynBuilder(() => U8), 32)

export const Passport: ScaleTupleBuilder<[
    InstanceViaBuilder<typeof U32>,
    InstanceViaBuilder<typeof U32>
]> = createTupleBuilder('Passport', [dynBuilder(() => U32), dynBuilder(() => U32)])

export const Person: ScaleStructBuilder<{
    name: InstanceViaBuilder<typeof Str>,
    age: InstanceViaBuilder<typeof U8>,
    document: InstanceViaBuilder<typeof PersonDocument>
}> = createStructBuilder('Person', [['name', dynBuilder(() => Str)], ['age', dynBuilder(() => U8)], ['document', dynBuilder(() => PersonDocument)]])

export const PersonDocument: ScaleEnumBuilder<Enum<{
    Id: Valuable<InstanceViaBuilder<typeof U8>>,
    Passport: Valuable<InstanceViaBuilder<typeof Passport>>
}>> = createEnumBuilder('PersonDocument', [[0, 'Id', dynBuilder(() => U8)], [1, 'Passport', dynBuilder(() => Passport)]])

export const PersonsMap: ScaleMapBuilder<Map<InstanceViaBuilder<typeof U8>, InstanceViaBuilder<typeof Person>>> = createMapBuilder('PersonsMap', dynBuilder(() => U8), dynBuilder(() => Person))

export const PersonsVec: ScaleArrayBuilder<InstanceViaBuilder<typeof Person>[]> = createVecBuilder('PersonsVec', dynBuilder(() => Person))

export const PublicKey: ScaleStructBuilder<{
    payload: InstanceViaBuilder<typeof Array_u8_32>
}> = createStructBuilder('PublicKey', [['payload', dynBuilder(() => Array_u8_32)]])
