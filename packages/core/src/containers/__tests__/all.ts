/* eslint-disable max-nested-callbacks */

import { yieldNTimes } from '@scale-codec/util';
import { Enum, Option, Valuable } from '@scale-codec/enum';
import JSBI from 'jsbi';
import {
    encodeBool,
    decodeBool,
    encodeBigInt,
    decodeBigInt,
    encodeStrCompact,
    decodeStrCompact,
    bigIntCodec,
} from '../../primitives';
import { Encode, Decode, DecodeResult } from '../../types';
import { encodeVec, decodeVec } from '../vec';
import { EnumSchema, EnumCodec, OptionBoolCodec } from '../enum';
import { encodeMap, decodeMap } from '../map';
import { encodeStruct, decodeStruct } from '../struct';
import { encodeTuple, decodeTuple } from '../tuple';
import { decodeArray, encodeArray } from '../array';
import { decodeSet, encodeSet } from '../set';

function hexifyBytes(v: Uint8Array): string {
    return [...v].map((x) => x.toString(16).padStart(2, '0')).join(' ');
}

function prettyHexToBytes(hex: string): Uint8Array {
    return Uint8Array.from(hex.split(' ').map((x) => parseInt(x, 16)));
}

interface OptionDef<T> {
    None: null;
    Some: Valuable<T>;
}

// type a = EnumCodecs<Option<T>>;

function createOptionSchema<T>(
    encode: Encode<T>,
    decode: Decode<T>,
): { schema: EnumSchema<OptionDef<T>>; codec: EnumCodec<OptionDef<T>> } {
    const schema = new EnumSchema<OptionDef<T>>({
        None: { discriminant: 0 },
        Some: { discriminant: 1 },
    });

    const codec = schema.createCodec({
        Some: { encode, decode },
    });

    return { schema, codec };
}

