import {
    Codec,
    Encode,
    Decode,
    encodeStruct,
    decodeStruct,
    encodeMap,
    decodeMap,
    encodeSet,
    decodeSet,
    TupleEncoders,
    TupleDecoders,
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
    decodeCompact,
    encodeCompact,
    decodeStrCompact,
    encodeStrCompact,
    decodeBool,
    encodeBool,
} from '@scale-codec/core';
import { Enum, Valuable } from '@scale-codec/enum';
import { assert, concatUint8Arrays } from '@scale-codec/util';
import { wrapSkippableEncode, EncodeSkippable, respectSkip } from './skippable';
import JSBI from 'jsbi';
import mapObj from 'map-obj';

export const STR_CODEC: Codec<string> = {
    encode: encodeStrCompact,
    decode: decodeStrCompact,
};

export const BOOL_CODEC: Codec<boolean> = {
    encode: encodeBool,
    decode: decodeBool,
};

/**
 * No zero-cost abstractions in JS :(
 */
export const VOID_CODEC: Codec<null> = {
    encode(val?: null): Uint8Array {
        return new Uint8Array();
    },
    decode(bytes?: Uint8Array): DecodeResult<null> {
        return [null, 0];
    },
};

export const BYTES_VECTOR_CODEC: Codec<Uint8Array> = {
    encode: (decoded) => {
        return concatUint8Arrays([encodeCompact(JSBI.BigInt(decoded.length)), decoded]);
    },
    decode: (encoded) => {
        const [lenBN, offset] = decodeCompact(encoded);
        const len = JSBI.toNumber(lenBN);
        return [encoded.subarray(offset, offset + len), offset + len];
    },
};

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
    encoders: TupleEncoders<E>,
    decoders: TupleDecoders<D>,
): Codec<D, TupleWithSkippables<E>> {
    const encodersWrapped = encoders.map(wrapSkippableEncode);

    return {
        encode: (v) => encodeTuple(v, encodersWrapped as any),
        decode: (b) => decodeTuple(b, decoders),
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

export type EnumDefEncodable<Def> = {
    [K in keyof Def]: Def[K] extends Valuable<infer V> ? Valuable<V | EncodeSkippable> : Def[K];
};

export class EnumCodec<DefD, DefE> implements Codec<Enum<DefD>, Enum<DefE>> {
    private variantMap: EnumCodecSchema;
    private discriminantMap: Record<
        number,
        {
            variant: string;
            codec?: Codec<any, any>;
        }
    >;

    public constructor(schema: EnumCodecSchema) {
        this.variantMap = schema;
        this.discriminantMap = mapObj(schema, (variant, { d, codec }) => [d as any, { variant, codec }]);

        this.encode = this.encode.bind(this);
        this.decode = this.decode.bind(this);
    }

    public encode(val: Enum<DefE>): Uint8Array {
        const { variant, content } = val as {
            variant: string;
            content: null | { value: unknown };
        };
        const schemaInfo = this.variantMap[variant];
        const discriminant = schemaInfo.d;
        const encode = schemaInfo.codec?.encode;

        const arrs: Uint8Array[] = [new Uint8Array([discriminant])];
        if (encode) {
            if (!content) throw new Error(`Codec for variant "${variant}" defined, but there is no content`);
            arrs.push(respectSkip(content.value, encode));
        }

        return concatUint8Arrays(arrs);
    }

    public decode(bytes: Uint8Array): DecodeResult<Enum<DefD>> {
        const DISCRIMINANT_BYTES_COUNT = 1;
        const discriminant = bytes[0];
        const schemaInfo = this.discriminantMap[discriminant];
        const [variant, decode] = [schemaInfo.variant, schemaInfo.codec?.decode];

        if (decode) {
            const [decoded, decodedLen] = decode(bytes.subarray(1));

            return [Enum.create<any, any>(variant, decoded as any), DISCRIMINANT_BYTES_COUNT + decodedLen];
        }

        return [Enum.create<any, any>(variant), DISCRIMINANT_BYTES_COUNT];
    }
}

export function enumCodec<DefPure, DefEncodable>(params: EnumCodecSchema): Codec<Enum<DefPure>, Enum<DefEncodable>> {
    return new EnumCodec(params);
}
