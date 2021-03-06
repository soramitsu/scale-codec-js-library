import { describe, expect, test } from 'vitest'
import { A, B, C } from '../samples/aliases'
import { WalkerImpl, encodeStr } from '@scale-codec/definition-runtime'

describe.concurrent('Aliases', () => {
  test('A->B alias encodes as B', () => {
    const str = 'Koora'
    expect(A.toBuffer(str)).toEqual(B.toBuffer(str))
  })

  test('B->Str alias encodes as standalone string', () => {
    const str = 'Torii'
    expect(WalkerImpl.encode(str, encodeStr)).toEqual(B.toBuffer(str))
  })

  test('C (tuple with inner alias) encodes & decodes OK', () => {
    const tuple = C(['Hey', 123])

    expect(C.fromBuffer(C.toBuffer(tuple))).toEqual(tuple)
  })
})
