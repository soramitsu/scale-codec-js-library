import { Decode, Encode, WalkerImpl } from '@scale-codec/core'
import { Codec } from '@scale-codec/definition-runtime'

export function defineCodec<T>(codec: CodecSimplified<T>): CodecSimplified<T> {
  return codec
}

export function defineCoreCodec<T>(encode: Encode<T>, decode: Decode<T>): CodecSimplified<T> {
  return {
    encode: (a) => WalkerImpl.encode(a, encode),
    decode: (a) => WalkerImpl.decode(a, decode),
  }
}

export function defineRuntimeCodec<T>(codec: Codec<T>): CodecSimplified<T> {
  return {
    encode: (v) => codec.toBuffer(v),
    decode: (v) => codec.fromBuffer(v),
  }
}

export type CodecSimplified<T> = {
  encode: (value: T) => Uint8Array
  decode: (input: Uint8Array) => T
}
