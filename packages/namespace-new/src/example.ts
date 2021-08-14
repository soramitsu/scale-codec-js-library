/* eslint-disable @typescript-eslint/no-namespace */

/*

Let's build such namespace

str - string
u8 - number
Person - struct { name: str; age: u8; }
Event - enum { Received, Message(str) }
Map<u8, Person>

*/

import {
    encodeStrCompact,
    decodeStrCompact,
    DecodeResult,
    encodeBigInt,
    decodeBigInt,
    encodeStruct,
    decodeStruct,
    Valuable,
    Enum,
    Encode,
    Decode,
    Codec,
    encodeMap,
    decodeMap,
    encodeSet,
    decodeSet,
    encodeTuple,
    decodeTuple,
    TupleDecoders,
    TupleEncoders,
    encodeVec,
    decodeVec,
    encodeArray,
    decodeArray,
    encodeBool,
    decodeBool,
    BigIntCodecOptions,
} from '@scale-codec/core';
import { concatUint8Arrays } from '@scale-codec/util';
import { EncodeSkippable, respectSkip, wrapSkippableEncode } from './skip';
import { EnumDefEncodable, StructEncodable } from './encodables';
import JSBI from 'jsbi';
import mapObj from 'map-obj';

// type DefinitionInNamespace<D, E> = {
//     encode: Encode<E>;
//     decode: Decode<D>;
// };

// function _bindThisCodecMethods(self: Codec<any, any>) {
//     self.encode = self.encode.bind(self);
//     self.decode = self.decode.bind(self);
// }

type StructFieldsCodec<D, E> = {
    [K in keyof D & keyof E]: Codec<D[K], E[K]>;
};

