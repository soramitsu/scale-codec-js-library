import { allArrayItemsShouldBeTheSame } from '../../test/util'
import core from './core'
import coreV4 from './core-v4'
import runtime from './runtime'
import { setFactory } from './util'

const CODECS = [core, coreV4, runtime]

test('Encode is consistent', () => {
    const VALUE = setFactory()

    const results = CODECS.map((x) => x.encode(VALUE))

    allArrayItemsShouldBeTheSame(results)
})
