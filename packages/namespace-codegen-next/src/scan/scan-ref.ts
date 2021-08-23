import { ParsedRef } from '../types';
import { isStd } from './std';
import { ScanParams } from './types';

// export type ScanRefResult = Result<ParsedRef, ScanError>;

/**
 * Checks is (1) ref has a valid name, (2) is it STD or (3) is it in known types.
 * If all is ok, than returns it in a parsed form (as array of parts separated by dot) and ???
 * If it is not ok, than it will return an error
 */
export function scanRef(ref: string, params: ScanParams): ParsedRef {
    if (isStd(ref)) {
        return [ref];
    }

    if (!params.isKnownType(ref)) throw new Error(`Undefined ref: ${ref}`);

    return ref.split('.');
}
