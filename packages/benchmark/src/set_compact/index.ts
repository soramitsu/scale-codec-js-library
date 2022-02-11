import { add, complete, cycle, suite } from 'benny'
import core from './core'
import coreV4 from './core-v4'
import runtime from './runtime'

export default async function () {
    const VALUE = new Set<bigint | number>(
        Array.from({ length: 50 }, (_, i) => BigInt(i) << BigInt(~~((i * 120) / 50))),
    )

    const ENCODED = core.encode(VALUE)

    // console.log(VALUE)

    // return

    await suite(
        'Encode Set<Compact> (with 50 entries)',
        add('core', () => {
            core.encode(VALUE)
        }),
        add('runtime', () => {
            runtime.encode(VALUE)
        }),
        add('core@0.4', () => {
            coreV4.encode(VALUE)
        }),
        cycle(),
        complete(),
    )

    await suite(
        'Decode Set<Compact> with 50 entries',
        add('core', () => {
            core.decode(ENCODED)
        }),
        add('runtime', () => {
            runtime.decode(ENCODED)
        }),
        add('core 0.4', () => {
            coreV4.decode(ENCODED)
        }),
        cycle(),
        complete(),
    )
}
