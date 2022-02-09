import { decodeStr, encodeStr, WalkerImpl } from '@scale-codec/core'
import { CodecImpl, DynCodec } from '../core'

const SAMPLE_STRING = 'Я узнал, что у меня / Есть огромная семья'
const SAMPLE_STRING_U8 = WalkerImpl.encode(SAMPLE_STRING, encodeStr)

function factory(): [original: CodecImpl<string>, dyn: DynCodec<CodecImpl<string>>] {
    const original = new CodecImpl('str', encodeStr, decodeStr)
    const dyn = new DynCodec(() => original)

    return [original, dyn]
}

test('.name() returns name of the original codec', () => {
    const [original, dyn] = factory()

    expect(dyn.name()).toEqual(original.name())
})

test('.fromBuffer() works equally', () => {
    const [original, dyn] = factory()

    expect(dyn.fromBuffer(SAMPLE_STRING_U8)).toEqual(original.fromBuffer(SAMPLE_STRING_U8))
})

test('.toBuffer() works equally', () => {
    const [original, dyn] = factory()

    expect(dyn.toBuffer(SAMPLE_STRING)).toEqual(original.toBuffer(SAMPLE_STRING))
})

test.todo('test encodeRaw & decodeRaw, as well as original getter')
