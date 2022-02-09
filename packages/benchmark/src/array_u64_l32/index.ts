import { Logger, setCurrentTracker } from '@scale-codec/definition-runtime'
import { suite, complete, cycle, add } from 'benny'
import { decode as decodePolka, encode as encodePolka } from './polka'
import { decode as decodeCore, encode as encodeCore } from './scale-codec-core'
import { decode as decodeCoreV4, encode as encodeCoreV4 } from './scale-codec-core-v4'
import { decode as decodeRuntime, encode as encodeRuntime } from './scale-codec-runtime'
import { decode as decodeRuntimeV8, encode as encodeRuntimeV8 } from './scale-codec-runtime-v8'

export default async function () {
    const NUMBERS = Array.from({ length: 32 }, (v, i) => BigInt(i * 1e9))
    const NUMBERS_ENCODED = encodeCore(NUMBERS)

    await suite(
        'Encode [u64; 32]',
        add('@scale-codec/core', () => {
            encodeCore(NUMBERS)
        }),
        add('@scale-codec/definition-runtime', () => {
            setCurrentTracker(null)
            encodeRuntime(NUMBERS)
        }),

        // Encoding is not currently tracked
        // add('@scale-codec/definition-runtime with tracking', () => {
        //     setCurrentTracker(null)
        //     new Logger().mount()
        //     encodeRuntime(NUMBERS)
        // }),

        add('@scale-codec/core@0.4.1', () => {
            encodeCoreV4(NUMBERS)
        }),
        add('@scale-codec/definition-runtime@0.8.1', () => {
            encodeRuntimeV8(NUMBERS)
        }),
        add('@polkadot/types-codec', () => {
            encodePolka(NUMBERS)
        }),
        cycle(),
        complete(),
    )

    await suite(
        'Decode [u64; 32]',
        add('@scale-codec/core', () => {
            decodeCore(NUMBERS_ENCODED.slice())
        }),
        add('@scale-codec/definition-runtime', () => {
            setCurrentTracker(null)
            decodeRuntime(NUMBERS_ENCODED.slice())
        }),
        add('@scale-codec/definition-runtime with tracking', () => {
            setCurrentTracker(null)
            new Logger().mount()
            decodeRuntime(NUMBERS_ENCODED.slice())
        }),
        add('@scale-codec/core@0.4.1', () => {
            decodeCoreV4(NUMBERS_ENCODED.slice())
        }),
        add('@scale-codec/definition-runtime@0.8.1', () => {
            decodeRuntimeV8(NUMBERS_ENCODED.slice())
        }),
        add('@polkadot/types-codec', () => {
            decodePolka(NUMBERS_ENCODED.slice())
        }),
        cycle(),
        complete(),
    )
}
