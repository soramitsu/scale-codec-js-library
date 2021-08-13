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
    EnumSchema,
    EnumCodec,
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
    StructEncoders,
    StructDecoders,
    encodeArray,
    decodeArray,
    encodeBool,
    decodeBool,
    encodeStr,
    BigIntCodecOptions,
    EmptyVariants,
} from '@scale-codec/core';
import { EncodeSkippable, respectSkip, wrapSkippableEncode } from './skip';
import { EnumDefEncodable, respectSkippableStructFields, StructEncodable, StructEncodersSkippable } from './encodables';
import JSBI from 'jsbi';

// type DefinitionInNamespace<D, E> = {
//     encode: Encode<E>;
//     decode: Decode<D>;
// };

function _bindThisCodecMethods(self: Codec<any, any>) {
    self.encode = self.encode.bind(self);
    self.decode = self.decode.bind(self);
}

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

class SetCodec<D, E> implements Codec<Set<D>, Set<E | EncodeSkippable>> {
    private encoder: Encode<E | EncodeSkippable>;
    private decoder: Decode<D>;

    public constructor(entryCodec: Codec<D, E>) {
        this.encoder = wrapSkippableEncode(entryCodec.encode);
        this.decoder = entryCodec.decode;

        _bindThisCodecMethods(this);
    }

    public encode(set: Set<E | EncodeSkippable>): Uint8Array {
        return encodeSet(set, this.encoder);
    }

    public decode(bytes: Uint8Array): DecodeResult<Set<D>> {
        return decodeSet(bytes, this.decoder);
    }
}

type TupleWithSkippables<Tuple extends any[]> = Tuple extends [infer Head, ...infer Tail]
    ? [Head | EncodeSkippable, ...TupleWithSkippables<Tail>]
    : [];

class TupleCodec<D extends any[], E extends any[]> implements Codec<D, TupleWithSkippables<E>> {
    private encoders: Encode<any>[];
    private decoders: Decode<any>[];

    public constructor(encoders: TupleEncoders<E>, decoders: TupleDecoders<D>) {
        [this.encoders, this.decoders] = [encoders.map(wrapSkippableEncode), decoders];

        _bindThisCodecMethods(this);
    }

    public encode(tuple: TupleWithSkippables<E>): Uint8Array {
        return encodeTuple(tuple, this.encoders as any);
    }

    public decode(bytes: Uint8Array): DecodeResult<D> {
        return decodeTuple(bytes, this.decoders as any);
    }
}

class VecCodec<D, E> implements Codec<D[], (E | EncodeSkippable)[]> {
    private encoder: Encode<E | EncodeSkippable>;
    private decoder: Decode<D>;

    public constructor(itemCodec: Codec<D, E>) {
        [this.encoder, this.decoder] = [wrapSkippableEncode(itemCodec.encode), itemCodec.decode];

        _bindThisCodecMethods(this);
    }

    public encode(arr: (E | EncodeSkippable)[]): Uint8Array {
        return encodeVec(arr, this.encoder);
    }

    public decode(bytes: Uint8Array): DecodeResult<D[]> {
        return decodeVec(bytes, this.decoder);
    }
}

class ArrayCodec<D, E> implements Codec<D[], (E | EncodeSkippable)[]> {
    public readonly encode: Encode<(E | EncodeSkippable)[]>;
    public readonly decode: Decode<D[]>;

    public constructor(itemCodec: Codec<D, E>, len: number) {
        const [encode, decode] = [wrapSkippableEncode(itemCodec.encode), itemCodec.decode];
        // const encode = wrapSkippableEncode(itemCodec.encode);
        // const

        this.encode = (arr) => encodeArray(arr, encode, len);
        this.decode = (bytes) => decodeArray(bytes, decode, len);
    }
}

function _intCodec(opts: BigIntCodecOptions): Codec<number, number | EncodeSkippable> {}

function _bigintCodec(opts: BigIntCodecOptions): Codec<JSBI, JSBI | EncodeSkippable> {}

// should be tested with higher attention!
type EnumCodecEncodableParams = Record<string, { d: number; codec?: Codec<any, any> }>;

function _enumCodec<DefPure, DefEncodable>(
    params: EnumCodecEncodableParams,
): Codec<Enum<DefPure>, Enum<DefEncodable>> {}

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

        export const { encode, decode } = _intCodec({
            bits: 8,
            signed: false,
            endianness: 'le',
        });
    }

    export namespace i64 {
        export type Pure = JSBI;
        export type Encodable = number | EncodeSkippable;

        export const { encode, decode } = _bigintCodec({
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

        export const { encode, decode } = new SetCodec(Example.Person);
    }

    // Tuple sample
    export namespace Tuple_Map_u8_Person_Set_Person {
        export type Decoded = [Example.Map_u8_Person.Pure, Example.Set_Person.Pure];
        type TupleEncodables = [Example.Map_u8_Person.Encodable, Example.Set_Person.Encodable];
        export type Encodable = TupleWithSkippables<TupleEncodables>;

        export const { encode, decode } = new TupleCodec<Decoded, TupleEncodables>(
            [Example.Map_u8_Person.encode, Example.Set_Person.encode],
            [Example.Map_u8_Person.decode, Example.Set_Person.decode],
        );
    }

    // Vec sample
    export namespace Vec_Person {
        export type Decoded = Example.Person.Pure[];
        export type Encodable = (Decoded | EncodeSkippable)[];

        export const { encode, decode } = new VecCodec(Example.Person);
    }

    // Array sample
    export namespace Array_str {
        export type Pure = Example.str.Pure[];
        export type Encodable = (Example.str.Encodable | EncodeSkippable)[];

        export const LEN = 32;

        export const { encode, decode } = new ArrayCodec(Example.str, LEN);
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

        export const { encode, decode } = _enumCodec<DefPure, DefEncodable>({
            Received: {
                d: 0,
            },
            Message: {
                d: 0,
                codec: Example.str,
            },
        });
    }
}
