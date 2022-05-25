import { Codec, Decode, decodeStruct, Encode, encodeStruct } from '@scale-codec/core'
import { CompatibleNamespaceKeys, NamespaceCodec, StrKeys } from '../types'

// mapping to real namespace keys
type StructDefinition<N, S> = {
  [K in StrKeys<S>]: [K, CompatibleNamespaceKeys<N, S[K]>]
}[StrKeys<S>][]

export function defStruct<N, S>(defs: StructDefinition<N, S>): NamespaceCodec<S, N> {
  return ({ dynCodec }) => {
    const scaleEncoders: Record<string, Encode<any>> = {}
    const scaleDecoders: Record<string, Decode<any>> = {}

    const order: StrKeys<S>[] = []

    for (const [prop, ref] of defs) {
      ;({ encode: scaleEncoders[prop], decode: scaleDecoders[prop] } = dynCodec(ref))

      order.push(prop)
    }

    const scale: Codec<S> = {
      encode: (v) => encodeStruct<any>(v, scaleEncoders, order),
      decode: (b) => decodeStruct<any>(b, scaleDecoders, order),
    }

    return scale
  }
}
