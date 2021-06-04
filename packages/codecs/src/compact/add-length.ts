import JSBI from 'jsbi';
import { concatUint8Arrays } from '../shared';
import { encodeBigIntCompact } from './encode-big-int';

/**
 * @name compactAddLength
 * @description Adds a length prefix to the input value
 */
export function compactAddLength(input: Uint8Array): Uint8Array {
    return concatUint8Arrays(encodeBigIntCompact(JSBI.BigInt(input.length)), input);
}
