import { intCodec } from '@scale-codec/namespace-next';

export type Pure = number;

export type Encodable = number;

export const { encode, decode } = intCodec({
    bits: 32,
    signed: true,
    endianness: 'le'
})