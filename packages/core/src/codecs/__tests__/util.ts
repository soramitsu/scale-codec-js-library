import { Decode } from '../../types'
import { WalkerImpl } from '../../util'

export function ensureDecodeImmutability(data: Uint8Array, decode: Decode<any>) {
  const totalLen = ~~(data.length * 1.5)
  const startIdx = ~~(data.length * 0.3)

  const sourceArray = new Uint8Array(totalLen).map(() => ~~(256 * Math.random()))
  sourceArray.set(data, startIdx)

  const sourceCopy = sourceArray.slice()
  const slice = sourceCopy.subarray(startIdx, startIdx + data.byteLength)

  // decode for 10 times
  for (let i = 10; i >= 0; i--) {
    WalkerImpl.decode(slice, decode)

    // ensure that everything is ok
    expect(sourceCopy).toEqual(sourceArray)
  }
}
