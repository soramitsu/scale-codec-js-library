/* eslint-disable */
import {
    DecodeResult,
    Encode,
    EncodeAsIs,
    Enum,
    EnumDecoders,
    EnumEncoders,
    Valuable,
    decodeArray,
    decodeEnum,
    decodeMap,
    decodeStruct,
    decodeTuple,
    decodeVec,
    encodeArray,
    encodeEnum,
    encodeMap,
    encodeStruct,
    encodeTuple,
    encodeVec,
    makeEncoderAsIsRespectable,
    str_Decoded,
    str_Encodable,
    str_decode,
    str_encode,
    u32_Decoded,
    u32_Encodable,
    u32_decode,
    u32_encode,
    u8_Decoded,
    u8_Encodable,
    u8_decode,
    u8_encode,
} from '@scale-codec/definition-runtime';

// Array_u8_32

export type Array_u8_32_Decoded = u8_Decoded[];

export type Array_u8_32_Encodable = (u8_Encodable | EncodeAsIs)[];

const Array_u8_32_item_encode = makeEncoderAsIsRespectable(u8_encode);
const Array_u8_32_len = 32;

export function Array_u8_32_decode(bytes: Uint8Array): DecodeResult<Array_u8_32_Decoded> {
    return decodeArray(bytes, u8_decode, Array_u8_32_len);
}

export function Array_u8_32_encode(encodable: Array_u8_32_Encodable): Uint8Array {
    return encodeArray(encodable, Array_u8_32_item_encode, Array_u8_32_len);
}

// Passport

export type Passport_Decoded = [u32_Decoded, u32_Decoded];

export type Passport_Encodable = [u32_Encodable | EncodeAsIs, u32_Encodable | EncodeAsIs];

// Passport tuple-related tools

const Passport_decoders = [u32_decode, u32_decode];
const Passport_encoders = ([u32_encode, u32_encode] as any).map(makeEncoderAsIsRespectable);

// Passport tools end

export function Passport_decode(bytes: Uint8Array): DecodeResult<Passport_Decoded> {
    return decodeTuple(bytes, Passport_decoders as any);
}

export function Passport_encode(encodable: Passport_Encodable): Uint8Array {
    return encodeTuple(encodable, Passport_encoders as any);
}

// Person

export type Person_Decoded = {
    name: str_Decoded;
    age: u8_Decoded;
    document: PersonDocument_Decoded;
};

export type Person_Encodable = {
    name: str_Encodable | EncodeAsIs;
    age: u8_Encodable | EncodeAsIs;
    document: PersonDocument_Encodable | EncodeAsIs;
};

const Person_order: (keyof Person_Decoded)[] = ['name', 'age', 'document'];
const Person_decoders = {
    name: str_decode,
    age: u8_decode,
    document: PersonDocument_decode,
};
const Person_encoders = {
    name: makeEncoderAsIsRespectable(str_encode),
    age: makeEncoderAsIsRespectable(u8_encode),
    document: makeEncoderAsIsRespectable(PersonDocument_encode),
};

export function Person_decode(bytes: Uint8Array): DecodeResult<Person_Decoded> {
    return decodeStruct(bytes, Person_decoders, Person_order);
}

export function Person_encode(encodable: Person_Encodable): Uint8Array {
    return encodeStruct(encodable, Person_encoders, Person_order);
}

// PersonDocument

export type PersonDocument_Decoded = Enum<{
    Id: Valuable<u8_Decoded>;
    Passport: Valuable<Passport_Decoded>;
}>;

export type PersonDocument_Encodable = Enum<{
    Id: Valuable<u8_Encodable | EncodeAsIs>;
    Passport: Valuable<Passport_Encodable | EncodeAsIs>;
}>;

// PersonDocument enum tools

const PersonDocument_decoders: EnumDecoders = {
    0: { v: 'Id', decode: u8_decode },
    1: { v: 'Passport', decode: Passport_decode },
};
const PersonDocument_encoders: EnumEncoders = {
    Id: { d: 0, encode: makeEncoderAsIsRespectable(u8_encode) },
    Passport: { d: 1, encode: makeEncoderAsIsRespectable(Passport_encode) },
};

// PersonDocument tools end

export function PersonDocument_decode(bytes: Uint8Array): DecodeResult<PersonDocument_Decoded> {
    return decodeEnum(bytes, PersonDocument_decoders);
}

export function PersonDocument_encode(encodable: PersonDocument_Encodable): Uint8Array {
    return encodeEnum(encodable, PersonDocument_encoders);
}

// PersonsMap

export type PersonsMap_Decoded = Map<u8_Decoded, Person_Decoded>;

export type PersonsMap_Encodable = Map<u8_Encodable | EncodeAsIs, Person_Encodable | EncodeAsIs>;

const [PersonsMap_encode_key, PersonsMap_encode_value] = ([u8_encode, Person_encode] as any).map(
    makeEncoderAsIsRespectable,
) as [Encode<u8_Encodable | EncodeAsIs>, Encode<Person_Encodable | EncodeAsIs>];

export function PersonsMap_decode(bytes: Uint8Array): DecodeResult<PersonsMap_Decoded> {
    return decodeMap(bytes, u8_decode, Person_decode);
}

export function PersonsMap_encode(encodable: PersonsMap_Encodable): Uint8Array {
    return encodeMap(encodable, PersonsMap_encode_key, PersonsMap_encode_value);
}

// PersonsVec

export type PersonsVec_Decoded = Person_Decoded[];

export type PersonsVec_Encodable = (Person_Encodable | EncodeAsIs)[];

const PersonsVec_item_encode = makeEncoderAsIsRespectable(Person_encode);

export function PersonsVec_decode(bytes: Uint8Array): DecodeResult<PersonsVec_Decoded> {
    return decodeVec(bytes, Person_decode);
}

export function PersonsVec_encode(encodable: PersonsVec_Encodable): Uint8Array {
    return encodeVec(encodable, PersonsVec_item_encode);
}

// PublicKey

export type PublicKey_Decoded = {
    payload: Array_u8_32_Decoded;
};

export type PublicKey_Encodable = {
    payload: Array_u8_32_Encodable | EncodeAsIs;
};

const PublicKey_order: (keyof PublicKey_Decoded)[] = ['payload'];
const PublicKey_decoders = {
    payload: Array_u8_32_decode,
};
const PublicKey_encoders = {
    payload: makeEncoderAsIsRespectable(Array_u8_32_encode),
};

export function PublicKey_decode(bytes: Uint8Array): DecodeResult<PublicKey_Decoded> {
    return decodeStruct(bytes, PublicKey_decoders, PublicKey_order);
}

export function PublicKey_encode(encodable: PublicKey_Encodable): Uint8Array {
    return encodeStruct(encodable, PublicKey_encoders, PublicKey_order);
}
