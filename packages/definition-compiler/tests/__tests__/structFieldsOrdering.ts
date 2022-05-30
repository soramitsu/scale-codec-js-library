import {
  WalkerImpl,
  createStructEncoder,
  encodeCompact,
  encodeStr,
  encodeUint8Vec,
} from '@scale-codec/definition-runtime'
import { Mystery } from '../samples/structFieldsOrdering'

interface Raw {
  b: string
  a: bigint
  A: Uint8Array
}

function makeRaw(value: Raw): Raw {
  return value
}

const rawEncoder = createStructEncoder<Raw>([
  ['b', encodeStr],
  ['a', encodeCompact],
  ['A', encodeUint8Vec],
])

function encodeRaw(value: Raw): Uint8Array {
  return WalkerImpl.encode(value, rawEncoder)
}

test('Encodes as expected', () => {
  const raw = makeRaw({
    A: new Uint8Array([6, 1, 2, 3, 123, 4, 1, 4, 1, 4, 1, 2, 3, 4]),
    a: BigInt('81818273'),
    b: 'Nyanpasu',
  })

  expect(Mystery.toBuffer(Mystery(raw))).toEqual(encodeRaw(raw))
})

test('Decodes as expected', () => {
  const raw = makeRaw({
    A: new Uint8Array([6, 1, 2, 3, 123, 4, 1, 4, 1, 4, 1, 2, 3, 4]),
    a: BigInt('81818273'),
    b: 'Nyanpasu',
  })
  const encoded = encodeRaw(raw)

  const value = Mystery.fromBuffer(encoded)

  expect(value).toEqual(raw)
})