describe('Vec', () => {
    // https://github.com/paritytech/parity-scale-codec/blob/166d748abc1e48d74c528e2456fefe6f3c48f256/src/codec.rs#L1320
    describe('vec of u8 encoded as expected', () => {
        const numbers = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34].map((x) => JSBI.BigInt(x));
        const hex = '28 00 01 01 02 03 05 08 0d 15 22';

        it('encode', () => {
            const numEncode = (v: JSBI) => encodeBigInt(v, { bits: 8, signed: false, endianness: 'le' });

            const encoded = encodeVec(numbers, numEncode);

            expect(hexifyBytes(encoded)).toEqual(hex);
        });

        it('decode', () => {
            const numDecode = (b: Uint8Array): [JSBI, number] =>
                decodeBigInt(b, { bits: 8, signed: false, endianness: 'le' });
            const encoded = prettyHexToBytes(hex);

            const [decoded, len] = decodeVec(encoded, numDecode);

            expect(decoded).toEqual(numbers);
            expect(len).toEqual(encoded.length);
        });
    });

    // https://github.com/paritytech/parity-scale-codec/blob/166d748abc1e48d74c528e2456fefe6f3c48f256/src/codec.rs#L1328
    it('vec of i16 encoded as expected', () => {
        const numbers = [0, 1, -1, 2, -2, 3, -3].map((x) => JSBI.BigInt(x));
        const hex = '1c 00 00 01 00 ff ff 02 00 fe ff 03 00 fd ff';

        const numEncode = (v: JSBI) => encodeBigInt(v, { bits: 16, signed: true, endianness: 'le' });
        const numDecode = (b: Uint8Array): [JSBI, number] =>
            decodeBigInt(b, { bits: 16, signed: true, endianness: 'le' });

        const encoded = encodeVec(numbers, numEncode);
        expect(hexifyBytes(encoded)).toEqual(hex);

        const [decoded, len] = decodeVec(encoded, numDecode);
        expect(decoded).toEqual(numbers);
        expect(len).toEqual(encoded.length);
    });

    it('vec encodes only necessary', () => {
        const actualVecHex = '28 00 01 01 02 03 05 08 0d 15 22';
        const actualVecBytes = actualVecHex.split(' ').map((x) => parseInt(x, 16));
        const actualVecBytesLen = actualVecBytes.length;

        const encoded = Uint8Array.from([
            ...actualVecBytes,
            // some noise
            5,
            1,
            6,
            78,
            98,
            9,
            1,
            2,
            3,
            4,
        ]);

        const [_decoded, len] = decodeVec(encoded, (bytes) =>
            decodeBigInt(bytes, { bits: 8, endianness: 'le', signed: false }),
        );

        expect(len).toEqual(actualVecBytesLen);
    });

    // https://github.com/paritytech/parity-scale-codec/blob/master/src/codec.rs#L1387
    it('vec of string encoded as expected', () => {
        const strings = ['Hamlet', 'Война и мир', '三国演义', 'أَلْف لَيْلَة وَلَيْلَة‎'];
        const hex = `\
10 18 48 61 6d 6c 65 74 50 d0 92 d0 be d0 b9 d0 bd d0 b0 20 d0 \
b8 20 d0 bc d0 b8 d1 80 30 e4 b8 89 e5 9b bd e6 bc 94 e4 b9 89 bc d8 a3 d9 8e d9 84 d9 92 \
d9 81 20 d9 84 d9 8e d9 8a d9 92 d9 84 d9 8e d8 a9 20 d9 88 d9 8e d9 84 d9 8e d9 8a d9 92 \
d9 84 d9 8e d8 a9 e2 80 8e`;

        const encode = (v: string) => encodeStrCompact(v);
        const decode = (b: Uint8Array) => decodeStrCompact(b);

        const encoded = encodeVec(strings, encode);
        expect(hexifyBytes(encoded)).toEqual(hex);

        const [decoded, len] = decodeVec(encoded, decode);
        expect(decoded).toEqual(strings);
        expect(len).toEqual(encoded.length);
    });

    // https://github.com/paritytech/parity-scale-codec/blob/master/src/codec.rs#L1336
    describe('vec of option int encoded as expected', () => {
        const { codec } = createOptionSchema<JSBI>(
            (v) => encodeBigInt(v, { bits: 8, signed: true, endianness: 'le' }),
            (b) => decodeBigInt(b, { bits: 8, signed: true, endianness: 'le' }),
        );
        const vec: Enum<OptionDef<JSBI>>[] = [
            Enum.create('Some', JSBI.BigInt(1)),
            Enum.create('Some', JSBI.BigInt(-1)),
            Enum.create('None'),
        ];
        const hex = '0c 01 01 01 ff 00';

        it('encode', () => {
            expect(hexifyBytes(encodeVec(vec, codec.encode))).toEqual(hex);
        });

        it('decode', () => {
            expect(decodeVec(prettyHexToBytes(hex), codec.decode)).toEqual([vec, 6]);
        });
    });

    // https://github.com/paritytech/parity-scale-codec/blob/master/src/codec.rs#L1344
    // it is a special type, OptionBool. see related Rust's source code
    // it encodes not like default enum
    describe('vec of option bool encoded as expected', () => {
        const vec: Enum<OptionDef<boolean>>[] = [
            Enum.create('Some', true),
            Enum.create('Some', false),
            Enum.create('None'),
        ];
        const hex = '0c 01 02 00';

        it('encode', () => {
            expect(
                encodeVec(
                    vec,
                    (item) =>
                        new Uint8Array([
                            item.match({
                                None: () => 0,
                                Some: (val) => (val ? 1 : 2),
                            }),
                        ]),
                ),
            ).toEqual(prettyHexToBytes(hex));
        });

        it('decode', () => {
            expect(
                decodeVec(prettyHexToBytes(hex), (bytes): DecodeResult<Enum<OptionDef<boolean>>> => {
                    switch (bytes[0]) {
                        case 0:
                            return [Enum.create('None'), 1];
                        case 1:
                            return [Enum.create('Some', true), 1];
                        case 2:
                            return [Enum.create('Some', false), 1];
                        default:
                            throw new Error('unreachable?');
                    }
                }),
            ).toEqual([vec, 4]);
        });
    });
});

