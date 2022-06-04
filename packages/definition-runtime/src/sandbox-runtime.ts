/* eslint-disable max-params */
import {
  Decode,
  Encode,
  EnumDecoders,
  EnumEncoders,
  Option,
  StructDecoders,
  StructEncoders,
  VariantFactoryArgs,
  WalkerImpl,
  createEnumDecoder,
  createEnumEncoder,
  createStructDecoder,
  createStructEncoder,
  decodeStr,
  decodeU8,
  encodeFactory,
  encodeStr,
  encodeU8,
  variant,
} from '@scale-codec/core'

// add name for debug?
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

class Context<T> {
  private _state: T | undefined

  public get state(): T {
    if (!this._state) throw new Error('wtf')
    return this._state
  }

  public set state(value: T) {
    this._state = value
  }
}

function createContext<T>(): CodexCtx<T> {
  let value: T

  return {
    get: () => {
      if (!value) throw new Error('wrf')
      return value
    },
    set: (val) => {
      value = val
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

function ctxProviderCodecImpl<S, E>(ctx: Context<S>, state: S, encode: Encode<E>, decode: Decode<E>): CodecImpl<E> {
  return new CodecImpl<E, E>(
    encodeFactory(
      (val, walker) => {
        ctx.state = state
        // ctxEntry.set(ctx)
        encode(val, walker)
      },
      (val) => {
        ctx.state = state
        // ctxEntry.set(ctx)
        return encode.sizeHint(val)
      },
    ),
    (walker) => {
      ctx.state = state
      // ctxEntry.set(ctx)
      return decode(walker)
    },
  )
}

class GenericBinding {
  // public static dynOrCodec<T extends Codec<any>>()

  public readonly id: string
  public constructor(id: string) {
    this.id = id
  }
}

function genericBinding(id: string): GenericBinding {
  return new GenericBinding(id)
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

function dynCodecImpl<E, D = E>(dynCodec: () => Codec<E, D>): CodecImpl<E, D> {
  return new CodecImpl(
    encodeFactoryByGetter(() => dynCodec().encodeRaw),
    decodeFactoryByGetter(() => dynCodec().decodeRaw),
  )
}

type AnyWithFn = (...args: Codec<any>[]) => Codec<any>

type CodecName = string | string[]

function normalizeCodecName(name: CodecName): [name: string, generics: string[]] {
  const [nameOnly, ...generics] = typeof name === 'string' ? [name] : name
  return [nameOnly, generics]
}

function createContextState(generics: string[], types: Codec<any>[]): Record<string, Codec<any>> {
  const state: Record<string, Codec<any>> = {}
  for (let i = 0; i < generics.length; i++) {
    const key = generics[i]
    const codec = types[i]
    state[key] = codec
  }
  return state
}

function combine<F, W>(fn: F, wi: W): F & { with: W } {
  ;(fn as any).with = wi
  return fn as any
}

function structCodec<F extends (value: any) => any, W extends AnyWithFn>(
  nameWithGenerics: CodecName,
  schema: Array<[field: string, codec: Codec<any> | GenericBinding]>,
): F & {
  with: W
} {
  const [name, generics] = normalizeCodecName(nameWithGenerics)

  const ctx = new Context<Record<string, Codec<any>>>()

  const structEncoders: StructEncoders<any> = []
  const structDecoders: StructDecoders<any> = []

  for (const [field, codecOrGenericBinding] of schema) {
    const codec =
      codecOrGenericBinding instanceof GenericBinding
        ? dynCodecImpl(() => ctx.state[codecOrGenericBinding.id])
        : codecOrGenericBinding

    structEncoders.push([field, codec.encodeRaw])
    structDecoders.push([field, codec.decodeRaw])
  }

  const encoder = createStructEncoder(structEncoders)
  const decoder = createStructDecoder(structDecoders)

  return combine<F, W>(
    ((x: any) => x) as any,
    ((...types: Codec<any>[]) => {
      const state = createContextState(generics, types)
      return ctxProviderCodecImpl(ctx, state, encoder, decoder)
    }) as any,
  )
}

function enumCodec<F extends (...args: any) => any, W extends AnyWithFn>(
  name: CodecName,
  schema: Array<[variantName: string, discriminant: number, codec?: Codec<any> | GenericBinding]>,
): F & { with: W } {
  const [nameOnly, generics] = normalizeCodecName(name)

  type ContextState = Record<string, Codec<any>>
  const ctx = new Context<ContextState>()

  const encoders: EnumEncoders = {}
  const decoders: EnumDecoders = {}

  for (const [item, dis, maybeCodec] of schema) {
    if (maybeCodec) {
      const codec = maybeCodec instanceof GenericBinding ? dynCodecImpl(() => ctx.state[maybeCodec.id]) : maybeCodec
      encoders[item] = [dis, codec.encodeRaw]
      decoders[dis] = [item, codec.decodeRaw]
    } else {
      encoders[item] = dis
      decoders[dis] = item
    }
  }

  const encoder = createEnumEncoder(encoders)
  const decoder = createEnumDecoder(decoders)

  return combine<F, W>(
    ((...args: any) => variant<any>(...args)) as F,
    ((...types: Codec<any>[]): Codec<any> => {
      const state = createContextState(generics, types)
      return ctxProviderCodecImpl(ctx, state, encoder, decoder)
    }) as W,
  )
}

// Option<T>

// eslint-disable-next-line no-import-assign
const Option = enumCodec<
  // variant factory
  <T>(...args: VariantFactoryArgs<Option<T>>) => Option<T>,
  // with
  <T>(some: Codec<T>) => Codec<Option<T>>
>(
  ['Option', 'T'],
  [
    ['None', 0],
    ['Some', 1, genericBinding('T')],
  ],
)

// Primitives

type U8 = number

const U8 = new CodecImpl<U8>(encodeU8, decodeU8)

type Str = string

const Str = new CodecImpl<Str>(encodeStr, decodeStr)

console.log(Option.with(U8).toBuffer(Option('Some', 51)))

// MSG

interface Msg<M> {
  msg: M
  sender: Str
}

const Msg = structCodec<
  // define value factory
  <M>(value: Msg<M>) => Msg<M>,
  // codec factory
  <M>(type1: Codec<M>) => Codec<Msg<M>>
>(
  ['Msg', 'M'],
  [
    ['msg', genericBinding('M')],
    ['sender', Str],
  ],
)

console.log(Msg.with(U8).toBuffer(Msg({ sender: 'me', msg: 51 })))

console.log(
  Msg.with(Msg.with(Msg.with(Option.with(Str)))).toBuffer(
    Msg({
      sender: 'me',
      msg: Msg({
        sender: 'you',
        msg: Msg({
          sender: 'they',
          msg: Option('None'),
        }),
      }),
    }),
  ),
)
