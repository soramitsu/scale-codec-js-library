import { Decode, Encode, Walker, WalkerImpl, encodeFactory } from '@scale-codec/core'
import { trackDecode } from './tracking'

/**
 * General interface for any codec
 */
export interface Codec<Encoded, Decoded = Encoded> {
  encodeRaw: Encode<Encoded>
  decodeRaw: Decode<Decoded>
  fromBuffer: (src: ArrayBufferView) => Decoded
  toBuffer: (value: Encoded) => Uint8Array
  // name: () => string
}

export type CodecAny = Codec<any, any>

// /**
//  * General {@link Codec} implementation that includes fragments & tracking functionality
//  */
// export class CodecImpl<E, D = E> implements Codec<E, D> {
//     public encodeRaw: Encode<E>
//     public decodeRaw: Decode<D>
//     public name: () => string
//     public fromBuffer: (src: ArrayBufferView) => D
//     public toBuffer: (value: E) => Uint8Array

//     public constructor(name: string, encode: Encode<E>, decode: Decode<D>) {
//         this.encodeRaw = encode
//         this.decodeRaw = (walker) => trackDecode(name, walker, decode)
//         this.name = () => name
//         this.toBuffer = (value) => WalkerImpl.encode(value, this.encodeRaw)
//         this.fromBuffer = (src) => WalkerImpl.decode(src, this.decodeRaw)
//     }

//     // public fromBuffer(this: this, src: ArrayBufferView): D {
//     //     return WalkerImpl.decode(src, this.decodeRaw)
//     // }

//     // public toBuffer(this: this, value: E): Uint8Array {
//     //     return WalkerImpl.encode(value, this.encodeRaw)
//     // }

//     // public name(this: this): string {
//     //     return this._name
//     // }
// }

export function trackableCodec<E, D = E>(name: string, encode: Encode<E>, decode: Decode<D>): Codec<E, D> {
  const decodeTracked: Decode<D> = (walker) => trackDecode(name, walker, decode)

  return {
    // name: () => name,
    encodeRaw: encode,
    decodeRaw: decodeTracked,
    toBuffer: (value) => WalkerImpl.encode(value, encode),
    fromBuffer: (src) => WalkerImpl.decode(src, decodeTracked),
  }
}

export type CodecValueEncodable<T extends Codec<any>> = T extends Codec<infer E, any> ? E : never

export type CodecValueDecoded<T extends Codec<any>> = T extends Codec<any, infer D> ? D : never

// /**
//  * Special {@link Codec} implementation to that wraps another codec and dispatches it via its getter.
//  * With this utility it is easy to implement cyclic dependencies between codecs.
//  *
//  * @remarks
//  *
//  * TODO optimize and cache got codec after the first dispatch?
//  */
// export class DynCodec<C extends CodecAny> implements Codec<CodecValueEncodable<C>, CodecValueDecoded<C>> {
//     public encodeRaw: Encode<CodecValueEncodable<C>>

//     public decodeRaw: Decode<CodecValueDecoded<C>>

//     public readonly codecGetter: () => C

//     public constructor(getter: () => C) {
//         this.codecGetter = getter

//         this.encodeRaw = encodeFactory(
//             (val, walker) => getter().encodeRaw(val, walker),
//             (val) => getter().encodeRaw.sizeHint(val),
//         )

//         this.decodeRaw = (walker) => getter().decodeRaw(walker)
//     }

//     public fromBuffer(this: this, src: ArrayBufferView): CodecValueDecoded<C> {
//         return this.codecGetter().fromBuffer(src)
//     }

//     public toBuffer(this: this, value: CodecValueEncodable<C>): Uint8Array {
//         return this.codecGetter().toBuffer(value)
//     }

//     public name(this: this): string {
//         return this.codecGetter().name()
//     }
// }

// /**
//  * See {@link DynCodec}. This function is a shorthand factory that is more minimize-friendly than `new DynCodec(...)`
//  */
// export function dynCodec<C extends CodecAny>(getter: () => C): DynCodec<C> {
//     return new DynCodec(getter)
// }

export function dynCodec<C extends CodecAny>(getter: () => C): Codec<CodecValueEncodable<C>, CodecValueDecoded<C>> {
  let codec: C | undefined

  const getCodec = (): C => {
    if (!codec) {
      codec = getter()
    }
    return codec
  }

  return {
    // name: () => (codec ?? getCodec()).name(),
    encodeRaw: encodeFactory(
      (val, walker) => (codec ?? getCodec()).encodeRaw(val, walker),
      (val) => (codec ?? getCodec()).encodeRaw.sizeHint(val),
    ),
    decodeRaw: (walker) => (codec ?? getCodec()).decodeRaw(walker),
    toBuffer: (value) => (codec ?? getCodec()).toBuffer(value),
    fromBuffer: (src) => (codec ?? getCodec()).fromBuffer(src),
  }
}
