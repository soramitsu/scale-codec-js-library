import { add } from 'benny'
import { caseName, encodeDecodeSuitePair } from '../bench-util'
import core from './core'
import polka from './polka'
import runtime from './runtime'
import { factoryCore, factoryParity, factoryPolka } from './util'
import parity from './parity'

export default async function () {
  const INPUT_CORE = factoryCore(40)
  const INPUT_POLKA = factoryPolka(40)
  const INPUT_PARITY = factoryParity(40)
  const ENCODED = core.encode(INPUT_CORE)

  await encodeDecodeSuitePair(
    'Option Chain',
    'option-chain',
    [
      add(caseName('core'), () => {
        core.encode(INPUT_CORE)
      }),
      add(caseName('runtime'), () => {
        runtime.encode(INPUT_CORE)
      }),
      add(caseName('polka'), () => {
        polka.encode(INPUT_POLKA)
      }),
      add(caseName('parity'), () => {
        parity.encode(INPUT_PARITY)
      }),
    ],
    [
      add(caseName('core'), () => {
        core.decode(ENCODED)
      }),
      add(caseName('runtime'), () => {
        runtime.decode(ENCODED)
      }),
      add(caseName('polka'), () => {
        polka.decode(ENCODED)
      }),
      add(caseName('parity'), () => {
        parity.decode(ENCODED)
      }),
    ],
  )
}
