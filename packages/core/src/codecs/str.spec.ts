import { fromHex, toHex } from '@scale-codec/util'
import { encodeStr as _, decodeStr, encodeStr } from './str'
import { WalkerImpl } from '../util'
import RUST_STR_SAMPLES from '../../../rust-samples/output-strings.json'

describe('encodeStr', () => {
  it.each(RUST_STR_SAMPLES)('can encode $src', ({ src, hex_scale }) => {
    expect(toHex(WalkerImpl.encode(src, encodeStr))).toEqual(hex_scale)
  })
})

describe('decodeStr', () => {
  it.each(RUST_STR_SAMPLES)('can decode to $src', ({ src, hex_scale }) => {
    expect(WalkerImpl.decode(fromHex(hex_scale), decodeStr)).toEqual(src)
  })

  it('correct decoded length for ASCII', () => {
    const TEXT = 'abcde'
    const encoded = WalkerImpl.encode(TEXT, encodeStr)

    expect(() => WalkerImpl.decode(encoded, decodeStr)).not.toThrow()
  })

  it('correct decoded length for non-ASCII', () => {
    const TEXT = '中文'
    const encoded = WalkerImpl.encode(TEXT, encodeStr)

    expect(() => WalkerImpl.decode(encoded, decodeStr)).not.toThrow()
  })
})
