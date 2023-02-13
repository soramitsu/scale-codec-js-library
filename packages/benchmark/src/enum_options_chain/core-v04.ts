import { DecodeResult, Option, decodeEnum, decodeStruct, encodeEnum, encodeStruct } from 'scale-codec-core-v-4'
import { defineCodec } from '../types'

export interface Chain {
  inner: Option<Chain>
}

function encode(x: Chain): Uint8Array {
  return encodeStruct(x, { inner: (x) => encodeEnum(x, ENCODE_SCHEMA) }, ['inner'])
}

const ENCODE_SCHEMA = {
  None: { d: 0 },
  Some: { d: 1, encode },
}

function decode(x: Uint8Array): DecodeResult<Chain> {
  return decodeStruct(x, { inner: (x) => decodeEnum(x, DECODE_SCHEMA) }, ['inner'])
}

const DECODE_SCHEMA = {
  0: { v: 'None' },
  1: { v: 'Some', decode },
}

export default defineCodec<Chain>({
  encode,
  decode: (x) => decode(x)[0],
})
