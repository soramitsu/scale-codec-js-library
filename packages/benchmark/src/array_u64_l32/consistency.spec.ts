import { assertAllCodecsDecodeTheSame, assertAllCodecsEncodeTheSame } from '../../test/util'
import polka from './polka'
import scaleCodecCore from './scale-codec-core'
import scaleCodecCoreV4 from './scale-codec-core-v4'
import scaleCodecRuntime from './scale-codec-runtime'
import scaleCodecRuntimeV8 from './scale-codec-runtime-v8'

export function factoryValue(): bigint[] {
    return Array.from({ length: 32 }, (_, i) => BigInt(i))
}

const CODECS = { polka, scaleCodecCore, scaleCodecCoreV4, scaleCodecRuntime, scaleCodecRuntimeV8 }

test('Different encoders are identical', () => {
    const INPUT = factoryValue()

    assertAllCodecsEncodeTheSame(INPUT, CODECS)
})

test('Different decoders are identical', () => {
    const NUMBERS = factoryValue()
    const ENCODED = scaleCodecCore.encode(NUMBERS)

    assertAllCodecsDecodeTheSame(ENCODED, CODECS)
})
