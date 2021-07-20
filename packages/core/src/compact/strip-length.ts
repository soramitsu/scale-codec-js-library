import JSBI from 'jsbi';
import { retrieveOffsetAndEncodedLength } from './retrieve-offset-and-length';

/**
 * @description Removes the length prefix, returning both the total length (including the value + compact encoding)
 * and the decoded value with the correct length
 */
export function compactStripLength(input: Uint8Array): [number, Uint8Array] {
    const [offset, length] = retrieveOffsetAndEncodedLength(input);
    const total = offset + JSBI.toNumber(length);

    return [total, input.subarray(offset, total)];
}
