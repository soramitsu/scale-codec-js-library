import { JSBI, bigintCodec } from '@scale-codec/namespace-next';

export type Pure = JSBI;

export type Encodable = JSBI;

export const { encode, decode } = bigintCodec({
    bits: 128,
    signed: true,
    endianness: 'le'
})