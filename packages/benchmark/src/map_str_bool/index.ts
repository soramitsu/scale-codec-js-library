import { add, complete, cycle, suite } from 'benny'
import core from './core'
import coreV04 from './core-v04'
import runtime from './runtime'
import { factory } from './util'

export default async function () {
    const VALUE = factory()
    const ENCODED = core.encode(VALUE)

    await suite(
        'Encode Map<string, boolean>',
        add('core', () => {
            core.encode(VALUE)
        }),
        add('core v 0.4', () => {
            coreV04.encode(VALUE)
        }),
        add('runtime', () => {
            runtime.encode(VALUE)
        }),
        cycle(),
        complete(),
    )

    await suite(
        'Decode Map<string, boolean>',
        add('core', () => {
            core.decode(ENCODED)
        }),
        add('core v 0.4', () => {
            coreV04.decode(ENCODED)
        }),
        add('runtime', () => {
            runtime.decode(ENCODED)
        }),
        cycle(),
        complete(),
    )
}
