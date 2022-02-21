import { EnumCodec, MapCodec, Str, StructCodec, TupleCodec, U32, U8, VecCodec, createArrayCodec, createEnumCodec, createMapCodec, createStructCodec, createTupleCodec, createVecCodec, dynCodec } from '@scale-codec/definition-runtime'

export const Array_u8_32: VecCodec<typeof U8> = createArrayCodec('Array_u8_32', dynCodec(() => U8), 32)

export const Passport: TupleCodec<[typeof U32, typeof U32]> = createTupleCodec('Passport', [dynCodec(() => U32), dynCodec(() => U32)])

export const Person: StructCodec<{
    name: typeof Str,
    age: typeof U8,
    document: typeof PersonDocument
}> = createStructCodec('Person', [['name', dynCodec(() => Str)], ['age', dynCodec(() => U8)], ['document', dynCodec(() => PersonDocument)]])

export const PersonDocument: EnumCodec<
    | ['Id', typeof U8]
    | ['Passport', typeof Passport]
> = createEnumCodec<any>('PersonDocument', [[0, 'Id', dynCodec(() => U8)], [1, 'Passport', dynCodec(() => Passport)]])

export const PersonsMap: MapCodec<typeof U8, typeof Person> = createMapCodec('PersonsMap', dynCodec(() => U8), dynCodec(() => Person))

export const PersonsVec: VecCodec<typeof Person> = createVecCodec('PersonsVec', dynCodec(() => Person))

export const PublicKey: StructCodec<{
    payload: typeof Array_u8_32
}> = createStructCodec('PublicKey', [['payload', dynCodec(() => Array_u8_32)]])
