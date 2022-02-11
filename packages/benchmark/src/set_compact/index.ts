import { add, complete, cycle, suite } from 'benny'
import core from './core'
import coreV4 from './core-v4'
import runtime from './runtime'
import { setFactory } from './util'

export default async function () {
    const VALUE = setFactory()
    const ENCODED = core.encode(VALUE)

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