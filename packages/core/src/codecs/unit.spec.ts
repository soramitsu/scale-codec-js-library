import { describe, expect, test } from 'vitest'
import { WalkerImpl } from '../util'
import { decodeUnit, encodeUnit } from './unit'

describe.concurrent('Array codec', () => {
  test('Encodes into empty bytes', () => {
    expect(WalkerImpl.encode(null, encodeUnit)).toEqual(new Uint8Array())
  })

  test('Decodes into null result', () => {
    expect(WalkerImpl.decode(new Uint8Array(), decodeUnit)).toEqual(null)
  })
})
