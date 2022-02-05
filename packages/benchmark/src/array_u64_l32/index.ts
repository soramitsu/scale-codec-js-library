import { suite, complete, cycle, add } from 'benny'
import { encode as encodePolka } from './polka'
import { encode as encodeCore } from './scale-codec-core'
import { encode as encodeCoreV4 } from './scale-codec-core-v4'
import { encode as encodeRuntime } from './scale-codec-runtime'

export default async function () {
    const INPUT = Array.from({ length: 32 }, (v, i) => BigInt(i * 1e9))

    await suite(
        'Encode [u64; 32]',
        add('@scale-codec/core', () => {
            encodeCore(INPUT)
        }),
        add('@scale-codec/core@0.4.1', () => {
            encodeCoreV4(INPUT)
        }),
        add('@scale-codec/definition-runtime', () => {
            encodeRuntime(INPUT)
        }),
        add('@polkadot/types-codec', () => {
            encodePolka(INPUT)
        }),
        cycle(),
        complete(),
    )
}
