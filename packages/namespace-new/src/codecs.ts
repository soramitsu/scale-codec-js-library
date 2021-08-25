import {
    Decode,
    decodeArray,
    decodeEnum,
    DecodeEnumParams,
    decodeMap,
    decodeSet,
    decodeStruct,
    decodeTuple,
    decodeVec,
    Encode,
    encodeArray,
    encodeEnum,
    EncodeEnumParams,
    encodeMap,
    encodeSet,
    encodeStruct,
    encodeTuple,
    encodeVec,
    Enum,
    Option,
    StructDecoders,
    StructEncoders,
} from '@scale-codec/core';
import { assert } from '@scale-codec/util';
import { EncodeSkippable, wrapSkippableEncode } from './skippable';

// map

export function createMapEncode<K, V>(
    key: Encode<K>,
    value: Encode<V>,
): Encode<Map<K | EncodeSkippable, V | EncodeSkippable>> {
    const k = wrapSkippableEncode(key);
    const v = wrapSkippableEncode(value);
    return (map) => encodeMap(map, k, v);
}

export function createMapDecode<K, V>(key: Decode<K>, value: Decode<V>): Decode<Map<K, V>> {
    return (b) => decodeMap(b, key, value);
}

// set

export function createSetEncode<T>(inner: Encode<T>): Encode<Set<T | EncodeSkippable>> {
    const encode = wrapSkippableEncode(inner);
    return (set) => encodeSet(set, encode);
}

export function createSetDecode<T>(inner: Decode<T>): Decode<Set<T>> {
    return (b) => decodeSet(b, inner);
}

// vec

export function createVecEncode<T>(itemEncode: Encode<T>): Encode<(T | EncodeSkippable)[]> {
    const wrapped = wrapSkippableEncode(itemEncode);
    return (v) => encodeVec(v, wrapped);
}

export function createVecDecode<T>(itemDecode: Decode<T>): Decode<T[]> {
    return (b) => decodeVec(b, itemDecode);
}

// tuple - not type safe!

export function createTupleEncode(encoders: Encode<any>[]): Encode<any[]> {
    const wrapped = encoders.map(wrapSkippableEncode);
    return (v) => encodeTuple(v, wrapped as any);
}

export function createTupleDecode(decoders: Decode<any>[]): Decode<any[]> {
    return (b) => decodeTuple(b, decoders as any);
}

// array

export function createArrayEncode<T>(itemEncode: Encode<T>, len: number): Encode<(T | EncodeSkippable)[]> {
    const encode = wrapSkippableEncode(itemEncode);
    return (arr) => encodeArray(arr, encode, len);
}

export function createArrayDecode<T>(itemDecode: Decode<T>, len: number): Decode<T[]> {
    return (b) => decodeArray(b, itemDecode, len);
}

// bytes array

export function createBytesArrayEncode(len: number): Encode<Uint8Array> {
    return (bytes) => {
        assert(bytes.length === len, () => `expected exactly ${len} bytes, found: ${bytes.length}`);
        // copy to prevent unexpected mutations
        return bytes.slice();
    };
}

export function createBytesArrayDecode(len: number): Decode<Uint8Array> {
    return (bytes) => [
        // slice to prevent unexpected source mutations
        bytes.slice(0, len),
        len,
    ];
}

// struct

type StructWithSkippableFields<T> = {
    [K in keyof T]: T[K] | EncodeSkippable;
};

export function createStructEncode<T>(
    encoders: StructEncoders<T>,
    order: (keyof T & string)[],
): Encode<StructWithSkippableFields<T>> {
    const encodersWrapped: StructEncoders<StructWithSkippableFields<T>> = {} as any;

    for (const prop of Object.keys(encoders) as (keyof T & string)[]) {
        encodersWrapped[prop] = wrapSkippableEncode(encoders[prop]);
    }

    return (struct) => encodeStruct(struct, encodersWrapped, order);
}

export function createStructDecode<T>(decoders: StructDecoders<T>, order: (keyof T & string)[]): Decode<T> {
    return (bytes) => decodeStruct(bytes, decoders, order);
}

// enum - not type safe!

export function createEnumEncode(encodersMap: EncodeEnumParams): Encode<Enum<any>> {
    return (en) => encodeEnum(en, encodersMap);
}

export function createEnumDecode(decodersMap: DecodeEnumParams): Decode<Enum<any>> {
    return (b) => decodeEnum(b, decodersMap);
}

// Option<T>

export function createOptionEncode<T>(encode: Encode<T>): Encode<Option<T>> {
    return createEnumEncode({
        None: { d: 0 },
        Some: { d: 1, encode },
    });
}

export function createOptionDecode<T>(decode: Decode<T>): Decode<Option<T>> {
    return createEnumDecode({
        0: { v: 'None' },
        1: { v: 'Some', decode },
    });
}
