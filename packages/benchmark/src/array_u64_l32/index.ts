import { suite, complete, cycle, add } from 'benny'

import polka from './polka'
import scaleCodecCore from './scale-codec-core'
import scaleCodecCoreV4 from './scale-codec-core-v4'
import scaleCodecRuntime from './scale-codec-runtime'
import scaleCodecRuntimeV8 from './scale-codec-runtime-v8'
import { nativeToPolka } from './util'
import { saveCustom } from '../shared'
import { caseCoreCurrent, caseCorePre, casePolka, caseRuntimeCurrent, caseRuntimePre } from '../util'

export default async function () {
    const INPUT_BIGINTS = Array.from({ length: 32 }, (v, i) => BigInt(i * 1e9))
    const INPUT_POLKA = nativeToPolka(INPUT_BIGINTS)
    const NUMBERS_ENCODED = scaleCodecCore.encode(INPUT_BIGINTS)

    await suite(
        'Array [u64; 32]',
        add(caseCoreCurrent('encode'), () => {
            scaleCodecCore.encode(INPUT_BIGINTS)
        }),
        add(caseRuntimeCurrent('encode'), () => {
            scaleCodecRuntime.encode(INPUT_BIGINTS)
        }),
        add(caseCorePre('encode'), () => {
            scaleCodecCoreV4.encode(INPUT_BIGINTS)
        }),
        add(caseRuntimePre('encode'), () => {
            scaleCodecRuntimeV8.encode(INPUT_BIGINTS)
        }),
        add(casePolka('encode'), () => {
            polka.encode(INPUT_POLKA)
        }),
        add(caseCoreCurrent('decode'), () => {
            scaleCodecCore.decode(NUMBERS_ENCODED)
        }),
        add(caseRuntimeCurrent('decode'), () => {
            scaleCodecRuntime.decode(NUMBERS_ENCODED)
        }),
        add(caseCorePre('decode'), () => {
            scaleCodecCoreV4.decode(NUMBERS_ENCODED)
        }),
        add(caseRuntimePre('decode'), () => {
            scaleCodecRuntimeV8.decode(NUMBERS_ENCODED)
        }),
        add(casePolka('decode'), () => {
            polka.decode(NUMBERS_ENCODED)
        }),
        cycle(),
        complete(),
        saveCustom('arr-u64-32'),
    )
}
