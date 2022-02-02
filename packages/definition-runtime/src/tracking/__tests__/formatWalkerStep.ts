import { WalkerImpl } from '@scale-codec/core'
import { fromHex } from '@scale-codec/util'
import { formatWalkerStep, FormatWalkerStepParams } from '../util'

function format(hex: string, params: Omit<FormatWalkerStepParams, 'walker'>): string {
    return formatWalkerStep({
        walker: new WalkerImpl(fromHex(hex)),
        ...params,
    })
}

const HEX = `12 34 56 78 de ad be ef ca fe ba be`

test('When no end offset and input is small, print is correct', () => {
    expect(format(HEX, { offsetStart: 2 })).toMatchInlineSnapshot(
        `"offset: 2; 12 34 (start) 56 78 de ad be ef ca fe ba be"`,
    )
})

test('When end offset is greater than start, print is correct', () => {
    expect(format(HEX, { offsetStart: 2, offsetEnd: 5 })).toMatchInlineSnapshot(
        `"offset: 2..5 (+3); 12 34 (start) 56 78 de (end) ad be ef ca fe ba be"`,
    )
})

test('When end offset is lower than start, print is correct', () => {
    expect(format(HEX, { offsetStart: 5, offsetEnd: 2 })).toMatchInlineSnapshot(
        `"offset: 5..2 (-3); 12 34 (end) 56 78 de (start) ad be ef ca fe ba be"`,
    )
})
