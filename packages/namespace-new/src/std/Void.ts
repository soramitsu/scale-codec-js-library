import { Encode, Decode } from '@scale-codec/core';

export type Void_Decoded = null;

export type Void_Encodable = null;

export const Void_encode: Encode<null> = () => new Uint8Array();

export const Void_decode: Decode<null> = () => [null, 0];
