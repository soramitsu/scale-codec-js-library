import {
    Enum,
    Encode,
    Decode,
    EnumDef,
    EnumDefToFactoryArgs,
    Option,
    Result,
    createOptionDecoder,
    createOptionEncoder,
    encodeFactory,
    WalkerImpl,
    encodeU8,
    decodeU8,
    encodeStr,
    decodeStr,
    createStructEncoder,
    createStructDecoder,
} from '@scale-codec/core'
import { Opaque } from 'type-fest'

interface Codec<Encoded, Decoded = Encoded> {
    encodeRaw: Encode<Encoded>
    decodeRaw: Decode<Decoded>
    fromBuffer: (src: ArrayBufferView) => Decoded
    toBuffer: (value: Encoded) => Uint8Array
}

const CODEX_CTX: Record<symbol, any> = {}

function useCodexCtx<T>(key: symbol): CodexCtx<T> {
    return {
        get: () => {
            if (key in CODEX_CTX) return CODEX_CTX[key]
            throw new Error(`Codecs context error: key not found (${String(key)})`)
        },
        set: (value) => {
            CODEX_CTX[key] = value
        },
    }
}

interface CodexCtx<T> {
    get: () => T
    set: (value: T) => void
}

function encodeFactoryByGetter<T>(getter: () => Encode<T>): Encode<T> {
    return encodeFactory(
        (val, walker) => getter()(val, walker),
        (val) => getter().sizeHint(val),
    )
}

function decodeFactoryByGetter<T>(getter: () => Decode<T>): Decode<T> {
    return (walker) => getter()(walker)
}

function codecImplWithCtx<C, E>(ctxEntry: CodexCtx<C>, ctx: C, encode: Encode<E>, decode: Decode<E>): CodecImpl<E> {
    return new CodecImpl<E, E>(
        encodeFactory(
            (val, walker) => (ctxEntry.set(ctx), encode(val, walker)),
            (val) => (ctxEntry.set(ctx), encode.sizeHint(val)),
        ),
        (walker) => (ctxEntry.set(ctx), decode(walker)),
    )
}

class CodecImpl<E, D = E> implements Codec<E, D> {
    public encodeRaw: Encode<E>
    public decodeRaw: Decode<D>

    public constructor(e: Encode<E>, d: Decode<D>) {
        this.encodeRaw = e
        this.decodeRaw = d
    }

    public fromBuffer(src: ArrayBufferView): D {
        return WalkerImpl.decode(src, this.decodeRaw)
    }

    public toBuffer(value: E): Uint8Array {
        return WalkerImpl.encode(value, this.encodeRaw)
    }
}

const optionCtx = useCodexCtx<Codec<any>>(Symbol('Option<T>'))

const encodeSomeGeneric: Encode<any> = encodeFactoryByGetter(() => optionCtx.get().encodeRaw)

const decodesomeGeneric: Decode<any> = (walker) => optionCtx.get().decodeRaw(walker)

const optionGenEncoder = createOptionEncoder(encodeSomeGeneric)
const optionGenDecoder = createOptionDecoder(decodesomeGeneric)

// eslint-disable-next-line no-inner-declarations
function experimentalOptionWith<T>(some: Codec<T>): Codec<Option<T>> {
    return codecImplWithCtx(optionCtx, some, optionGenEncoder, optionGenDecoder)
}

function combine<F, W>(fn: F, wi: W): F & { with: W } {
    fn.with = wi
    return fn
}

// eslint-disable-next-line no-import-assign
const Option: (<T>(...args: EnumDefToFactoryArgs<EnumDef<Option<T>>>) => Option<T>) & {
    with: <T>(type1: Codec<T>) => Codec<Option<T>>
} = combine<
    <T>(...args: EnumDefToFactoryArgs<EnumDef<Option<T>>>) => Option<T>,
    <T>(type1: Codec<T>) => Codec<Option<T>>
>((...args) => Enum.variant(...args), experimentalOptionWith)

type U8 = number

const U8 = new CodecImpl<U8>(encodeU8, decodeU8)

type Str = string

const Str = new CodecImpl<Str>(encodeStr, decodeStr)

// Option.with = experimentalOptionWith

console.log(Option.with(U8).toBuffer(Option('Some', 51)))

// MSG

function createStructFactory() {}

interface Msg__pure<M> {
    msg: M
    sender: Str
}

interface Msg<M> extends Opaque<Msg__pure<M>, 'Msg'> {}

const msgCtx = useCodexCtx<Record<string, Codec<any>>>(Symbol('Msg<M>'))



const msg__msgEncode = encodeFactoryByGetter(() => msgCtx.get()['msg'].encodeRaw)
const msg__msgDecode = decodeFactoryByGetter(() => msgCtx.get()['msg'].decodeRaw)

const msg__encoder = createStructEncoder<Msg<any>>([
    ['msg', msg__msgEncode],
    ['sender', Str.encodeRaw],
])

const msg__decoder = createStructDecoder<Msg<any>>([
    ['msg', msg__msgDecode],
    ['sender', Str.decodeRaw],
])

const Msg: (<M>(msg: Msg__pure<M>) => Msg<M>) & {
    with: <M>(codec: Codec<M>) => Codec<Msg<M>>
} = combine<<M>(msg: Msg__pure<M>) => Msg<M>, <M>(codec: Codec<M>) => Codec<Msg<M>>>(
    <T>(x: Msg__pure<T>) => x as Msg<T>,
    (codec) => {
        return codecImplWithCtx(msgCtx, { msg: codec }, msg__encoder, msg__decoder)
    },
)

console.log(Msg.with(U8).toBuffer(Msg({ sender: 'me', msg: 51 })))
