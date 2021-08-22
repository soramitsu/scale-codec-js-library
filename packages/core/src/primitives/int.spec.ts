import JSBI from 'jsbi';
import {
    AllowedBits,
    BigIntCodecOptions,
    decodeBigInt,
    encodeBigInt,
    // encodeBigIntBigEndian,
    // encodeBigIntLittleEndian,
} from './int';
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

    test.only('Uint8Array is reusable after decoding', () => {
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

// describe('encodeBigInt()', (): void => {
//     it('converts null values to 0x00', (): void => {
//         expect(encodeBigInt(JSBI.BigInt(0), { endianness: 'be' })).toEqual(new Uint8Array());
//     });

//     it('converts null values to 0x00000000 (bitLength)', (): void => {
//         expect(encodeBigInt(JSBI.BigInt(0), { bits: 32, endianness: 'be' })).toEqual(new Uint8Array([0, 0, 0, 0]));
//     });

//     it('converts BN values to a prefixed hex representation', (): void => {
//         expect(encodeBigInt(JSBI.BigInt(0x123456), { endianness: 'be' })).toEqual(new Uint8Array([0x12, 0x34, 0x56]));
//     });

//     it('converts BN values to a prefixed hex representation (bitLength)', (): void => {
//         expect(encodeBigInt(JSBI.BigInt(0x123456), { bits: 32, endianness: 'be' })).toEqual(
//             new Uint8Array([0x00, 0x12, 0x34, 0x56]),
//         );
//     });

//     it('converts using little endian (as set)', (): void => {
//         expect(encodeBigInt(JSBI.BigInt(0x123456), { bits: 32, endianness: 'le' })).toEqual(
//             new Uint8Array([0x56, 0x34, 0x12, 0x00]),
//         );
//     });

//     it('converts negative numbers', (): void => {
//         expect(encodeBigInt(JSBI.BigInt(-1234), { isSigned: true })).toEqual(new Uint8Array([46, 251]));
//     });

//     it('converts negative numbers (BE)', (): void => {
//         expect(encodeBigInt(JSBI.BigInt(-1234), { isSigned: true, endianness: 'be' })).toEqual(
//             new Uint8Array([251, 46]),
//         );
//     });

//     it('converts negative numbers (bitLength)', (): void => {
//         expect(encodeBigInt(JSBI.BigInt(-1234), { bits: 32, isSigned: true })).toEqual(
//             new Uint8Array([46, 251, 255, 255]),
//         );
//     });

//     it('converts negative numbers (another)', () => {
//         expect(encodeBigInt(JSBI.BigInt(-4123), { bits: 32, isSigned: true })).toEqual(
//             new Uint8Array([229, 239, 255, 255]),
//         );
//     });
// });

// describe('decodeBigInt', (): void => {
//     it('converts little-endian by default', (): void => {
//         expect(decodeBigInt(new Uint8Array([0x12, 0x34]))[0].toString(16)).toBe('3412');
//     });

//     it('converts values (big-endian)', (): void => {
//         expect(decodeBigInt(new Uint8Array([0x12, 0x34]), { endianness: 'be' })[0].toString(16)).toBe('1234');
//     });

//     it('converts values (little-endian)', (): void => {
//         expect(decodeBigInt(new Uint8Array([0x12, 0x34]), { endianness: 'le' })[0].toString(16)).toBe('3412');
//     });

//     it('converts empty', (): void => {
//         expect(decodeBigInt(new Uint8Array(), { endianness: 'le' })[0].toString(16)).toBe('0');
//     });

//     it('handles negative numbers (little-endian)', (): void => {
//         expect(decodeBigInt(new Uint8Array([46, 251]), { endianness: 'le', isSigned: true })[0].toString()).toBe(
//             '-1234',
//         );
//     });

//     it('handles negative numbers (big-endian)', (): void => {
//         expect(decodeBigInt(new Uint8Array([251, 46]), { endianness: 'be', isSigned: true })[0].toString()).toBe(
//             '-1234',
//         );
//     });

//     it('handles overflows correctly (little-endian)', (): void => {
//         expect(decodeBigInt(new Uint8Array([0, 1, 0, 0, 0, 0, 0, 0]))[0].toString()).toBe('256');
//     });

//     it('takes only specified count of bits', () => {
//         expect(decodeBigInt(new Uint8Array([0, 255]), { bits: 8 })[0].toString()).toBe('0');
//     });
// });
