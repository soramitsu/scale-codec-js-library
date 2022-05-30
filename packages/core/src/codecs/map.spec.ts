import { expect, it } from 'vitest'
import { createIntDecoder, createIntEncoder } from './int'
import { createMapDecoder, createMapEncoder } from './map'
import { decodeStr, encodeStr } from './str'
import { WalkerImpl } from '../util'

it('Map<string, u32> is encoded as expected', () => {
  const MAP = new Map<string, number>([['bazzing', 69]])
  const ENCODED = Uint8Array.from([4, 28, 98, 97, 122, 122, 105, 110, 103, 69, 0, 0, 0])

  expect(WalkerImpl.encode(MAP, createMapEncoder(encodeStr, createIntEncoder('u32')))).toEqual(ENCODED)
  expect(WalkerImpl.decode(ENCODED, createMapDecoder(decodeStr, createIntDecoder('u32')))).toEqual(MAP)
})

it('Map<u32, u32> is encoded as expected', () => {
  const MAP = new Map<number, number>([
    [1, 2],
    [23, 24],
    [28, 30],
    [45, 80],
  ])
  const ENCODED = Uint8Array.from([
    16, 1, 0, 0, 0, 2, 0, 0, 0, 23, 0, 0, 0, 24, 0, 0, 0, 28, 0, 0, 0, 30, 0, 0, 0, 45, 0, 0, 0, 80, 0, 0, 0,
  ])
  const U32_ENCODE = createIntEncoder('u32')
  const U32_DECODE = createIntDecoder('u32')

  expect(WalkerImpl.encode(MAP, createMapEncoder(U32_ENCODE, U32_ENCODE))).toEqual(ENCODED)
  expect(WalkerImpl.decode(ENCODED, createMapDecoder(U32_DECODE, U32_DECODE))).toEqual(MAP)
})
