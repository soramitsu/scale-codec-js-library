import { Decode, Encode } from '../types'
import { decodeStr, encodeStr } from './str'
import { createSetDecoder, createSetEncoder } from './set'
import { createIntDecoder, createIntEncoder } from './int'
import { WalkerImpl } from '../util'
import { ensureDecodeImmutability } from './__tests__/util'

interface TestCase<T> {
  js: T[]
  bytes: number[]
  encode: Encode<T>
  decode: Decode<T>
}

function defCase<T>(v: TestCase<T>): TestCase<T> {
  return v
}

test.each([
  defCase({
    js: [2, 24, 30, 80],
    bytes: [16, 2, 0, 0, 0, 24, 0, 0, 0, 30, 0, 0, 0, 80, 0, 0, 0],
    encode: createIntEncoder('u32'),
    decode: createIntDecoder('u32'),
  }),
  defCase({
    js: ['one', '©∆˙©∫∫∫'],
    bytes: [
      8, 12, 111, 110, 101, 72, 194, 169, 226, 136, 134, 203, 153, 194, 169, 226, 136, 171, 226, 136, 171, 226, 136,
      171,
    ],
    encode: encodeStr,
    decode: decodeStr,
  }),
])('encode/decode set of $js', ({ js, bytes, encode, decode }: TestCase<unknown>) => {
  const set = new Set(js)
  const arr = new Uint8Array(bytes)
  const encodeSet = createSetEncoder(encode)
  const decodeSet = createSetDecoder(decode)

  expect(WalkerImpl.encode(set, encodeSet)).toEqual(arr)
  expect(WalkerImpl.decode(arr, decodeSet)).toEqual(set)
})

test('decode is immutable', () => {
  ensureDecodeImmutability(
    WalkerImpl.encode(new Set(['a', 'b', 'c']), createSetEncoder(encodeStr)),
    createSetDecoder(decodeStr),
  )
})
