import { createStructEncoder, createStructDecoder } from './struct'
import { encodeStr, decodeStr } from './str'
import { createIntEncoder, createIntDecoder } from './int'
import { WalkerImpl } from '../util'
import { ensureDecodeImmutability } from './__tests__/util'

describe('struct with primitives encoded as expected', () => {
  type Struct = {
    foo: string
    // u32
    bar: number
  }

  const STRUCT: Struct = {
    foo: 'bazzing',
    bar: 69,
  }

  const ENCODED = Uint8Array.from([28, 98, 97, 122, 122, 105, 110, 103, 69, 0, 0, 0])

  it('encode', () => {
    const encode = createStructEncoder<Struct>([
      ['foo', encodeStr],
      ['bar', createIntEncoder('u32')],
    ])

    expect(WalkerImpl.encode(STRUCT, encode)).toEqual(ENCODED)
  })

  it('decode', () => {
    const decode = createStructDecoder<Struct>([
      ['foo', decodeStr],
      ['bar', createIntDecoder('u32')],
    ])

    expect(WalkerImpl.decode(ENCODED, decode)).toEqual(STRUCT)
  })

  it('decode is immutable', () => {
    ensureDecodeImmutability(
      ENCODED,
      createStructDecoder<Struct>([
        ['foo', decodeStr],
        ['bar', createIntDecoder('u32')],
      ]),
    )
  })
})
