import { add, complete, cycle, suite } from 'benny'
import { saveCustom } from '../shared'
import core from './core'
import polka from './polka'
import runtime from './runtime'
import { factoryCore, factoryPolka } from './util'

export default async function () {
  const INPUT_CORE = factoryCore(40)
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
    add('@polkadot/types', () => {
      polka.encode(INPUT_POLKA)
    }),
    cycle(),
    complete(),
    saveCustom('options-chain-encode'),
  )

  await suite(
    'Decode options chain',
    add('core', () => {
      core.decode(ENCODED)
    }),
    add('runtime', () => {
      runtime.decode(ENCODED)
    }),
    add('@polkadot/types', () => {
      polka.decode(ENCODED)
    }),
    cycle(),
    complete(),
    saveCustom('options-chain-decode'),
  )
}
