import { Enum, Str, U32, U8, createArrayCodec, createEnumCodec, createMapCodec, createStructCodec, createTupleCodec, createVecCodec, dynCodec } from '@scale-codec/definition-runtime'

import type { ArrayCodecAndFactory, EnumCodecAndFactory, MapCodecAndFactory, Opaque, StructCodecAndFactory } from '@scale-codec/definition-runtime'

// Dynamic codecs

const __dyn_PersonDocument = dynCodec(() => PersonDocument)
const __dyn_Passport = dynCodec(() => Passport)
const __dyn_Person = dynCodec(() => Person)
const __dyn_Array_u8_32 = dynCodec(() => Array_u8_32)

// Type: Array_u8_32

interface Array_u8_32__actual extends Array<U8> {}

interface Array_u8_32 extends Opaque<Array_u8_32__actual, Array_u8_32> {}

const Array_u8_32: ArrayCodecAndFactory<Array_u8_32__actual, Array_u8_32> = createArrayCodec<Array_u8_32__actual, Array_u8_32>('Array_u8_32', U8, 32)

// Type: Passport

type Passport__actual = [U32, U32]

interface Passport extends Opaque<Passport__actual, Passport> {}

const Passport: ArrayCodecAndFactory<Passport__actual, Passport> = createTupleCodec<Passport__actual, Passport>('Passport', [U32, U32])

// Type: Person

interface Person__actual {
    name: Str
    age: U8
    document: PersonDocument
}

interface Person extends Opaque<Person__actual, Person> {}

const Person: StructCodecAndFactory<Person__actual, Person> = createStructCodec<Person__actual, Person>('Person', [
    ['name', Str],
    ['age', U8],
    ['document', __dyn_PersonDocument]
])

// Type: PersonDocument

type PersonDocument__actual = Enum<
    | ['Id', U8]
    | ['Passport', Passport]
>

interface PersonDocument extends Opaque<PersonDocument__actual, PersonDocument> {}

const PersonDocument: EnumCodecAndFactory<PersonDocument> = createEnumCodec<PersonDocument__actual, PersonDocument>('PersonDocument', [
    [0, 'Id', U8],
    [1, 'Passport', __dyn_Passport]
])

// Type: PersonsMap

type PersonsMap__actual = Map<U8, Person>

interface PersonsMap extends Opaque<PersonsMap__actual, PersonsMap> {}

const PersonsMap: MapCodecAndFactory<PersonsMap__actual, PersonsMap> = createMapCodec<PersonsMap__actual, PersonsMap>('PersonsMap', U8, __dyn_Person)

// Type: PersonsVec

type PersonsVec__actual = Person[]

interface PersonsVec extends Opaque<PersonsVec__actual, PersonsVec> {}

const PersonsVec: ArrayCodecAndFactory<PersonsVec__actual, PersonsVec> = createVecCodec<PersonsVec__actual, PersonsVec>('PersonsVec', __dyn_Person)

// Type: PublicKey

interface PublicKey__actual {
    payload: Array_u8_32
}

interface PublicKey extends Opaque<PublicKey__actual, PublicKey> {}

const PublicKey: StructCodecAndFactory<PublicKey__actual, PublicKey> = createStructCodec<PublicKey__actual, PublicKey>('PublicKey', [
    ['payload', __dyn_Array_u8_32]
])

// Exports

export { Array_u8_32, Passport, Person, PersonDocument, PersonsMap, PersonsVec, PublicKey }