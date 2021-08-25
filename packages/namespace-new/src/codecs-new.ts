import { Decode, decodeTuple, decodeVec, Encode, encodeTuple, encodeVec, TupleDecoders, TupleEncoders } from "@scale-codec/core";
import { EncodeSkippable, wrapSkippableEncode } from "./skippable";

export function createVecEncode<T>(itemEncode: Encode<T>): Encode<(T | EncodeSkippable)[]> {
    const wrapped = wrapSkippableEncode(itemEncode);
    return (v) => encodeVec(v, wrapped)
}

export function createVecDecode<T>(itemDecode: Decode<T>): Decode<T[]> {
    return (b) => decodeVec(b, itemDecode)
}

export type TupleWithSkippables<Tuple extends any[]> = Tuple extends [infer Head, ...infer Tail]
    ? [Head | EncodeSkippable, ...TupleWithSkippables<Tail>]
    : [];

export function createTupleEncode(encoders: Encode<any>[]): Encode<any[]> {
    const wrapped = encoders.map(wrapSkippableEncode);
    return (v) => encodeTuple(v, wrapped as any);
}

export function createTupleDecode(decoders: Decode<any>[]): Decode<any[]> {
    return (b) => decodeTuple(b, decoders as any);
}