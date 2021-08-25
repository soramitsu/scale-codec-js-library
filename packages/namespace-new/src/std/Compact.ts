import JSBI from 'jsbi';

export type Compact_Decoded = JSBI;

export type Compact_Encodable = JSBI;

export { encodeCompact as Compact_encode, decodeCompact as Compact_decode } from '@scale-codec/core';
