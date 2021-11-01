import { DecodeResult } from './types';

export function mapDecodeResult<T, U>([value, len]: DecodeResult<T>, mapFn: (value: T) => U): DecodeResult<U> {
    return [mapFn(value), len];
}
