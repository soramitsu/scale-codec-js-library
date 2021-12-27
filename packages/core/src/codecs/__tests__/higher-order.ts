/* eslint-disable max-nested-callbacks */

import { yieldNTimes } from '@scale-codec/util'
import { Enum, Option, Valuable } from '@scale-codec/enum'
import {
    encodeBool,
    decodeBool,
    encodeBigInt,
    decodeBigInt,
    encodeStr,
    decodeStr,
    encodeVec,
    decodeArray,
    decodeUint8Array,
    encodeTuple,
    decodeSet,
    encodeSet,
    decodeTuple,
    encodeArray,
    encodeUint8Array,
    decodeVec,
    encodeUint8Vec,
    decodeUint8Vec,
    encodeEnum,
    decodeEnum,
    encodeOptionBool,
    decodeOptionBool,
    encodeMap,
    decodeMap,
    encodeStruct,
    decodeStruct,
} from '../'
import { Encode, Decode, DecodeResult } from '../../types'
import { BigIntTypes, decodeInt, encodeInt } from '../int'

type Codec<T> = { encode: Encode<T>; decode: Decode<T> }

export function bigIntCodec(ty: BigIntTypes): Codec<bigint> {
    return {
        encode: (bi: bigint) => encodeBigInt(bi, ty),
        decode: (bytes: Uint8Array) => decodeBigInt(bytes, ty),
    }
}

function hexifyBytes(v: Uint8Array): string {
    return [...v].map((x) => x.toString(16).padStart(2, '0')).join(' ')
}

function prettyHexToBytes(hex: string): Uint8Array {
    return Uint8Array.from(hex.split(' ').map((x) => parseInt(x, 16)))
}

interface OptionDef<T> {
    None: null
    Some: Valuable<T>
}

function optionCodec<T>({ encode, decode }: Codec<T>): Codec<Option<T>> {
    return {
        encode: (v) =>
            encodeEnum(v, {
                None: { d: 0 },
                Some: { d: 1, encode },
            }),
        decode: (b) =>
            decodeEnum(b, {
                0: { v: 'None' },
                1: { v: 'Some', decode },
            }),
    }
}

// }

