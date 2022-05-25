import { Codec, decodeArray, encodeArray } from '@scale-codec/core'
import { assert } from '@scale-codec/util'
import { NamespaceCodec } from '../types'

export function defArray<N, K extends keyof N>(itemRef: K, len: number): NamespaceCodec<N[K][], N> {
  return ({ dynCodec }) => {
    const { encode, decode } = dynCodec(itemRef)

    return {
      encode: (v) => encodeArray(v, encode, len),
      decode: (b) => decodeArray(b, decode, len),
    }
  }
}

export function defBytesArray(len: number): Codec<Uint8Array> {
  return {
    encode: (decoded) => {
      assert(decoded.length === len, () => `expected exactly ${len} bytes, received ${decoded.length}`)
      return decoded
    },
    decode: (encoded) => [encoded.subarray(0, len), len],
  }
}
