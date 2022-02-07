import {
    Decode,
    Encode,
    Walker,
    encodeFactory,
    WalkerImpl,
    createArrayEncoder,
    createArrayDecoder,
    BigIntTypes,
    createBigIntEncoder,
    createBigIntDecoder,
} from '@scale-codec/core'

import { trackDecode } from '../tracking'

// interface Codec<T> {
//     encode: Encode<T>
//     decode: Decode<T>
//     fromBuffer: (src: ArrayBufferView) => T
//     toBuffer: (val: T) => Uint8Array
// }

class Codec<T> {
    public encode: Encode<T>
    public decode: Decode<T>

    public constructor(name: string, encode: Encode<T>, decode: Decode<T>) {
        this.encode = makeEncodeWithSkipping(encode)
        this.decode = (walker) => trackDecode(name, walker, decode)
    }

    public fromBuffer(src: ArrayBufferView): T {
        return WalkerImpl.decode(src, this.decode)
    }

    public toBuffer(val: T): Uint8Array {
        return WalkerImpl.encode(val, this.encode)
    }
}

const MARK_SKIP_ENCODING = Symbol('SkipEncoding')

interface MarkedToSkipEncoding {
    [MARK_SKIP_ENCODING]: Uint8Array
}

type CodecValue<T extends Codec<any>> = T extends Codec<infer V> ? V : never

function isMarkedToSkip(value: unknown): value is MarkedToSkipEncoding {
    return !!(value && (value as MarkedToSkipEncoding)[MARK_SKIP_ENCODING])
}

function trySkipEncoding(value: unknown, walker: Walker): boolean {
    if (isMarkedToSkip(value)) {
        walker.u8.set(value[MARK_SKIP_ENCODING], walker.idx)
        walker.idx += value[MARK_SKIP_ENCODING].byteLength
        return true
    }
    return false
}

function trySkipEncodingSizeHint(value: unknown): number | undefined {
    if (isMarkedToSkip(value)) {
        return value[MARK_SKIP_ENCODING].byteLength
    }
    return undefined
}

function makeEncodeWithSkipping<T>(encode: Encode<T>): Encode<T | MarkedToSkipEncoding> {
    return encodeFactory(
        (val, walker) => {
            if (trySkipEncoding(val, walker)) return
            encode(val as T, walker)
        },
        (val) => trySkipEncodingSizeHint(val) ?? encode.sizeHint(val as T),
    )
}

function createArrayCodec<T>(name: string, itemCodec: Codec<T>, len: number): Codec<T[]> {
    return new Codec(name, createArrayEncoder(itemCodec.encode, len), createArrayDecoder(itemCodec.decode, len))
}

function createBigIntCodec(ty: BigIntTypes): Codec<bigint> {
    return new Codec(ty, createBigIntEncoder(ty), createBigIntDecoder(ty))
}

const U64: Codec<bigint> = createBigIntCodec('u64')

export const Array_u64_l32: Codec<bigint[]> = createArrayCodec('Array_u64_l32', U64, 32)