describe('Vec', () => {
    // https://github.com/paritytech/parity-scale-codec/blob/166d748abc1e48d74c528e2456fefe6f3c48f256/src/codec.rs#L1320
    describe('vec of u8 encoded as expected', () => {
        const numbers = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34].map((x) => BigInt(x))
        const hex = '28 00 01 01 02 03 05 08 0d 15 22'

        it('encode', () => {
            const numEncode = (v: bigint) => encodeBigInt(v, 'u8')

            const encoded = encodeVec(numbers, numEncode)

            expect(hexifyBytes(encoded)).toEqual(hex)
        })

        it('decode', () => {
            const numDecode = (b: Uint8Array): [bigint, number] => decodeBigInt(b, 'u8')
            const encoded = prettyHexToBytes(hex)

            const [decoded, len] = decodeVec(encoded, numDecode)

            expect(decoded).toEqual(numbers)
            expect(len).toEqual(encoded.length)
        })
    })

    // https://github.com/paritytech/parity-scale-codec/blob/166d748abc1e48d74c528e2456fefe6f3c48f256/src/codec.rs#L1328
    it('vec of i16 encoded as expected', () => {
        const numbers = [0, 1, -1, 2, -2, 3, -3].map((x) => BigInt(x))
        const hex = '1c 00 00 01 00 ff ff 02 00 fe ff 03 00 fd ff'

        const numEncode = (v: bigint) => encodeBigInt(v, 'i16')
        const numDecode = (b: Uint8Array): [bigint, number] => decodeBigInt(b, 'i16')

        const encoded = encodeVec(numbers, numEncode)
        expect(hexifyBytes(encoded)).toEqual(hex)

        const [decoded, len] = decodeVec(encoded, numDecode)
        expect(decoded).toEqual(numbers)
        expect(len).toEqual(encoded.length)
    })

    it('vec encodes only necessary', () => {
        const actualVecHex = '28 00 01 01 02 03 05 08 0d 15 22'
        const actualVecBytes = actualVecHex.split(' ').map((x) => parseInt(x, 16))
        const actualVecBytesLen = actualVecBytes.length

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
        ])

        const [_decoded, len] = decodeVec(encoded, (bytes) => decodeBigInt(bytes, 'u8'))

        expect(len).toEqual(actualVecBytesLen)
    })

    // https://github.com/paritytech/parity-scale-codec/blob/master/src/codec.rs#L1387
    it('vec of string encoded as expected', () => {
        const strings = ['Hamlet', 'Война и мир', '三国演义', 'أَلْف لَيْلَة وَلَيْلَة‎']
        const hex = `\
10 18 48 61 6d 6c 65 74 50 d0 92 d0 be d0 b9 d0 bd d0 b0 20 d0 \
b8 20 d0 bc d0 b8 d1 80 30 e4 b8 89 e5 9b bd e6 bc 94 e4 b9 89 bc d8 a3 d9 8e d9 84 d9 92 \
d9 81 20 d9 84 d9 8e d9 8a d9 92 d9 84 d9 8e d8 a9 20 d9 88 d9 8e d9 84 d9 8e d9 8a d9 92 \
d9 84 d9 8e d8 a9 e2 80 8e`

        const encode = (v: string) => encodeStr(v)
        const decode = (b: Uint8Array) => decodeStr(b)

        const encoded = encodeVec(strings, encode)
        expect(hexifyBytes(encoded)).toEqual(hex)

        const [decoded, len] = decodeVec(encoded, decode)
        expect(decoded).toEqual(strings)
        expect(len).toEqual(encoded.length)
    })

    // https://github.com/paritytech/parity-scale-codec/blob/master/src/codec.rs#L1336
    describe('vec of option int encoded as expected', () => {
        const { encode, decode } = optionCodec<bigint>(bigIntCodec('i8'))
        const vec: Enum<OptionDef<bigint>>[] = [
            Enum.valuable('Some', 1n),
            Enum.valuable('Some', -1n),
            Enum.empty('None'),
        ]
        const hex = '0c 01 01 01 ff 00'

        it('encode', () => {
            expect(hexifyBytes(encodeVec(vec, encode))).toEqual(hex)
        })

        it('decode', () => {
            expect(decodeVec(prettyHexToBytes(hex), decode)).toEqual([vec, 6])
        })
    })

    // https://github.com/paritytech/parity-scale-codec/blob/master/src/codec.rs#L1344
    // it is a special type, OptionBool. see related Rust's source code
    // it encodes not like default enum
    describe('vec of option bool encoded as expected', () => {
        const vec: Enum<OptionDef<boolean>>[] = [
            Enum.valuable('Some', true),
            Enum.valuable('Some', false),
            Enum.empty('None'),
        ]
        const hex = '0c 01 02 00'

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
            ).toEqual(prettyHexToBytes(hex))
        })

        it('decode', () => {
            expect(
                decodeVec(prettyHexToBytes(hex), (bytes): DecodeResult<Enum<OptionDef<boolean>>> => {
                    switch (bytes[0]) {
                        case 0:
                            return [Enum.empty('None'), 1]
                        case 1:
                            return [Enum.valuable('Some', true), 1]
                        case 2:
                            return [Enum.valuable('Some', false), 1]
                        default:
                            throw new Error('unreachable?')
                    }
                }),
            ).toEqual([vec, 4])
        })
    })
})

describe('Tuple', () => {
    it('tuple () encoded as expected', () => {
        const encoded = encodeTuple([], [])

        expect(encoded).toEqual(new Uint8Array())

        expect(decodeTuple(encoded, [])).toEqual([[], 0])
    })

    it('tuple (u64, String, Vec<i8>, (i32, i32), bool) encoded as expected', () => {
        const strCodec: Codec<string> = { encode: encodeStr, decode: decodeStr }
        const i32Codec = bigIntCodec('i32')
        const i8Codec = bigIntCodec('i8')
        const u64Codec = bigIntCodec('i64')
        const veci8Codec: Codec<bigint[]> = {
            encode: (arr) => encodeVec(arr, i8Codec.encode),
            decode: (b) => decodeVec(b, i8Codec.decode),
        }
        const boolCodec: Codec<boolean> = { encode: encodeBool, decode: decodeBool }
        const i32TupleCodec: Codec<[bigint, bigint]> = {
            encode: (v) => encodeTuple(v, yieldNTimes(i32Codec.encode, 2) as any),
            decode: (b) => decodeTuple(b, yieldNTimes(i32Codec.decode, 2) as any),
        }

        const TUPLE_CODECS = [u64Codec, strCodec, veci8Codec, i32TupleCodec, boolCodec]

        const ENCODED = Uint8Array.from([
            64, 0, 0, 0, 0, 0, 0, 0, 24, 72, 101, 110, 110, 111, 63, 20, 7, 1, 22, 5, 214, 110, 239, 255, 255, 16, 248,
            6, 0, 1,
        ])

        const VALUE = [64n, 'Henno?', [7, 1, 22, 5, -42].map(BigInt), [-4242, 456720].map(BigInt), true]

        expect(encodeTuple(VALUE, TUPLE_CODECS.map((x) => x.encode) as any)).toEqual(ENCODED)
        expect(decodeTuple(ENCODED, TUPLE_CODECS.map((x) => x.decode) as any)).toEqual([VALUE, ENCODED.length])
    })
})

