import { prettyHexToBytes } from '@scale-codec/util'
import ENCODE_TEST_DATA from '../../../../rust-ints/output-ints.json'
import { encodeInt, decodeInt, IntTypes, encodeBigInt, decodeBigInt, BigIntTypes } from '../int'

describe('Ints (8-32 bits)', () => {
    describe("Rust's samples", () => {
        const filtered = ENCODE_TEST_DATA.filter((x) => x.bits <= 32)

        test.each(filtered)('Encode/decode $decimal (signed=$signed, bits=$bits)', ({ decimal, le, signed, bits }) => {
            const encoded = prettyHexToBytes(le)
            const ty: IntTypes = `${signed ? 'i' : 'u'}${bits}` as any
            const num = Number(decimal)

            expect(encodeInt(num, ty)).toEqual(encoded)
            expect(decodeInt(encoded, ty)).toEqual([num, bits / 8])
        })
    })

    test('Decode of subarray works (shared ArrayBuffer)', () => {
        const bytes = new Uint8Array([8, 1, 4, 1, ...encodeInt(55122, 'u32'), 123, 4, 1, 2, 61])
        const bytesSub = bytes.subarray(4)

        expect(decodeInt(bytesSub, 'u32')).toEqual([55122, 4])
    })

    test('Source array is not mutated during decoding', () => {
        const source = new Uint8Array([0, 0, 0, 0, ...encodeInt(-123, 'i32')])
        const sourceCopy = new Uint8Array([...source])
        const sourceSub = source.subarray(4)

        decodeInt(sourceSub, 'i32')

        expect(source).toEqual(sourceCopy)
    })

    test('Unsigned encoder throws if negative num is passed', () => {
        expect(() => encodeInt(-1, 'u16')).toThrow()
    })

    test('Encoder throws if non-integer num is passed', () => {
        expect(() => encodeInt(3.14, 'i32')).toThrow()
    })

    test('Encoder throws if non-safe integer num is passed', () => {
        expect(() => encodeInt(1e20, 'u32')).toThrow()
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

                expect(encodeBigInt(num, ty)).toEqual(encoded)
                expect(decodeBigInt(encoded, ty)).toEqual([num, bits / 8])
            },
        )
    })

    test('Decode of subarray works (shared ArrayBuffer)', () => {
        const bytes = new Uint8Array([8, 1, 4, 1, ...encodeBigInt(-55122n, 'i128')])
        const bytesSub = bytes.subarray(4)

        expect(decodeBigInt(bytesSub, 'i128')).toEqual([-55122n, 16])
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
            ...encodeBigInt(num, 'i64'),

            // noise again
            51,
            255,
            1,
        ])
        const SOURCE_COPY = new Uint8Array([...SOURCE_ARRAY])
        // taking subarray - not copy
        const DECODE_SUBARRAY = SOURCE_COPY.subarray(3, 3 + 8)

        // Act
        const firstResult = decodeBigInt(DECODE_SUBARRAY, 'i64')
        const secondResult = decodeBigInt(DECODE_SUBARRAY, 'i64')

        // Assert
        expect(SOURCE_COPY).toEqual(SOURCE_ARRAY)
        expect(firstResult).toEqual(secondResult)
        expect(firstResult).toEqual([num, 8])
    })

    test.each([['u32'], ['u64'], ['u128']])(
        'Unsigned encoder (%p) throws if a negative bigint is passed',
        (encoding: BigIntTypes) => {
            expect(() => encodeBigInt(-1n, encoding)).toThrow()
        },
    )
})