describe('Tuple', () => {
    it('tuple () encoded as expected', () => {
        const encoded = encodeTuple([], []);

        expect(encoded).toEqual(new Uint8Array());

        expect(decodeTuple(encoded, [])).toEqual([[], 0]);
    });

    it('tuple (u64, String, Vec<i8>, (i32, i32), bool) encoded as expected', () => {
        type Codec<T> = [(v: T) => Uint8Array, (b: Uint8Array) => [T, number]];

        const strCodec: Codec<string> = [encodeStrCompact, decodeStrCompact];
        const i32Codec: Codec<JSBI> = [
            (n) => encodeBigInt(n, { bits: 32, signed: true, endianness: 'le' }),
            (b) => decodeBigInt(b, { bits: 32, signed: true, endianness: 'le' }),
        ];
        const i8Codec: Codec<JSBI> = [
            (n) => encodeBigInt(n, { bits: 8, signed: true, endianness: 'le' }),
            (b) => decodeBigInt(b, { bits: 8, signed: true, endianness: 'le' }),
        ];
        const u64Codec: Codec<JSBI> = [
            (n) => encodeBigInt(n, { bits: 64, signed: true, endianness: 'le' }),
            (b) => decodeBigInt(b, { bits: 64, signed: true, endianness: 'le' }),
        ];
        const veci8Codec: Codec<JSBI[]> = [(arr) => encodeVec(arr, i8Codec[0]), (b) => decodeVec(b, i8Codec[1])];
        const boolCodec: Codec<boolean> = [encodeBool, decodeBool];
        const i32TupleCodec: Codec<[JSBI, JSBI]> = [
            (v) => encodeTuple(v, yieldNTimes(i32Codec[0], 2) as any),
            (b) => decodeTuple(b, yieldNTimes(i32Codec[1], 2) as any),
        ];

        const TUPLE_CODECS = [u64Codec, strCodec, veci8Codec, i32TupleCodec, boolCodec];

        const ENCODED = Uint8Array.from([
            64, 0, 0, 0, 0, 0, 0, 0, 24, 72, 101, 110, 110, 111, 63, 20, 7, 1, 22, 5, 214, 110, 239, 255, 255, 16, 248,
            6, 0, 1,
        ]);

        const VALUE = [
            JSBI.BigInt(64),
            'Henno?',
            [7, 1, 22, 5, -42].map(JSBI.BigInt),
            [-4242, 456720].map(JSBI.BigInt),
            true,
        ];

        expect(encodeTuple(VALUE, TUPLE_CODECS.map((x) => x[0]) as any)).toEqual(ENCODED);
        expect(decodeTuple(ENCODED, TUPLE_CODECS.map((x) => x[1]) as any)).toEqual([VALUE, ENCODED.length]);
    });
});

describe('Struct', () => {
    describe('struct with primitives encoded as expected', () => {
        const STRUCT = {
            // string
            foo: 'bazzing',
            // u32
            bar: JSBI.BigInt(69),
        };
        const ORDER: (keyof typeof STRUCT)[] = ['foo', 'bar'];
        const ENCODED = Uint8Array.from([28, 98, 97, 122, 122, 105, 110, 103, 69, 0, 0, 0]);

        it('encode', () => {
            const encoders = {
                foo: encodeStrCompact,
                bar: (v: JSBI) => encodeBigInt(v, { bits: 32, signed: true, endianness: 'le' }),
            };

            const encoded = encodeStruct(STRUCT, encoders, ORDER);

            expect(encoded).toEqual(ENCODED);
        });

        it('decode', () => {
            const decoders: { [K in keyof typeof STRUCT]: Decode<typeof STRUCT[K]> } = {
                foo: decodeStrCompact,
                bar: (buff: Uint8Array) => decodeBigInt(buff, { bits: 32, signed: true, endianness: 'le' }),
            };

            const [decoded, len] = decodeStruct(ENCODED, decoders, ORDER);

            expect(decoded).toEqual(STRUCT);
            expect(len).toEqual(ENCODED.length);
        });
    });
});

describe('Enum', () => {
    describe('Option<bool>', () => {
        const { schema, codec } = createOptionSchema(encodeBool, decodeBool);

        it('"None" encoded as expected', () => {
            expect(codec.encode(Enum.create('None'))).toEqual(new Uint8Array([0]));
        });

        it('"None" decoded as expected', () => {
            const none: Enum<OptionDef<boolean>> = Enum.create('None');
            expect(codec.decode(new Uint8Array([0]))).toEqual([none, 1]);
        });

        it('"Some(false)" encoded as expected', () => {
            expect(codec.encode(Enum.create('Some', false))).toEqual(new Uint8Array([1, 0]));
        });

        it('"Some(false)" decoded as expected', () => {
            const some: Enum<OptionDef<boolean>> = Enum.create('Some', false);
            expect(codec.decode(new Uint8Array([1, 0]))).toEqual([some, 2]);
        });
    });
});

