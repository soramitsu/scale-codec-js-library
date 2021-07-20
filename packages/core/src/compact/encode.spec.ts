import { encodeCompact } from './encode';
import JSBI from 'jsbi';

describe('encodeBigIntCompact', (): void => {
    it('encodes short u8', (): void => {
        expect(encodeCompact(JSBI.BigInt(18))).toEqual(new Uint8Array([18 << 2]));
    });

    it('encodes max u8 values', (): void => {
        expect(encodeCompact(JSBI.BigInt(63))).toEqual(new Uint8Array([0b11111100]));
    });

    it('encodes basic u16 value', (): void => {
        expect(encodeCompact(JSBI.BigInt(511))).toEqual(new Uint8Array([0b11111101, 0b00000111]));
    });

    it('encodes basic u16 (not at edge)', (): void => {
        expect(encodeCompact(JSBI.BigInt(111))).toEqual(new Uint8Array([0xbd, 0x01]));
    });

    it('encodes basic u32 values (< 2^30)', (): void => {
        expect(encodeCompact(JSBI.BigInt(0x1fff))).toEqual(new Uint8Array([253, 127]));
    });

    it('encodes basic u32 values (short)', (): void => {
        expect(encodeCompact(JSBI.BigInt(0xffff))).toEqual(new Uint8Array([254, 255, 3, 0]));
    });

    it('encodes basic u32 values (full)', (): void => {
        expect(encodeCompact(JSBI.BigInt(0xfffffff9))).toEqual(
            new Uint8Array([3 + ((4 - 4) << 2), 249, 255, 255, 255]),
        );
    });

    it('encodes a large value', (): void => {
        expect(encodeCompact(JSBI.BigInt('0x00005af3107a4000'))).toEqual(
            new Uint8Array([3 + ((6 - 4) << 2), 0x00, 0x40, 0x7a, 0x10, 0xf3, 0x5a]),
        );
    });

    it('does not modify the original', (): void => {
        const original = JSBI.BigInt(123456);

        expect(encodeCompact(original)).toEqual(new Uint8Array([2, 137, 7, 0]));
        expect(original.toString()).toEqual('123456');
    });

    describe('from Rust', (): void => {
        it.each([
            // Copied from https://github.com/paritytech/parity-codec/blob/master/src/codec.rs
            { expected: '00', value: JSBI.BigInt('0') },
            { expected: 'fc', value: JSBI.BigInt('63') },
            { expected: '01 01', value: JSBI.BigInt('64') },
            { expected: 'fd ff', value: JSBI.BigInt('16383') },
            { expected: '02 00 01 00', value: JSBI.BigInt('16384') },
            { expected: 'fe ff ff ff', value: JSBI.BigInt('1073741823') },
            { expected: '03 00 00 00 40', value: JSBI.BigInt('1073741824') },
            {
                expected: '03 ff ff ff ff',
                value: JSBI.subtract(JSBI.BigInt(`0b${1}${'0'.repeat(32)}`), JSBI.BigInt(1)),
            },
            { expected: '07 00 00 00 00 01', value: JSBI.BigInt(`0b${1}${'0'.repeat(32)}`) },
            { expected: '0b 00 00 00 00 00 01', value: JSBI.BigInt(`0b${1}${'0'.repeat(40)}`) },
            { expected: '0f 00 00 00 00 00 00 01', value: JSBI.BigInt(`0b${1}${'0'.repeat(48)}`) },
            {
                expected: '0f ff ff ff ff ff ff ff',
                value: JSBI.subtract(JSBI.BigInt(`0b${1}${'0'.repeat(56)}`), JSBI.BigInt(1)),
            },
            { expected: '13 00 00 00 00 00 00 00 01', value: JSBI.BigInt(`0b${1}${'0'.repeat(56)}`) },
            {
                expected: '13 ff ff ff ff ff ff ff ff',
                value: JSBI.subtract(JSBI.BigInt(`0b${1}${'0'.repeat(64)}`), JSBI.BigInt(1)),
            },
        ])('encodes $value', ({ expected, value }) => {
            expect(encodeCompact(value)).toEqual(
                // eslint-disable-next-line max-nested-callbacks
                Uint8Array.from(expected.split(' ').map((s) => parseInt(s, 16))),
            );
        });
    });
});
