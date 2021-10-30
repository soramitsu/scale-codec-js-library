import { Enum, FragmentFromBuilder, ScaleArrayBuilder, ScaleEnumBuilder, ScaleMapBuilder, ScaleStructBuilder, ScaleTupleBuilder, Str, U32, U8, Valuable, createArrayBuilder, createEnumBuilder, createMapBuilder, createStructBuilder, createTupleBuilder, createVecBuilder, dynBuilder } from '@scale-codec/definition-runtime'

export const Array_u8_32: ScaleArrayBuilder<FragmentFromBuilder<typeof U8>[]> = createArrayBuilder('Array_u8_32', dynBuilder(() => U8), 32)

export const Passport: ScaleTupleBuilder<[
    FragmentFromBuilder<typeof U32>,
    FragmentFromBuilder<typeof U32>
]> = createTupleBuilder('Passport', [dynBuilder(() => U32), dynBuilder(() => U32)])

export const Person: ScaleStructBuilder<{
    name: FragmentFromBuilder<typeof Str>,
    age: FragmentFromBuilder<typeof U8>,
    document: FragmentFromBuilder<typeof PersonDocument>
}> = createStructBuilder('Person', [['name', dynBuilder(() => Str)], ['age', dynBuilder(() => U8)], ['document', dynBuilder(() => PersonDocument)]])

export const PersonDocument: ScaleEnumBuilder<Enum<{
    Id: Valuable<FragmentFromBuilder<typeof U8>>,
    Passport: Valuable<FragmentFromBuilder<typeof Passport>>
}>> = createEnumBuilder('PersonDocument', [[0, 'Id', dynBuilder(() => U8)], [1, 'Passport', dynBuilder(() => Passport)]])

export const PersonsMap: ScaleMapBuilder<Map<FragmentFromBuilder<typeof U8>, FragmentFromBuilder<typeof Person>>> = createMapBuilder('PersonsMap', dynBuilder(() => U8), dynBuilder(() => Person))

export const PersonsVec: ScaleArrayBuilder<FragmentFromBuilder<typeof Person>[]> = createVecBuilder('PersonsVec', dynBuilder(() => Person))

export const PublicKey: ScaleStructBuilder<{
    payload: FragmentFromBuilder<typeof Array_u8_32>
}> = createStructBuilder('PublicKey', [['payload', dynBuilder(() => Array_u8_32)]])
