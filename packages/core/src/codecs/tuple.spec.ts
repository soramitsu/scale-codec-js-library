import { describe, expect, it } from 'vitest'
import { createTupleDecoder, createTupleEncoder } from './tuple'
import { decodeStr, encodeStr } from './str'
import { decodeBool, encodeBool } from './bool'
import { createVecDecoder, createVecEncoder } from './vec'
import { Decode, Encode } from '../types'
import { decodeI32, decodeI8, decodeU64, encodeI32, encodeI8, encodeU64 } from './int'
import { WalkerImpl } from '../util'

describe.concurrent('Tuple codec', () => {
  it('tuple (u64, String, Vec<i8>, (i32, i32), bool) encoded as expected', () => {
    // Arrange
    type Tuple = [bigint, string, number[], [number, number], boolean]

    const encodeTuple: Encode<Tuple> = createTupleEncoder([
      encodeU64,
      encodeStr,
      createVecEncoder(encodeI8),
      createTupleEncoder([encodeI32, encodeI32]),
      encodeBool,
    ])
    const decodeTuple: Decode<Tuple> = createTupleDecoder([
      decodeU64,
      decodeStr,
      createVecDecoder(decodeI8),
      createTupleDecoder([decodeI32, decodeI32]),
      decodeBool,
    ])

    const ENCODED = Uint8Array.from([
      64, 0, 0, 0, 0, 0, 0, 0, 24, 72, 101, 110, 110, 111, 63, 20, 7, 1, 22, 5, 214, 110, 239, 255, 255, 16, 248, 6, 0,
      1,
    ])
    const VALUE: Tuple = [64n, 'Henno?', [7, 1, 22, 5, -42], [-4242, 456720], true]

    // Act & Assert

    expect(WalkerImpl.encode(VALUE, encodeTuple)).toEqual(ENCODED)
    expect(WalkerImpl.decode(ENCODED, decodeTuple)).toEqual(VALUE)
  })

  it('tuple () encoded as expected', () => {
    expect(WalkerImpl.encode([], createTupleEncoder([]))).toEqual(new Uint8Array())
    expect(WalkerImpl.decode(new Uint8Array(), createTupleDecoder([]))).toEqual([])
  })
})
