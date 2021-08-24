import { Decode, Encode } from '@scale-codec/core';

/**
 * Codec is an object that contains an encoder and a decoder of some value `T`
 */
export interface Codec<D, E = D> {
    encode: Encode<E>;
    decode: Decode<D>;
}