describe('Struct', () => {
    describe('struct with primitives encoded as expected', () => {
        const STRUCT = {
            // string
            foo: 'bazzing',
            // u32
            bar: 69,
        }
        const ORDER: (keyof typeof STRUCT)[] = ['foo', 'bar']
        const ENCODED = Uint8Array.from([28, 98, 97, 122, 122, 105, 110, 103, 69, 0, 0, 0])

        it('encode', () => {
            const encoders = {
                foo: encodeStr,
                bar: (v: number) => encodeInt(v, 'u32'),
            }

            const encoded = encodeStruct(STRUCT, encoders, ORDER)

            expect(encoded).toEqual(ENCODED)
        })

        it('decode', () => {
            const decoders: { [K in keyof typeof STRUCT]: Decode<typeof STRUCT[K]> } = {
                foo: decodeStr,
                bar: (buff: Uint8Array) => decodeInt(buff, 'u32'),
            }

            const [decoded, len] = decodeStruct(ENCODED, decoders, ORDER)

            expect(decoded).toEqual(STRUCT)
            expect(len).toEqual(ENCODED.length)
        })
    })
})

describe('Enum', () => {
    describe('Option<bool>', () => {
        const { encode, decode } = optionCodec({ encode: encodeBool, decode: decodeBool })

        it('"None" encoded as expected', () => {
            expect(encode(Enum.empty('None'))).toEqual(new Uint8Array([0]))
        })

        it('"None" decoded as expected', () => {
            const none: Enum<OptionDef<boolean>> = Enum.empty('None')
            expect(decode(new Uint8Array([0]))).toEqual([none, 1])
        })

        it('"Some(false)" encoded as expected', () => {
            expect(encode(Enum.valuable('Some', false))).toEqual(new Uint8Array([1, 0]))
        })

        it('"Some(false)" decoded as expected', () => {
            const some: Enum<OptionDef<boolean>> = Enum.valuable('Some', false)
            expect(decode(new Uint8Array([1, 0]))).toEqual([some, 2])
        })
    })
})

describe('Map', () => {
    describe('Map<string, u32>', () => {
        const map = new Map<string, number>([['bazzing', 69]])
        const encoded = Uint8Array.from([4, 28, 98, 97, 122, 122, 105, 110, 103, 69, 0, 0, 0])

        it('encode', () => {
            expect(encodeMap(map, encodeStr, (v) => encodeInt(v, 'i32'))).toEqual(encoded)
        })

        it('decode', () => {
            expect(decodeMap(encoded, decodeStr, (b) => decodeInt(b, 'i32'))).toEqual([map, encoded.length])
        })
    })

    describe('Map<u32, u32>', () => {
        const map = new Map<number, number>([
            [1, 2],
            [23, 24],
            [28, 30],
            [45, 80],
        ])
        const encoded = Uint8Array.from([
            16, 1, 0, 0, 0, 2, 0, 0, 0, 23, 0, 0, 0, 24, 0, 0, 0, 28, 0, 0, 0, 30, 0, 0, 0, 45, 0, 0, 0, 80, 0, 0, 0,
        ])

        const encode: Encode<number> = (v) => encodeInt(v, 'i32')
        const decode: Decode<number> = (b) => decodeInt(b, 'i32')

        it('encode', () => {
            expect(encodeMap(map, encode, encode)).toEqual(encoded)
        })

        it('decode', () => {
            expect(decodeMap(encoded, decode, decode)).toEqual([map, encoded.length])
        })
    })
})

describe('Array', () => {
    describe('[u8; 7]', () => {
        const nums = [5, 8, 1, 2, 8, 42, 129]
        const encoded = Uint8Array.from(nums)

        test('encode', () => {
            expect(encodeArray(nums, (v) => encodeInt(v, 'u8'), 7)).toEqual(encoded)
        })

        test('decode', () => {
            expect(decodeArray(encoded, (b) => decodeInt(b, 'u8'), 7)).toEqual([nums, 7])
        })
    })
})

