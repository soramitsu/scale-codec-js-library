import { STR_CODEC } from '../../codecs';

export type Pure = string;
export type Encodable = string;
export const { encode, decode } = STR_CODEC;