describe('Map', () => {
    describe('Map<string, u32>', () => {
        const map = new Map<string, JSBI>([['bazzing', JSBI.BigInt(69)]]);
        const encoded = Uint8Array.from([4, 28, 98, 97, 122, 122, 105, 110, 103, 69, 0, 0, 0]);

        it('encode', () => {
            expect(
                encodeMap(map, encodeStrCompact, (v) => encodeBigInt(v, { bits: 32, signed: true, endianness: 'le' })),
            ).toEqual(encoded);
        });

        it('decode', () => {
            expect(
                decodeMap(encoded, decodeStrCompact, (v) =>
                    decodeBigInt(v, { bits: 32, signed: true, endianness: 'le' }),
                ),
            ).toEqual([map, encoded.length]);
        });
    });

    describe('Map<u32, u32>', () => {
        const map = new Map<JSBI, JSBI>(
            [
                [1, 2],
                [23, 24],
                [28, 30],
                [45, 80],
            ].map(([k, v]) => [JSBI.BigInt(k), JSBI.BigInt(v)]),
        );
        const encoded = Uint8Array.from([
            16, 1, 0, 0, 0, 2, 0, 0, 0, 23, 0, 0, 0, 24, 0, 0, 0, 28, 0, 0, 0, 30, 0, 0, 0, 45, 0, 0, 0, 80, 0, 0, 0,
        ]);

        const encode: Encode<JSBI> = (v) => encodeBigInt(v, { bits: 32, signed: true, endianness: 'le' });
        const decode: Decode<JSBI> = (b) => decodeBigInt(b, { bits: 32, signed: true, endianness: 'le' });

        it('encode', () => {
            expect(encodeMap(map, encode, encode)).toEqual(encoded);
        });

        it('decode', () => {
            expect(decodeMap(encoded, decode, decode)).toEqual([map, encoded.length]);
        });
    });
});

describe('Array', () => {
    describe('[u8; 7]', () => {
        const nums = [5, 8, 1, 2, 8, 42, 129];
        const arrU8 = nums.map(JSBI.BigInt);
        const encoded = Uint8Array.from(nums);

        test('encode', () => {
            expect(encodeArray(arrU8, (v) => encodeBigInt(v, { bits: 8, signed: false, endianness: 'le' }), 7)).toEqual(
                encoded,
            );
        });

        test('decode', () => {
            expect(
                decodeArray(encoded, (b) => decodeBigInt(b, { bits: 8, signed: false, endianness: 'le' }), 7),
            ).toEqual([arrU8, 7]);
        });
    });
});

describe('OptionBool', () => {
    function pretty(val: Option<boolean>): string {
        return val.match({
            None: () => 'None',
            Some: (x) => `Some(${x})`,
        });
    }

    function testCase(val: Option<boolean>, encoded: number): [string, Option<boolean>, number] {
        return [pretty(val), val, encoded];
    }

    test.each([
        testCase(Enum.create('None'), 0),
        testCase(Enum.create('Some', true), 1),
        testCase(Enum.create('Some', false), 2),
    ])('encode/decode %s', (_label, item, byte) => {
        const { encode, decode } = OptionBoolCodec;
        const bytes = Uint8Array.from([byte]);

        expect(encode(item)).toEqual(bytes);
        expect(decode(bytes)).toEqual([item, 1]);
    });
});

describe('Set', () => {
    interface TestCase<T> {
        js: T[];
        bytes: number[];
        encode: Encode<T>;
        decode: Decode<T>;
    }

    function defCase<T>(v: TestCase<T>): TestCase<T> {
        return v;
    }

    test.each([
        defCase({
            js: [2, 24, 30, 80].map((x) => JSBI.BigInt(x)),
            bytes: [16, 2, 0, 0, 0, 24, 0, 0, 0, 30, 0, 0, 0, 80, 0, 0, 0],
            ...bigIntCodec({ bits: 32, signed: false, endianness: 'le' }),
        }),
        defCase({
            js: ['one', '©∆˙©∫∫∫'],
            bytes: [
                8, 12, 111, 110, 101, 72, 194, 169, 226, 136, 134, 203, 153, 194, 169, 226, 136, 171, 226, 136, 171,
                226, 136, 171,
            ],
            encode: encodeStrCompact,
            decode: decodeStrCompact,
        }),
    ])('encode/decode set of $js', ({ js, bytes, encode, decode }: TestCase<unknown>) => {
        const set = new Set(js);
        const arr = new Uint8Array(bytes);

        expect(encodeSet(set, encode)).toEqual(arr);
        expect(decodeSet(arr, decode)).toEqual([set, bytes.length]);
    });
});