describe('OptionBool', () => {
    function pretty(val: Option<boolean>): string {
        return val.match({
            None: () => 'None',
            Some: (x) => `Some(${x})`,
        })
    }

    function testCase(val: Option<boolean>, encoded: number): [string, Option<boolean>, number] {
        return [pretty(val), val, encoded]
    }

    test.each([
        testCase(Enum.empty('None'), 0),
        testCase(Enum.valuable('Some', true), 1),
        testCase(Enum.valuable('Some', false), 2),
    ])('encode/decode %s', (_label, item, byte) => {
        const bytes = Uint8Array.from([byte])

        expect(encodeOptionBool(item)).toEqual(bytes)
        expect(decodeOptionBool(bytes)).toEqual([item, 1])
    })
})

describe('Set', () => {
    interface TestCase<T> {
        js: T[]
        bytes: number[]
        encode: Encode<T>
        decode: Decode<T>
    }

    function defCase<T>(v: TestCase<T>): TestCase<T> {
        return v
    }

    test.each([
        defCase({
            js: [2, 24, 30, 80].map((x) => BigInt(x)),
            bytes: [16, 2, 0, 0, 0, 24, 0, 0, 0, 30, 0, 0, 0, 80, 0, 0, 0],
            ...bigIntCodec('u32'),
        }),
        defCase({
            js: ['one', '©∆˙©∫∫∫'],
            bytes: [
                8, 12, 111, 110, 101, 72, 194, 169, 226, 136, 134, 203, 153, 194, 169, 226, 136, 171, 226, 136, 171,
                226, 136, 171,
            ],
            encode: encodeStr,
            decode: decodeStr,
        }),
    ])('encode/decode set of $js', ({ js, bytes, encode, decode }: TestCase<unknown>) => {
        const set = new Set(js)
        const arr = new Uint8Array(bytes)

        expect(encodeSet(set, encode)).toEqual(arr)
        expect(decodeSet(arr, decode)).toEqual([set, bytes.length])
    })
})

describe('Uint8 Array ([u8; x])', () => {
    test('Returns source bytes on encode', () => {
        // Arrange
        const LEN = 7
        const source = new Uint8Array([1, 5, 4, 1, 2, 6, 1])

        // Act
        const encoded = encodeUint8Array(source, LEN)

        // Assert
        expect(encoded).toEqual(source)
    })

    test('Mutation on encoded does not affect the source', () => {
        // Arrange
        const source = new Uint8Array([0, 0, 0, 0, 0])

        // Act
        const encoded = encodeUint8Array(source.subarray(3), 2)
        encoded[0] = 1

        // Assert
        expect(source).toEqual(new Uint8Array([0, 0, 0, 0, 0]))
    })

    test('Encoding throws if bytes length is not correct', () => {
        expect(() => encodeUint8Array(new Uint8Array([5, 1, 2]), 1)).toThrowError()
    })

    test('Returns part of the source bytes on decode', () => {
        expect(decodeUint8Array(new Uint8Array([65, 12, 43, 12, 43]), 3)).toEqual([new Uint8Array([65, 12, 43]), 3])
    })

    test('Mutation of decoded part does not affect the source', () => {
        // Arrange
        const source = new Uint8Array(new Array(10).fill(0))

        // Act
        const [decoded] = decodeUint8Array(source.subarray(3), 2)
        decoded[1] = 1

        // Assert
        expect(source).toEqual(new Uint8Array(new Array(10).fill(0)))
    })

    test('Decoding throws if the source bytes length less than the array length', () => {
        expect(() => decodeUint8Array(new Uint8Array(), 3)).toThrowError()
    })
})

describe('Vec<u8>', () => {
    const vec = [5, 1, 2, 61, 255]
    const vecEncoded = [20, 5, 1, 2, 61, 255]

    test('Encodes ok', () => {
        expect(encodeUint8Vec(new Uint8Array(vec))).toEqual(new Uint8Array(vecEncoded))
    })

    test('Decodes ok', () => {
        expect(decodeUint8Vec(new Uint8Array(vecEncoded))).toEqual([new Uint8Array(vec), vecEncoded.length])
    })

    test('Mutation of the source does not affect the encode result', () => {
        // Arrange
        const source = new Uint8Array([1, 2, 3, 4])

        // Act
        const encoded = encodeUint8Vec(source.subarray(1))
        const encodedSaved = [...encoded]
        source[2] = 15

        // Assert
        expect(encoded).toEqual(new Uint8Array(encodedSaved))
    })

    test('Mutation of decoded bytes does not affect the source bytes', () => {
        // Arrange
        const encodedSource = new Uint8Array([16, 4, 3, 2, 1])

        // Act
        const [decoded] = decodeUint8Vec(encodedSource.subarray(1))
        decoded[1] = 255

        // Assert
        expect(encodedSource).toEqual(new Uint8Array([16, 4, 3, 2, 1]))
    })
})
