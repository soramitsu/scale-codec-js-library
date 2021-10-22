import { DecodeResult } from '@scale-codec/core';

export function mapDecodeResult<A, B>(val: DecodeResult<A>, fn: (val: A) => B): DecodeResult<B> {
    return [fn(val[0]), val[1]];
}
