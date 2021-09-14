import { DecodeResult } from '../types';

export function encodeVoid(voidValue?: null): Uint8Array {
    return new Uint8Array();
}

export function decodeVoid(bytes?: Uint8Array): DecodeResult<null> {
    return [null, 0];
}
