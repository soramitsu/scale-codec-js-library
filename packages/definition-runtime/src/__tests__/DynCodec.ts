import { expect, test } from 'vitest'
import { WalkerImpl, decodeStr, encodeStr } from '@scale-codec/core'
import { Codec, dynCodec, trackableCodec } from '../core'

const SAMPLE_STRING = 'Я узнал, что у меня / Есть огромная семья'
const SAMPLE_STRING_U8 = WalkerImpl.encode(SAMPLE_STRING, encodeStr)

function factory(): [original: Codec<string>, dyn: Codec<string>] {
  const original = trackableCodec('str', encodeStr, decodeStr)
  const dyn = dynCodec(() => original)

  return [original, dyn]
}

// test('.name() returns name of the original codec', () => {
//     const [original, dyn] = factory()

//     expect(dyn.name()).toEqual(original.name())
// })

test('.fromBuffer() works equally', () => {
  const [original, dyn] = factory()

  expect(dyn.fromBuffer(SAMPLE_STRING_U8)).toEqual(original.fromBuffer(SAMPLE_STRING_U8))
})

test('.toBuffer() works equally', () => {
  const [original, dyn] = factory()

  expect(dyn.toBuffer(SAMPLE_STRING)).toEqual(original.toBuffer(SAMPLE_STRING))
})

test.todo('test encodeRaw & decodeRaw, as well as original getter')
