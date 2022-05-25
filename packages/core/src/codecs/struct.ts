import { Encode, Decode, Walker } from '../types'
import { encodeFactory } from '../util'

export type StructEncoders<T> = { [K in keyof T]: [K, Encode<T[K]>] }[keyof T][]

export type StructDecoders<T> = { [K in keyof T]: [K, Decode<T[K]>] }[keyof T][]

export function encodeStruct<T extends {}>(struct: T, encoders: StructEncoders<T>, walker: Walker): void {
  for (let i = 0, len = encoders.length, encoder = null; i < len; i++) {
    encoder = encoders[i]
    encoder[1](struct[encoder[0]], walker)
  }
}

export function encodeStructSizeHint<T extends {}>(struct: T, encoders: StructEncoders<T>): number {
  let sum = 0
  for (let i = encoders.length - 1, encoder = null; i >= 0; i--) {
    encoder = encoders[i]
    sum += encoder[1].sizeHint(struct[encoder[0]])
  }
  return sum
}

export function createStructEncoder<T extends {}>(encoders: StructEncoders<T>): Encode<T> {
  return encodeFactory(
    (val, walker) => encodeStruct(val, encoders, walker),
    (val) => encodeStructSizeHint(val, encoders),
  )
}

export function decodeStruct<T extends {}>(walker: Walker, decoders: StructDecoders<T>): T {
  const struct: T = {} as any
  for (let i = 0, len = decoders.length, decoder = null; i < len; i++) {
    decoder = decoders[i]
    struct[decoder[0]] = decoder[1](walker)
  }
  return struct
}

export function createStructDecoder<T extends {}>(decoders: StructDecoders<T>): Decode<T> {
  return (walker) => decodeStruct(walker, decoders)
}
