import { allArrayItemsShouldBeTheSame } from '../../test/util'
import polka from './polka'
import scaleCodecCore from './scale-codec-core'
import scaleCodecCoreV4 from './scale-codec-core-v4'
import scaleCodecRuntime from './scale-codec-runtime'
import scaleCodecRuntimeV8 from './scale-codec-runtime-v8'

export function factoryValue(): bigint[] {
    return Array.from({ length: 32 }, (_, i) => BigInt(i))
}

const CODECS = [polka, scaleCodecCore, scaleCodecCoreV4, scaleCodecRuntime, scaleCodecRuntimeV8]

test('Different encoders are identical', () => {
    const INPUT = factoryValue()

    const result = CODECS.map((x) => x.encode(INPUT))

    allArrayItemsShouldBeTheSame(result)
})

test('Different decoders are identical', () => {
    const NUMBERS = factoryValue()
    const ENCODED = scaleCodecCore.encode(NUMBERS)

    const result = CODECS.map((x) => x.decode(ENCODED.slice()))

    allArrayItemsShouldBeTheSame(result)
})
