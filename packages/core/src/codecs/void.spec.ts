import { describe, expect, test } from 'vitest'
import { WalkerImpl } from '../util'
import { decodeVoid, encodeVoid } from './void'

describe.concurrent('Array codec', () => {
  test('Encodes into empty bytes', () => {
    expect(WalkerImpl.encode(null, encodeVoid)).toEqual(new Uint8Array())
  })

  test('Decodes into null result', () => {
    expect(WalkerImpl.decode(new Uint8Array(), decodeVoid)).toEqual(null)
  })
})
