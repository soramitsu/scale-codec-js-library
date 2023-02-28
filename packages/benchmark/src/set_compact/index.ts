import { add, complete, cycle, suite } from 'benny'
import { saveCustom } from '../shared'
import core from './core'
import runtime from './runtime'
import { factory } from './util'

export default async function () {
  const VALUE = factory()
  const ENCODED = core.encode(VALUE)

  await suite(
    'Encode Set<Compact> (with 50 entries)',
    add('core', () => {
      core.encode(VALUE)
    }),
    add('runtime', () => {
      runtime.encode(VALUE)
    }),
    cycle(),
    complete(),
    saveCustom('set-compact-encode'),
  )

  await suite(
    'Decode Set<Compact> with 50 entries',
    add('core', () => {
      core.decode(ENCODED)
    }),
    add('runtime', () => {
      runtime.decode(ENCODED)
    }),
    cycle(),
    complete(),
    saveCustom('set-compact-decode'),
  )
}
