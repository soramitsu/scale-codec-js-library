import { describe, expect, it } from 'vitest'
import { WalkerImpl } from '../util'
import { decodeBool, encodeBool } from './bool'

describe.only('booleans', () => {
  for (const flag of [false, true]) {
    const byte = flag ? 1 : 0

    it(`encode ${flag} to ${byte}`, () => {
      expect(WalkerImpl.encode(flag, encodeBool)).toEqual(new Uint8Array([byte]))
    })

    it(`decode ${byte} to ${flag}`, () => {
      expect(WalkerImpl.decode(new Uint8Array([byte]), decodeBool)).toEqual(flag)
    })
  }
})
