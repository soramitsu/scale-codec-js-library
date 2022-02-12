import { add, complete, cycle, suite } from 'benny'
import core from './core'
import coreV04 from './core-v04'
import polka from './polka'
import runtime from './runtime'
import { factoryCore, factoryCoreV04, factoryPolka } from './util'

export default async function () {
    const INPUT_CORE = factoryCore(40)
    const INPUT_CORE_04 = factoryCoreV04(40)
    const INPUT_POLKA = factoryPolka(40)
    const ENCODED = core.encode(INPUT_CORE)

    await suite(
        'Encode options chain',
        add('core', () => {
            core.encode(INPUT_CORE)
        }),
        add('runtime', () => {
            runtime.encode(INPUT_CORE)
        }),
        add('core 0.4', () => {
            coreV04.encode(INPUT_CORE_04)
        }),
        add('@polkadot/types', () => {
            polka.encode(INPUT_POLKA)
        }),
        cycle(),
        complete(),
    )

    await suite(
        'Decode options chain',
        add('core', () => {
            core.decode(ENCODED)
        }),
        add('runtime', () => {
            runtime.decode(ENCODED)
        }),
        add('core 0.4', () => {
            coreV04.decode(ENCODED)
        }),
        add('@polkadot/types', () => {
            polka.decode(ENCODED)
        }),
        cycle(),
        complete(),
    )
}
