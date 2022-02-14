import {
    encodeStruct,
    encodeUint8Vec,
    encodeCompact,
    encodeStr,
    Str,
    VecU8,
    Compact,
    createStructEncoder,
    WalkerImpl,
} from '@scale-codec/definition-runtime'
import { Mystery } from '../samples/structFieldsOrdering'

interface Raw {
    b: string
    a: bigint
    A: Uint8Array
}

// type Scale = FragmentFromBuilder<typeof Mystery>

function makeRaw(value: Raw): Raw {
    return value
}

// function makeScale(value: Raw): Scale {
//     return Mystery.fromValue({
//         A: BytesVec.fromValue(value.A),
//         a: Compact.fromValue(value.a),
//         b: Str.fromValue(value.b),
//     })
// }

// function unwrapScale({
//     value: {
//         A: { value: A },
//         a: { value: a },
//         b: { value: b },
//     },
// }: Scale): Raw {
//     return { A, a, b }
// }

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

    expect(Mystery.toBuffer(raw)).toEqual(encodeRaw(raw))
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
