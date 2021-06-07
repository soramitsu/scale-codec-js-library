import { retrieveOffsetAndEncodedLength } from './retrieve-offset-and-length';
import { hexToBytes } from 'hada';
import JSBI from 'jsbi';

describe('retrieveOffsetAndEncodedLength', (): void => {
    it('decoded u8 value', (): void => {
        expect(retrieveOffsetAndEncodedLength(new Uint8Array([0b11111100]))).toEqual([1, JSBI.BigInt(63)]);
    });

    it('decodes from same u16 encoded value', (): void => {
        expect(retrieveOffsetAndEncodedLength(new Uint8Array([0b11111101, 0b00000111]))).toEqual([2, JSBI.BigInt(511)]);
    });

    it('decodes from same u32 encoded value (short)', (): void => {
        expect(retrieveOffsetAndEncodedLength(new Uint8Array([254, 255, 3, 0]))).toEqual(
            // since we use in-place, the words are different... HACK it
            [4, JSBI.signedRightShift(JSBI.leftShift(JSBI.BigInt(0xffff), JSBI.BigInt(16)), JSBI.BigInt(16))],
        );
    });

    it('decodes from same u32 encoded value (full)', (): void => {
        expect(retrieveOffsetAndEncodedLength(new Uint8Array([3, 249, 255, 255, 255]))).toEqual([
            5,
            JSBI.BigInt(0xfffffff9),
        ]);
    });

    it('decodes from same u32 as u64 encoded value (full, default)', (): void => {
        expect(retrieveOffsetAndEncodedLength(new Uint8Array([3 + ((4 - 4) << 2), 249, 255, 255, 255]))).toEqual([
            5,
            JSBI.BigInt(0xfffffff9),
        ]);
    });

    it('decodes an actual value', (): void => {
        expect(retrieveOffsetAndEncodedLength(Uint8Array.from(hexToBytes('0b00407a10f35a')))).toEqual([
            7,
            JSBI.BigInt('0x5af3107a4000'),
        ]);
    });

    it('decodes an actual value', () => {
        const [offset, len] = retrieveOffsetAndEncodedLength(Uint8Array.from(hexToBytes('0284d717')));

        expect(len.toString()).toEqual('100000000');
    });
});
