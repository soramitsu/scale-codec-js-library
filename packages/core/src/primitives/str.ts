import { concatUint8Arrays } from '@scale-codec/util';
import JSBI from 'jsbi';
import { encodeCompact, decodeCompact } from '../compact';
import { DecodeResult } from '../types';

const encoder = new TextEncoder();
const decoder = new TextDecoder('utf-8', {
    // do not allow invalid utf-8 sequences
    fatal: true,
});

/**
 * Decodes UTF-8 sequence of bytes into as string
 *
 * @remarks
 * Uses **whole** received buffer. Note that in SCALE strings represented with a `Compact` prefix so use
 * {@link decodeStrCompact} for it.
 */
export function decodeStr(bytes: Uint8Array): string {
    return decoder.decode(bytes);
}

/**
 * Encodes string to a UTF-8 sequence of bytes
 *
 * @remarks
 * Do not use it within SCALE spec directly, because strings require compact length prefix. Use
 * {@link encodeStrCompact} instead.
 */
export function encodeStr(str: string): Uint8Array {
    return encoder.encode(str);
}

/**
 * Decodes string by SCALE spec
 */
export function decodeStrCompact(buff: Uint8Array): DecodeResult<string> {
    const [length, offset] = decodeCompact(buff);
    const lenNum = JSBI.toNumber(length);
    const total = offset + lenNum;

    // assert(length.lten(MAX_LENGTH), () => `Text: length ${length.toString()} exceeds ${MAX_LENGTH}`);
    // assert(total <= value.length, () => `Text: required length less than remainder, expected at least ${total}, found ${value.length}`);

    return [decodeStr(buff.subarray(offset, total)), offset + lenNum];
}

/**
 * Encodes string by SCALE spec
 */
export function encodeStrCompact(str: string): Uint8Array {
    const encoded = encodeStr(str);
    return concatUint8Arrays([encodeCompact(JSBI.BigInt(encoded.length)), encoded]);
}
