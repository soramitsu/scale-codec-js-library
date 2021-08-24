import {
    Encode,
    Decode,
    encodeStruct,
    decodeStruct,
    encodeMap,
    decodeMap,
    encodeSet,
    decodeSet,
    encodeTuple,
    decodeTuple,
    encodeVec,
    decodeVec,
    encodeArray,
    decodeArray,
    DecodeResult,
    BigIntCodecOptions,
    encodeBigInt,
    decodeBigInt,
    encodeEnum,
    decodeEnum,
    EncodeEnumParams,
    DecodeEnumParams,
} from '@scale-codec/core';
import { Enum, Option } from '@scale-codec/enum';
import { assert } from '@scale-codec/util';
import { wrapSkippableEncode, EncodeSkippable } from './skippable';
import JSBI from 'jsbi';
import { Codec } from './types';

export type StructFieldsCodec<D, E> = {
    [K in keyof D & keyof E]: Codec<D[K], E[K]>;
};

export type StructEncodable<T> = {
    [K in keyof T]: T[K] | EncodeSkippable;
};

export function structCodec<D, E>(
    fields: StructFieldsCodec<D, E>,
    order: (keyof D & keyof E)[],
): Codec<D, StructEncodable<E>> {
    const encoders: Record<string, Encode<any>> = {};
    const decoders: Record<string, Decode<any>> = {};

    for (const field of Object.keys(fields)) {
        const codec = (fields as Record<string, Codec<any, any>>)[field];
        encoders[field] = wrapSkippableEncode(codec.encode);
        decoders[field] = codec.decode;
    }

    return {
        encode: (v) => encodeStruct(v, encoders as any, order as any),
        decode: (b) => decodeStruct(b, decoders as any, order as any),
    };
}

export function mapCodec<KDe, KEn, VDe, VEn>(
    key: Codec<KDe, KEn>,
    val: Codec<VDe, VEn>,
): Codec<Map<KDe, VDe>, Map<KEn | EncodeSkippable, VEn | EncodeSkippable>> {
    const keyEncoder: Encode<KEn | EncodeSkippable> = wrapSkippableEncode(key.encode);
    const valEncoder: Encode<VEn | EncodeSkippable> = wrapSkippableEncode(val.encode);
    const keyDecoder: Decode<KDe> = key.decode;
    const valDecoder: Decode<VDe> = val.decode;

    return {
        encode: (v) => encodeMap(v, keyEncoder, valEncoder),
        decode: (b) => decodeMap(b, keyDecoder, valDecoder),
    };
}

export function setCodec<D, E>(entryCodec: Codec<D, E>): Codec<Set<D>, Set<E | EncodeSkippable>> {
    const [encode, decode] = [wrapSkippableEncode(entryCodec.encode), entryCodec.decode];

    return {
        encode: (v) => encodeSet(v, encode),
        decode: (b) => decodeSet(b, decode),
    };
}

export type TupleWithSkippables<Tuple extends any[]> = Tuple extends [infer Head, ...infer Tail]
    ? [Head | EncodeSkippable, ...TupleWithSkippables<Tail>]
    : [];

/**
 * TODO what is more efficient - to unwrap all operations like mapping and extracting encoders/decoders
 * from codecs, or to minimize code size? Or make it optionally? Perf
 */
export function tupleCodec<D extends any[], E extends any[]>(
    /**
     * Type-safety responsibility on user
     */
    codecs: Codec<any, any>[],
): Codec<D, TupleWithSkippables<E>> {
    const encoders: Encode<any>[] = [];
    const decoders: Decode<any>[] = [];

    codecs.forEach(({ encode, decode }) => {
        encoders.push(wrapSkippableEncode(encode));
        decoders.push(decode);
    });

    return {
        encode: (v) => encodeTuple(v, encoders as any),
        decode: (b) => decodeTuple(b, decoders as any),
    };
}

export type CodecOfSomeArray<D, E> = Codec<D[], (E | EncodeSkippable)[]>;

export function vecCodec<D, E>(itemCodec: Codec<D, E>): CodecOfSomeArray<D, E> {
    const [encode, decode] = [wrapSkippableEncode(itemCodec.encode), itemCodec.decode];

    return {
        encode: (v) => encodeVec(v, encode),
        decode: (b) => decodeVec(b, decode),
    };
}

export function arrayCodec<D, E>(itemCodec: Codec<D, E>, len: number): CodecOfSomeArray<D, E> {
    const [encode, decode] = [wrapSkippableEncode(itemCodec.encode), itemCodec.decode];

    return {
        encode: (v) => encodeArray(v, encode, len),
        decode: (b) => decodeArray(b, decode, len),
    };
}

export function bytesArrayCodec(len: number): Codec<Uint8Array> {
    return {
        encode: (decoded) => {
            assert(decoded.length === len, () => `expected exactly ${len} bytes, found: ${decoded.length}`);
            return decoded;
        },
        decode: (encoded) => [encoded.subarray(0, len), len],
    };
}

function mapBigIntDecodeResultToNum([bi, count]: DecodeResult<JSBI>): DecodeResult<number> {
    return [JSBI.toNumber(bi), count];
}

export function intCodec(opts: BigIntCodecOptions): Codec<number, number> {
    return {
        encode: (v) => encodeBigInt(JSBI.BigInt(v), opts),
        decode: (b) => mapBigIntDecodeResultToNum(decodeBigInt(b, opts)),
    };
}

export function bigintCodec(opts: BigIntCodecOptions): Codec<JSBI, JSBI> {
    return {
        encode: (v) => encodeBigInt(v, opts),
        decode: (b) => decodeBigInt(b, opts),
    };
}

// should be tested with higher attention!
export type EnumCodecSchema = Record<string, { d: number; codec?: Codec<any, any> }>;

export function enumCodec<DefPure, DefEncodable>(params: EnumCodecSchema): Codec<Enum<DefPure>, Enum<DefEncodable>> {
    const encodeParams: EncodeEnumParams = {};
    const decodeParams: DecodeEnumParams = {};

    for (const [v, { d, codec }] of Object.entries(params)) {
        if (codec) {
            const { encode, decode } = codec;

            encodeParams[v] = { d, encode: wrapSkippableEncode(encode) };
            decodeParams[d] = { v, decode };
        } else {
            encodeParams[v] = { d };
            decodeParams[d] = { v };
        }
    }

    return {
        encode: (v) => encodeEnum(v, encodeParams),
        decode: (b) => decodeEnum(b, decodeParams),
    };
}

export function optionCodec<D, E>(some: Codec<D, E>): Codec<Option<D>, Option<E | EncodeSkippable>> {
    return enumCodec({
        None: { d: 0 },
        Some: { d: 1, codec: some },
    });
}
