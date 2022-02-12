import { suite, complete, cycle, add } from 'benny'

import { Logger, setCurrentTracker } from '@scale-codec/definition-runtime'
import polka from './polka'
import scaleCodecCore from './scale-codec-core'
import scaleCodecCoreV4 from './scale-codec-core-v4'
import scaleCodecRuntime from './scale-codec-runtime'
import scaleCodecRuntimeV8 from './scale-codec-runtime-v8'
import { nativeToPolka } from './util'

export default async function () {
    const INPUT_BIGINTS = Array.from({ length: 32 }, (v, i) => BigInt(i * 1e9))
    const INPUT_POLKA = nativeToPolka(INPUT_BIGINTS)
    const NUMBERS_ENCODED = scaleCodecCore.encode(INPUT_BIGINTS)

    await suite(
        'Encode [u64; 32]',
        add('core', () => {
            scaleCodecCore.encode(INPUT_BIGINTS)
        }),
        add('runtime', () => {
            setCurrentTracker(null)
            scaleCodecRuntime.encode(INPUT_BIGINTS)
        }),

        add('core 0.4', () => {
            scaleCodecCoreV4.encode(INPUT_BIGINTS)
        }),
        add('runtime 0.8', () => {
            scaleCodecRuntimeV8.encode(INPUT_BIGINTS)
        }),
        add('@polkadot/types-codec', () => {
            polka.encode(INPUT_POLKA)
        }),
        cycle(),
        complete(),
    )

    await suite(
        'Decode [u64; 32]',
        add('core', () => {
            scaleCodecCore.decode(NUMBERS_ENCODED)
        }),
        add('runtime', () => {
            scaleCodecRuntime.decode(NUMBERS_ENCODED)
        }),
        add('core 0.4', () => {
            scaleCodecCoreV4.decode(NUMBERS_ENCODED)
        }),
        add('runtime 0.8', () => {
            scaleCodecRuntimeV8.decode(NUMBERS_ENCODED)
        }),
        add('@polkadot/types-codec', () => {
            polka.decode(NUMBERS_ENCODED)
        }),
        cycle(),
        complete(),
    )
}
