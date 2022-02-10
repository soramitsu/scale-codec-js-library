import { suite, complete, cycle, add } from 'benny'

import { Logger, setCurrentTracker } from '@scale-codec/definition-runtime'
import polka from './polka'
import scaleCodecCore from './scale-codec-core'
import scaleCodecCoreV4 from './scale-codec-core-v4'
import scaleCodecRuntime from './scale-codec-runtime'
import scaleCodecRuntimeV8 from './scale-codec-runtime-v8'

export default async function () {
    const NUMBERS = Array.from({ length: 32 }, (v, i) => BigInt(i * 1e9))
    const NUMBERS_ENCODED = scaleCodecCore.encode(NUMBERS)

    await suite(
        'Encode [u64; 32]',
        add('@scale-codec/core', () => {
            scaleCodecCore.encode(NUMBERS)
        }),
        add('@scale-codec/definition-runtime', () => {
            setCurrentTracker(null)
            scaleCodecRuntime.encode(NUMBERS)
        }),

        // Encoding is not currently tracked
        // add('@scale-codec/definition-runtime with tracking', () => {
        //     setCurrentTracker(null)
        //     new Logger().mount()
        //     encodeRuntime(NUMBERS)
        // }),

        add('@scale-codec/core@0.4.1', () => {
            scaleCodecCoreV4.encode(NUMBERS)
        }),
        add('@scale-codec/definition-runtime@0.8.1', () => {
            scaleCodecRuntimeV8.encode(NUMBERS)
        }),
        add('@polkadot/types-codec', () => {
            polka.encode(NUMBERS)
        }),
        cycle(),
        complete(),
    )

    await suite(
        'Decode [u64; 32]',
        add('@scale-codec/core', () => {
            scaleCodecCore.decode(NUMBERS_ENCODED.slice())
        }),
        add('@scale-codec/definition-runtime', () => {
            setCurrentTracker(null)
            scaleCodecRuntime.decode(NUMBERS_ENCODED.slice())
        }),
        add('@scale-codec/definition-runtime with tracking', () => {
            setCurrentTracker(null)
            new Logger().mount()
            scaleCodecRuntime.decode(NUMBERS_ENCODED.slice())
        }),
        add('@scale-codec/core@0.4.1', () => {
            scaleCodecCoreV4.decode(NUMBERS_ENCODED.slice())
        }),
        add('@scale-codec/definition-runtime@0.8.1', () => {
            scaleCodecRuntimeV8.decode(NUMBERS_ENCODED.slice())
        }),
        add('@polkadot/types-codec', () => {
            polka.decode(NUMBERS_ENCODED.slice())
        }),
        cycle(),
        complete(),
    )
}
