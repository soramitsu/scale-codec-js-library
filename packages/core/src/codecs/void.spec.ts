import { WalkerImpl } from '../util'
import { encodeVoid, decodeVoid } from './void'

test('Encodes into empty bytes', () => {
  expect(WalkerImpl.encode(null, encodeVoid)).toEqual(new Uint8Array())
})

test('Decodes into null result', () => {
  expect(WalkerImpl.decode(new Uint8Array(), decodeVoid)).toEqual(null)
})
