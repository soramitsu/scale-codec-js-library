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
} from '@scale-codec/core'
import { Opaque } from 'type-fest'

// CTX

const CODEX_CTX: Record<symbol, any> = {}

function useCodexCtx<T>(key: symbol): {
    get: () => T
    set: (value: T) => void
} {
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

//

interface Codec<Encoded, Decoded = Encoded> {
    encodeRaw: Encode<Encoded>
    decodeRaw: Decode<Decoded>
    fromBuffer: (src: ArrayBufferView) => Decoded
    toBuffer: (value: Encoded) => Uint8Array
}

// interface Define<T> {
//     define: (value: T) => T
// }

// class EnumCodec<E extends Enum<any>> extends Codec<E> {

// }

type GenericsCount = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10

type GenericsCountToIds<C extends GenericsCount> = C extends 0
    ? []
    : C extends 1
    ? [string]
    : C extends 2
    ? [string, string]
    : C extends 3
    ? [string, string, string]
    : never

type GenericsIdsToCount<Ids extends string[]> = Ids extends []
    ? 0
    : Ids extends [string]
    ? 1
    : Ids extends [string, string]
    ? 2
    : never

interface EnumCodec<E extends Enum<any>> extends Codec<E> {
    variant: (...args: EnumDefToFactoryArgs<EnumDef<E>>) => E
}

interface EnumGeneric<E extends Enum<any>> {}

declare function createEnumCodec<E extends Enum<any>>(): EnumCodec<E>

declare function createEnumGenCodec<E extends Enum<any>, C extends GenericsCount>(
    id: [string, ...GenericsCountToIds<C>],
): EnumGeneric<E>

type EnumFactory<E extends Enum<any>> = (...args: EnumDefToFactoryArgs<EnumDef<E>>) => E

// primitives

type Str = string

declare const Str: Codec<Str>

type U32 = number

declare const U32: Codec<U32>

// Option

// declare const Option: (<T>(...args: EnumDefToFactoryArgs<EnumDef<Option<T>>>) => Option<T>) & {
//     with: <T>(type1: Codec<T>) => Codec<Option<T>>
// }

{
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

    const encodeSomeGeneric: Encode<any> = encodeFactory(
        (val, walker) => optionCtx.get().encodeRaw(val, walker),
        (val) => optionCtx.get().encodeRaw.sizeHint(val),
    )

    const decodesomeGeneric: Decode<any> = (walker) => optionCtx.get().decodeRaw(walker)

    const optionGenEncoder = createOptionEncoder(encodeSomeGeneric)
    const optionGenDecoder = createOptionDecoder(decodesomeGeneric)

    // eslint-disable-next-line no-inner-declarations
    function experimentalOptionWith<T>(some: Codec<T>): Codec<Option<T>> {
        return new CodecImpl<Option<T>, Option<T>>(
            encodeFactory(
                (val, walker) => (optionCtx.set(some), optionGenEncoder(val, walker)),
                (val) => (optionCtx.set(some), optionGenEncoder.sizeHint(val)),
            ),
            (walker) => (optionCtx.set(some), optionGenDecoder(walker)),
        )
    }
}

// const opt1 = Option<string>('None')
// const opt2 = Option<string>('Some', 'hey')
// // @ts-expect-error
// const opt3 = Option<string>('Some', 6123)
// const opt4: Option<number> = Option('Some', 1)

// {
//     let encoded = Option.with(Str).toBuffer(opt1)
//     // @ts-expect-error
//     encoded = Option.with(Str).toBuffer(Option<number>('None'))
//     encoded = Option.with(U32).toBuffer(opt4)
// }

// Result

declare const Result: <O, E>(...args: EnumDefToFactoryArgs<EnumDef<Result<O, E>>>) => Result<O, E>

const res1 = Result<number, string>('Ok', 1)
// @ts-expect-error
const res2 = Result<number, string>('Ok', 'asdf')
const res3 = Result<number, string>('Err', 'asdf')
// @ts-expect-error
const res4 = Result<number, string>('Err')

// Map

interface ScaleMap<K, V> extends Map<K, V> {}

declare const ScaleMap: (<K, V>(map: Map<K, V>) => ScaleMap<K, V>) & {
    with: <K, V>(key: Codec<K>, value: Codec<V>) => Codec<ScaleMap<K, V>>
}

// Vec

interface Vec<T> extends Array<T> {}

declare const Vec: <T>(items: Array<T>) => Vec<T>

// Array

// Custom - struct Msg<M> { msg: M, sender: Str }

interface Msg__pure<M> {
    msg: M
    sender: Str
}

interface Msg<M> extends Opaque<Msg__pure<M>, 'Msg'> {}

declare const Msg: <M>(msg: Msg__pure<M>) => Msg<M>

const msg1 = Msg<number>({ msg: 12, sender: 'me' })
// @ts-expect-error
const msg2 = Msg<boolean>({ msg: 12, sender: 'me' })
const msg3 = Msg<boolean>({ msg: false, sender: 'me' })

// Custom - struct Nested<N> { map: Map<Msg<N>, Option<N>>  }

interface Nested__pure<N> {
    map: ScaleMap<Msg<N>, Option<N>>
}

interface Nested<N> extends Opaque<Nested__pure<N>, 'Nested'> {}

declare const Nested: (<N>(value: Nested__pure<N>) => Nested<N>) & {
    with: <N>(type1: Codec<N>) => Codec<Nested<N>>
}

// @ts-expect-error
const nst1 = Nested<string>({})
const nst2 = Nested<string>({ map: ScaleMap(new Map()) })
// @ts-expect-error
const nst3 = Nested<string>({ map: ScaleMap(new Map<boolean, number>()) })
// @ts-expect-error
const nst4 = Nested<string>({ map: ScaleMap(new Map([[false, 1]])) })
const nst5 = Nested<string>({
    // @ts-expect-error
    map: ScaleMap(
        new Map([
            [
                {
                    msg: 12,
                    sender: '41',
                },
                Option('None'),
            ],
        ]),
    ),
})
const nst6 = Nested<string>({
    map: ScaleMap(
        new Map([
            [
                Msg({
                    msg: 'Correct',
                    sender: '41',
                }),
                Option('None'),
            ],
        ]),
    ),
})
