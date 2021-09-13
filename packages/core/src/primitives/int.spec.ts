import JSBI from 'jsbi';
import { AllowedBits, BigIntCodecOptions, decodeBigInt, encodeBigInt } from './int';
import ENCODE_TEST_DATA from '../../../rust-ints/output.json';

function parseSpacedHexToBytes(hex: string): Uint8Array {
    return Uint8Array.from(hex.split(' ').map((byteHex) => parseInt(byteHex, 16)));
}

describe('int/uint', () => {
    for (const item of ENCODE_TEST_DATA) {
        const le = parseSpacedHexToBytes(item.le);
        const be = parseSpacedHexToBytes(item.be);
        const num = JSBI.BigInt(item.decimal);
        const numType = `${item.signed ? 'i' : 'u'}${item.bits}`;
        const bits = item.bits as AllowedBits;
        const { signed } = item;

        test(`encode ${item.decimal} ${numType} as little-endian`, () => {
            expect(
                encodeBigInt(num, {
                    bits,
                    signed,
                    endianness: 'le',
                }),
            ).toEqual(le);
        });

        test(`encode ${item.decimal} ${numType} as big-endian`, () => {
            expect(
                encodeBigInt(num, {
                    bits,
                    signed,
                    endianness: 'be',
                }),
            ).toEqual(be);
        });

        test(`decode ${item.decimal} ${numType} as little-endian`, () => {
            expect(
                decodeBigInt(le, {
                    bits,
                    signed,
                    endianness: 'le',
                }),
            ).toEqual([num, bits / 8]);
        });

        test(`decode ${item.decimal} ${numType} as big-endian`, () => {
            expect(
                decodeBigInt(be, {
                    bits,
                    signed,
                    endianness: 'be',
                }),
            ).toEqual([num, bits / 8]);
        });
    }

    test('Uint8Array is reusable after decoding', () => {
        // Arrange
        const num = JSBI.BigInt(-123);
        const opts: BigIntCodecOptions = {
            bits: 64,
            signed: true,
            endianness: 'le',
        };
        const SOURCE_ARRAY = new Uint8Array([
            // noise
            5,
            12,
            42,

            // num
            ...encodeBigInt(num, opts),

            // noise again
            51,
            255,
            1,
        ]);
        const SOURCE_COPY = new Uint8Array([...SOURCE_ARRAY]);
        // taking subarray - not copy
        const DECODE_SUBARRAY = SOURCE_COPY.subarray(3, 3 + 8);

        // Act
        const firstResult = decodeBigInt(DECODE_SUBARRAY, opts);
        const secondResult = decodeBigInt(DECODE_SUBARRAY, opts);

        // Assert
        expect(SOURCE_COPY).toEqual(SOURCE_ARRAY);
        expect(firstResult).toEqual(secondResult);
        expect(firstResult).toEqual([num, 8]);
    });
});
