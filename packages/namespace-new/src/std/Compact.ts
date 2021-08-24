import { JSBI } from '@scale-codec/namespace-next';

export type Pure = JSBI;

export type Encodable = JSBI;

export { encodeCompact as encode, decodeCompact as decode } from '@scale-codec/namespace-next';
