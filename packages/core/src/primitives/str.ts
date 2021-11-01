import { decodeUint8Vec, encodeUint8Vec } from '../containers';
import { DecodeResult } from '../types';
import { mapDecodeResult } from '../util';

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
 * {@link decodeStr} for it.
 */
export function decodeStrRaw(bytes: Uint8Array): string {
    return decoder.decode(bytes);
}

/**
 * Encodes string to a UTF-8 sequence of bytes
 *
 * @remarks
 * Do not use it within SCALE spec directly, because strings require compact length prefix. Use
 * {@link encodeStr} instead.
 */
export function encodeStrRaw(str: string): Uint8Array {
    return encoder.encode(str);
}

/**
 * Decodes string by SCALE spec
 */
export function decodeStr(bytes: Uint8Array): DecodeResult<string> {
    return mapDecodeResult(decodeUint8Vec(bytes), decodeStrRaw);
}

/**
 * Encodes string by SCALE spec
 */
export function encodeStr(str: string): Uint8Array {
    return encodeUint8Vec(encodeStrRaw(str));
}
