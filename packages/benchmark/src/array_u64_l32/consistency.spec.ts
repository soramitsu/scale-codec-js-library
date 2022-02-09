import { allArrayItemsShouldBeTheSame } from '../../test/util'
import * as polka from './polka'
import * as core from './scale-codec-core'
import * as coreV4 from './scale-codec-core-v4'
import * as runtime from './scale-codec-runtime'
import * as runtimeV8 from './scale-codec-runtime-v8'

const ENCODERS: ((arr: bigint[]) => Uint8Array)[] = [
    polka.encode,
    core.encode,
    coreV4.encode,
    runtime.encode,
    runtimeV8.encode,
]
const DECODERS: ((input: Uint8Array) => bigint[])[] = [
    polka.decode,
    core.decode,
    coreV4.decode,
    runtime.decode,
    runtimeV8.decode,
]

test('Different encoders are identical', () => {
    const INPUT = Array.from({ length: 32 }, (_, i) => BigInt(i))

    const result = ENCODERS.map((fn) => fn(INPUT))

    allArrayItemsShouldBeTheSame(result)
})

test('Different decoders are identical', () => {
    const NUMBERS = Array.from({ length: 32 }, (_, i) => BigInt(i))
    const ENCODED = ENCODERS[0](NUMBERS)

    const result = DECODERS.map((fn) => fn(ENCODED.slice()))

    allArrayItemsShouldBeTheSame(result)
})
