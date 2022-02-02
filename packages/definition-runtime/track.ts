import { Enum } from '@scale-codec/core'
import {
    AliasA,
    ArrayA,
    BytesArrayA,
    EnumA,
    MapA,
    OptionA,
    ResultA,
    SetA,
    StructA,
    TupleA,
    VecEnumA,
} from '../definition-compiler/tests/samples/unwrapCheck'
import { Bool, Str } from './src/presets'
import { Logger } from './src/tracking'

const STR = Str.fromValue('test str')
const BOOL = Bool.fromValue(true)
const TUPLE = TupleA.fromValue([Str.fromValue('tuple value')])
const BYTES = new Uint8Array([0, 1, 2, 3, 4])

const VALUE = StructA.fromValue({
    primitive: BOOL,
    enum: EnumA.fromValue(Enum.variant('Empty')),
    map: MapA.fromValue(
        new Map([
            [STR, TUPLE],
            [Str.fromValue('another key'), TUPLE],
        ]),
    ),
    set: SetA.fromValue(new Set([TUPLE, TupleA.fromValue([Str.fromValue('another tuple')])])),
    tuple: TUPLE,
    array: ArrayA.fromValue([BOOL, BOOL, BOOL]),
    bytesArray: BytesArrayA.fromValue(BYTES),
    vec: VecEnumA.fromValue([
        EnumA.fromValue(Enum.variant('Opt', OptionA.fromValue(Enum.variant('None')))),
        EnumA.fromValue(Enum.variant('Res', ResultA.fromValue(Enum.variant('Err', STR)))),
    ]),
    alias: AliasA.fromValue([STR]),
})

new Logger({ logDecodeSuccesses: true }).mount()

StructA.fromBuffer(VALUE.bytes).unwrap()

// console.log(StructA.fromBuffer())
