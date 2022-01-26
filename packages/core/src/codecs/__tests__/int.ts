import { prettyHexToBytes } from '@scale-codec/util'
import ENCODE_TEST_DATA from '../../../../rust-samples/output-ints.json'
import { WalkerImpl as Walker } from '../../util'
import {
    encodeInt,
    IntTypes,
    encodeBigInt,
    BigIntTypes,
    createIntEncode,
    createIntDecode,
    createBigIntDecode,
    createBigIntEncode,
} from '../int'

describe('Ints (8-32 bits)', () => {
    describe("Rust's samples", () => {
        const filtered = ENCODE_TEST_DATA.filter((x) => x.bits <= 32)

        test.each(filtered)('Encode/decode $decimal (signed=$signed, bits=$bits)', ({ decimal, le, signed, bits }) => {
            const encoded = prettyHexToBytes(le)
            const ty: IntTypes = `${signed ? 'i' : 'u'}${bits}` as any
            const num = Number(decimal)

            expect(Walker.encode(num, createIntEncode(ty))).toEqual(encoded)
            expect(Walker.decode(encoded, createIntDecode(ty))).toEqual(num)
        })
    })

    test('Decode of subarray works (shared ArrayBuffer)', () => {
        const bytes = new Uint8Array([8, 1, 4, 1, ...Walker.encode(55122, createIntEncode('u32')), 123, 4, 1, 2, 61])
        const bytesSub = bytes.subarray(4, 8)

        expect(Walker.decode(bytesSub, createIntDecode('u32'))).toEqual(55122)
    })

    test('Source array is not mutated during decoding', () => {
        const source = new Uint8Array([0, 0, 0, 0, ...Walker.encode(-123, createIntEncode('i32'))])
        const sourceCopy = new Uint8Array([...source])
        const sourceSub = source.subarray(4)

        Walker.decode(sourceSub, createIntDecode('i32'))

        expect(source).toEqual(sourceCopy)
    })

    test('Unsigned encoder throws if negative num is passed', () => {
        expect(() => encodeInt(-1, 'u16', new Walker(new Uint8Array(20)))).toThrow()
    })

    test('Encoder throws if non-integer num is passed', () => {
        expect(() => encodeInt(3.14, 'i32', new Walker(new Uint8Array(20)))).toThrow()
    })

    test('Encoder throws if non-safe integer num is passed', () => {
        expect(() => encodeInt(1e20, 'u32', new Walker(new Uint8Array(20)))).toThrow()
    })
})

describe('Big ints (64-128 bits)', () => {
    describe("Rust's samples", () => {
        test.each(ENCODE_TEST_DATA)(
            'Encode/decode $decimal (signed=$signed, bits=$bits)',
            ({ decimal, le, signed, bits }) => {
                const encoded = prettyHexToBytes(le)
                const ty: BigIntTypes = `${signed ? 'i' : 'u'}${bits}` as any
                const num = BigInt(decimal)

                expect(Walker.encode(num, createBigIntEncode(ty))).toEqual(encoded)
                expect(Walker.decode(encoded, createBigIntDecode(ty))).toEqual(num)
            },
        )
    })

    test('Decode of subarray works (shared ArrayBuffer)', () => {
        const bytes = new Uint8Array([8, 1, 4, 1, ...Walker.encode(-55122n, createBigIntEncode('i128'))])
        const bytesSub = bytes.subarray(4, 20)

        expect(Walker.decode(bytesSub, createBigIntDecode('i128'))).toEqual(-55122n)
    })

    test('Source array is reusable after decoding', () => {
        // Arrange
        const num = -123n
        const SOURCE_ARRAY = new Uint8Array([
            // noise
            5,
            12,
            42,

            // num
            ...Walker.encode(num, createBigIntEncode('i64')),

            // noise again
            51,
            255,
            1,
        ])
        const SOURCE_COPY = new Uint8Array([...SOURCE_ARRAY])
        // taking subarray - not copy
        const DECODE_SUBARRAY = SOURCE_COPY.subarray(3, 3 + 8)

        // Act
        const firstResult = Walker.decode(DECODE_SUBARRAY, createBigIntDecode('i64'))
        const secondResult = Walker.decode(DECODE_SUBARRAY, createBigIntDecode('i64'))

        // Assert
        expect(SOURCE_COPY).toEqual(SOURCE_ARRAY)
        expect(firstResult).toEqual(secondResult)
        expect(firstResult).toEqual(num)
    })

    test.each([['u32'], ['u64'], ['u128']])(
        'Unsigned encoder (%p) throws if a negative bigint is passed',
        (encoding: BigIntTypes) => {
            expect(() => encodeBigInt(-1n, encoding, new Walker(new Uint8Array(20)))).toThrowError(
                /Negative num \(-1n?\) is passed/,
            )
        },
    )
})