function structCodec<D, E>(
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

function mapCodec<KDe, KEn, VDe, VEn>(
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

function setCodec<D, E>(entryCodec: Codec<D, E>): Codec<Set<D>, Set<E | EncodeSkippable>> {
    const [encode, decode] = [wrapSkippableEncode(entryCodec.encode), entryCodec.decode];

    return {
        encode: (v) => encodeSet(v, encode),
        decode: (b) => decodeSet(b, decode),
    };
}

type TupleWithSkippables<Tuple extends any[]> = Tuple extends [infer Head, ...infer Tail]
    ? [Head | EncodeSkippable, ...TupleWithSkippables<Tail>]
    : [];

/**
 * TODO what is more efficient - to unwrap all operations like mapping and extracting encoders/decoders
 * from codecs, or to minimize code size? Or make it optionally? Perf
 */
function tupleCodec<D extends any[], E extends any[]>(
    encoders: TupleEncoders<E>,
    decoders: TupleDecoders<D>,
): Codec<D, TupleWithSkippables<E>> {
    const encodersWrapped = encoders.map(wrapSkippableEncode);

    return {
        encode: (v) => encodeTuple(v, encodersWrapped as any),
        decode: (b) => decodeTuple(b, decoders),
    };
}

type CodecOfSomeArray<D, E> = Codec<D[], (E | EncodeSkippable)[]>;

function vecCodec<D, E>(itemCodec: Codec<D, E>): CodecOfSomeArray<D, E> {
    const [encode, decode] = [wrapSkippableEncode(itemCodec.encode), itemCodec.decode];

    return {
        encode: (v) => encodeVec(v, encode),
        decode: (b) => decodeVec(b, decode),
    };
}

function arrayCodec<D, E>(itemCodec: Codec<D, E>, len: number): CodecOfSomeArray<D, E> {
    const [encode, decode] = [wrapSkippableEncode(itemCodec.encode), itemCodec.decode];

    return {
        encode: (v) => encodeArray(v, encode, len),
        decode: (b) => decodeArray(b, decode, len),
    };
}

function mapBigIntDecodeResultToNum([bi, count]: DecodeResult<JSBI>): DecodeResult<number> {
    return [JSBI.toNumber(bi), count];
}

function intCodec(opts: BigIntCodecOptions): Codec<number, number | EncodeSkippable> {
    return {
        encode: wrapSkippableEncode((v) => encodeBigInt(JSBI.BigInt(v), opts)),
        decode: (b) => mapBigIntDecodeResultToNum(decodeBigInt(b, opts)),
    };
}

function bigintCodec(opts: BigIntCodecOptions): Codec<JSBI, JSBI | EncodeSkippable> {
    return {
        encode: wrapSkippableEncode((v) => encodeBigInt(v, opts)),
        decode: (b) => decodeBigInt(b, opts),
    };
}

// should be tested with higher attention!
type EnumCodecSchema = Record<string, { d: number; codec?: Codec<any, any> }>;

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

function enumCodec<DefPure, DefEncodable>(params: EnumCodecSchema): Codec<Enum<DefPure>, Enum<DefEncodable>> {
    return new EnumCodec(params);
}

export namespace Example {
    // primitives start

    /**
     * No zero-cost abstractions in JS :(
     */
    export namespace Void {
        export type Pure = null;
        export type Encodable = null;

        export function encode(val?: null): Uint8Array {
            return new Uint8Array();
        }

        export function decode(bytes?: Uint8Array): DecodeResult<null> {
            return [null, 0];
        }
    }

    export namespace str {
        export type Pure = string;
        export type Encodable = string | EncodeSkippable;

        export const encode = wrapSkippableEncode(encodeStrCompact);
        export const decode = decodeStrCompact;
    }

    export namespace u8 {
        export type Pure = number;
        export type Encodable = number | EncodeSkippable;

        export const { encode, decode } = intCodec({
            bits: 8,
            signed: false,
            endianness: 'le',
        });
    }

    export namespace i64 {
        export type Pure = JSBI;
        export type Encodable = number | EncodeSkippable;

        export const { encode, decode } = bigintCodec({
            bits: 64,
            signed: true,
            endianness: 'le',
        });
    }

    export namespace BytesVec {
        export type Pure = Uint8Array;
        export type Encodable = Uint8Array;
    }

    export namespace bool {
        export type Pure = boolean;
        export type Encodable = boolean | EncodeSkippable;

        export const encode = wrapSkippableEncode(encodeBool);
        export const decode = decodeBool;
    }

    // primitives end

    // struct sample
    export namespace Person {
        export type Pure = {
            name: Example.str.Pure;
            age: Example.u8.Pure;
        };
        export type Encodable = StructEncodable<EncodableEntries>;
        type EncodableEntries = {
            name: Example.str.Encodable;
            age: Example.u8.Encodable;
        };

        const ORDER: (keyof Pure)[] = ['name', 'age'];

        export const { encode, decode } = structCodec<Pure, EncodableEntries>(
            {
                name: Example.str,
                age: Example.u8,
            },
            ORDER,
        );
    }

    // Map sample
    export namespace Map_u8_Person {
        export type Pure = Map<Example.u8.Pure, Example.Person.Pure>;
        export type Encodable = Map<Example.u8.Encodable | EncodeSkippable, Example.Person.Encodable | EncodeSkippable>;

        export const { encode, decode } = mapCodec(Example.u8, Example.Person);
    }

    // Set sample
    export namespace Set_Person {
        export type Pure = Set<Example.Person.Pure>;
        export type Encodable = Set<Example.Person.Encodable | EncodeSkippable>;

        export const { encode, decode } = setCodec(Example.Person);
    }

    // Tuple sample
    export namespace Tuple_Map_u8_Person_Set_Person {
        export type Decoded = [Example.Map_u8_Person.Pure, Example.Set_Person.Pure];
        type TupleEncodables = [Example.Map_u8_Person.Encodable, Example.Set_Person.Encodable];
        export type Encodable = TupleWithSkippables<TupleEncodables>;

        export const { encode, decode } = tupleCodec<Decoded, TupleEncodables>(
            [Example.Map_u8_Person.encode, Example.Set_Person.encode],
            [Example.Map_u8_Person.decode, Example.Set_Person.decode],
        );
    }

    // Vec sample
    export namespace Vec_Person {
        export type Decoded = Example.Person.Pure[];
        export type Encodable = (Decoded | EncodeSkippable)[];

        export const { encode, decode } = vecCodec(Example.Person);
    }

    // Array sample
    export namespace Array_str {
        export type Pure = Example.str.Pure[];
        export type Encodable = (Example.str.Encodable | EncodeSkippable)[];

        export const LEN = 32;

        export const { encode, decode } = arrayCodec(Example.str, LEN);
    }

    // Bytes array example
    export namespace BytesArray {
        export type Pure = Uint8Array;
        export type Encodable = Uint8Array;

        export const LEN = 32;
    }

    // Enum sample
    export namespace Event {
        export type DefPure = {
            Received: null;
            Message: Valuable<Example.str.Pure>;
        };
        export type DefEncodable = EnumDefEncodable<{
            Received: null;
            Message: Valuable<Example.str.Encodable>;
        }>;

        export type Pure = Enum<DefPure>;
        export type Encodable = Enum<DefEncodable>;

        // for convenient variants creation
        // TODO make proxy with empty variants as simple getters
        export namespace Vars {
            let _received_cached: undefined | Encodable;
            export const Received = (): Encodable => {
                // cache once created enum
                if (!_received_cached) {
                    _received_cached = Object.freeze(Enum.create<DefEncodable, 'Received'>('Received'));
                }
                return _received_cached;
            };

            export const Message = (val: Example.str.Pure | EncodeSkippable): Encodable => {
                return Enum.create('Message', val);
            };
        }

        export const { encode, decode } = enumCodec<DefPure, DefEncodable>({
            Received: {
                d: 0,
            },
            Message: {
                d: 1,
                codec: Example.str,
            },
        });
    }
}
