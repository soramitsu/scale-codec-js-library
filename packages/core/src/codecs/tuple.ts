import { Decode, Encode, Walker } from '../types'
import { encodeFactory } from '../util'

export type TupleEncoders<Tuple extends any[]> = Tuple extends [infer Head, ...infer Tail]
  ? [Encode<Head>, ...TupleEncoders<Tail>]
  : []

export type TupleDecoders<Tuple extends any[]> = Tuple extends [infer Head, ...infer Tail]
  ? [Decode<Head>, ...TupleDecoders<Tail>]
  : []

export function encodeTuple<T extends any[]>(tuple: T, encoders: TupleEncoders<T>, walker: Walker): void {
  for (let i = 0, len = tuple.length; i < len; i++) {
    ;(encoders[i] as Encode<any>)(tuple[i], walker)
  }
}
export function encodeTupleSizeHint<T extends any[]>(tuple: T, encoders: TupleEncoders<T>): number {
  // eslint-disable-next-line one-var
  let size = 0,
    i = tuple.length
  while (--i >= 0) {
    size += (encoders[i] as Encode<any>).sizeHint(tuple[i])
  }
  return size
}

export function decodeTuple<T extends any[]>(walker: Walker, decoders: TupleDecoders<T>): T {
  const tuple = new Array(decoders.length)

  for (let i = 0, len = tuple.length; i < len; i++) {
    tuple[i] = (decoders[i] as Decode<any>)(walker)
  }

  return tuple as T
}

export function createTupleEncoder<T extends any[]>(encoders: TupleEncoders<T>): Encode<T> {
  return encodeFactory(
    (tuple, walker) => encodeTuple(tuple, encoders, walker),
    (tuple) => encodeTupleSizeHint(tuple, encoders),
  )
}

export function createTupleDecoder<T extends any[]>(decoders: TupleDecoders<T>): Decode<T> {
  return (walker) => decodeTuple(walker, decoders)
}
