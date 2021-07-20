import { decodeCompact } from './decode';
import { hexToBytes } from 'hada';
import JSBI from 'jsbi';

describe('decodeCompact', (): void => {
    it('decoded u8 value', (): void => {
        expect(decodeCompact(new Uint8Array([0b11111100]))).toEqual([JSBI.BigInt(63), 1]);
    });

    it('decodes from same u16 encoded value', (): void => {
        expect(decodeCompact(new Uint8Array([0b11111101, 0b00000111]))).toEqual([JSBI.BigInt(511), 2]);
    });

    it('decodes from same u32 encoded value (short)', (): void => {
        expect(decodeCompact(new Uint8Array([254, 255, 3, 0]))).toEqual(
            // since we use in-place, the words are different... HACK it
            [JSBI.signedRightShift(JSBI.leftShift(JSBI.BigInt(0xffff), JSBI.BigInt(16)), JSBI.BigInt(16)), 4],
        );
    });

    it('decodes from same u32 encoded value (full)', (): void => {
        expect(decodeCompact(new Uint8Array([3, 249, 255, 255, 255]))).toEqual([JSBI.BigInt(0xfffffff9), 5]);
    });

    it('decodes from same u32 as u64 encoded value (full, default)', (): void => {
        expect(decodeCompact(new Uint8Array([3 + ((4 - 4) << 2), 249, 255, 255, 255]))).toEqual([
            JSBI.BigInt(0xfffffff9),
            5,
        ]);
    });

    it('decodes an actual value', (): void => {
        expect(decodeCompact(Uint8Array.from(hexToBytes('0b00407a10f35a')))).toEqual([
            JSBI.BigInt('0x5af3107a4000'),
            7,
        ]);
    });

    it('decodes an actual value', () => {
        const [len] = decodeCompact(Uint8Array.from(hexToBytes('0284d717')));

        expect(len.toString()).toEqual('100000000');
    });
});
