import { Decode, Encode, Walker } from './types'

export class SliceWalkerFinalOffsetError extends Error {
    public constructor(walker: Walker) {
        super(`offset (${walker.offset}) is not equal to array bytes length (${walker.arr.byteLength})`)
    }
}

export class WalkerImpl implements Walker {
    public static encode<T>(value: T, encode: Encode<T>): Uint8Array {
        const walker = new WalkerImpl(new Uint8Array(encode.sizeHint(value)))
        encode(value, walker)
        walker.checkFinalOffset()
        return walker.arr
    }

    public static decode<T>(source: Uint8Array, decode: Decode<T>): T {
        const walker = new WalkerImpl(source)
        const value = decode(walker)
        walker.checkFinalOffset()
        return value
    }

    public arr: Uint8Array
    public view: DataView
    public offset = 0

    public constructor(source: ArrayBufferView) {
        if (!ArrayBuffer.isView(source)) throw new Error(`Passed source is not an ArrayBufferView (${String(source)})`)
        this.arr = new Uint8Array(source.buffer, source.byteOffset, source.byteLength)
        this.view = new DataView(source.buffer, source.byteOffset, source.byteLength)
    }

    public checkFinalOffset() {
        if (this.offset !== this.arr.byteLength) throw new SliceWalkerFinalOffsetError(this)
    }

    public setOffset(value: number): this {
        this.offset = value
        return this
    }
}

export function encodeFactory<T>(fn: (value: T, walker: Walker) => void, sizeHint: (value: T) => number): Encode<T> {
    ;(fn as Encode<T>).sizeHint = sizeHint
    return fn as Encode<T>
}
