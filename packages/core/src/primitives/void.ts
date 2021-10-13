import { DecodeResult } from '../types';

/**
 * Encoder to handle void types like `()` from Rust
 */
export function encodeVoid(voidValue?: null): Uint8Array {
    return new Uint8Array();
}

/**
 * Decoder to handle void types like `()` from Rust
 */
export function decodeVoid(bytes?: Uint8Array): DecodeResult<null> {
    return [null, 0];
}
