import { concatBytes } from '@scale-codec/util'
import { decodeBool, encodeBool } from '../bool'

describe.only('booleans', () => {
    for (const flag of [false, true]) {
        const byte = flag ? 1 : 0

        it(`encode ${flag} to ${byte}`, () => {
            expect(concatBytes(encodeBool(flag))).toEqual(new Uint8Array([byte]))
        })

        it(`decode ${byte} to ${flag}`, () => {
            expect(decodeBool(new Uint8Array([byte]))).toEqual([flag, 1])
        })
    }
})
