import { Decode, Encode, encodeFactory, WalkerImpl, Walker } from '@scale-codec/core'
import { trackDecode } from './tracking'

/**
 * General interface for any codec
 */
export interface Codec<Encoded, Decoded = Encoded> {
    encodeRaw: Encode<Encoded>
    decodeRaw: Decode<Decoded>
    fromBuffer: (this: this, src: ArrayBufferView) => Decoded
    toBuffer: (this: this, value: Encoded) => Uint8Array
    name: (this: this) => string
}

export type CodecAny = Codec<any, any>

/**
 * Utility class to skip encoding of some data fragment
 */
export class Fragment {
    public readonly bytes: Uint8Array

    public constructor(bytes: Uint8Array) {
        this.bytes = bytes
    }

    public encode(this: this, walker: Walker): void {
        walker.u8.set(this.bytes, walker.idx)
        walker.idx += this.bytes.byteLength
    }

    public encodeSizeHint(this: this): number {
        return this.bytes.byteLength
    }
}

/**
 * Codec that allows {@link Fragment} as its encode input
 */
export type FragmentCodec<E, D = E> = Codec<E | Fragment, D>

/**
 * General {@link Codec} implementation that includes fragments & tracking functionality
 */
export class CodecImpl<E, D = E> implements FragmentCodec<E, D> {
    public encodeRaw: Encode<E | Fragment>

    public decodeRaw: Decode<D>

    private _name: string

    public constructor(name: string, encode: Encode<E>, decode: Decode<D>) {
        this.encodeRaw = encodeFactory(
            (val, walker) => {
                if (val instanceof Fragment) return val.encode(walker)
                else encode(val, walker)
            },
            (val) => {
                if (val instanceof Fragment) return val.encodeSizeHint()
                return encode.sizeHint(val)
            },
        )

        this.decodeRaw = (walker) => trackDecode(name, walker, decode)

        this._name = name
    }

    public fromBuffer(this: this, src: ArrayBufferView): D {
        return WalkerImpl.decode(src, this.decodeRaw)
    }

    public toBuffer(this: this, val: E | Fragment): Uint8Array {
        return WalkerImpl.encode(val, this.encodeRaw)
    }

    public name(this: this): string {
        return this._name
    }
}

export type CodecValueEncodable<T extends Codec<any>> = T extends Codec<infer E, any> ? E : never

export type CodecValueDecoded<T extends Codec<any>> = T extends Codec<any, infer D> ? D : never

/**
 * Special {@link Codec} implementation to that wraps another codec and dispatches it via its getter.
 * With this utility it is easy to implement cyclic dependencies between codecs.
 *
 * @remarks
 *
 * TODO optimize and cache got codec after the first dispatch?
 */
export class DynCodec<C extends Codec<any, any>> implements Codec<CodecValueEncodable<C>, CodecValueDecoded<C>> {
    public encodeRaw: Encode<CodecValueEncodable<C>>

    public decodeRaw: Decode<CodecValueDecoded<C>>

    public readonly codecGetter: () => C

    public constructor(getter: () => C) {
        this.codecGetter = getter

        this.encodeRaw = encodeFactory(
            (val, walker) => getter().encodeRaw(val, walker),
            (val) => getter().encodeRaw.sizeHint(val),
        )

        this.decodeRaw = (walker) => getter().decodeRaw(walker)
    }

    public fromBuffer(this: this, src: ArrayBufferView): CodecValueDecoded<C> {
        return this.codecGetter().fromBuffer(src)
    }

    public toBuffer(this: this, value: CodecValueEncodable<C>): Uint8Array {
        return this.codecGetter().toBuffer(value)
    }

    public name(this: this): string {
        return this.codecGetter().name()
    }
}
