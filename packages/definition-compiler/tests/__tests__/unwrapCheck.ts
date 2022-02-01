import { Bool, Enum, Option, Result, Str, UnwrapFragment } from '@scale-codec/definition-runtime'
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
} from '../samples/unwrapCheck'

function defineUnwrap<T>(unwrapped: UnwrapFragment<T>): UnwrapFragment<T> {
    return unwrapped
}

test('Complex struct unwrapped correctly', () => {
    const scaleStr = Str.fromValue('test str')
    const scaleBool = Bool.fromValue(true)
    const scaleTuple = TupleA.fromValue([Str.fromValue('tuple value')])
    const bytes = new Uint8Array([0, 1, 2, 3, 4])

    const input = StructA.fromValue({
        primitive: scaleBool,
        enum: EnumA.fromValue(Enum.variant('Empty')),
        map: MapA.fromValue(
            new Map([
                [scaleStr, scaleTuple],
                [Str.fromValue('another key'), scaleTuple],
            ]),
        ),
        set: SetA.fromValue(new Set([scaleTuple, TupleA.fromValue([Str.fromValue('another tuple')])])),
        tuple: scaleTuple,
        array: ArrayA.fromValue([scaleBool, scaleBool, scaleBool]),
        bytesArray: BytesArrayA.fromValue(bytes),
        vec: VecEnumA.fromValue([
            EnumA.fromValue(Enum.variant('Opt', OptionA.fromValue(Enum.variant('None')))),
            EnumA.fromValue(Enum.variant('Res', ResultA.fromValue(Enum.variant('Err', scaleStr)))),
        ]),
        alias: AliasA.fromValue([scaleStr]),
    })

    type UnwrappedTuple = [string]

    type UnwrappedOption = Option<UnwrappedTuple>

    type UnwrappedEnumA = Enum<'Empty' | ['Opt', UnwrappedOption] | ['Res', Result<UnwrappedTuple, string>]>

    type ExpectedUnwrappedType = {
        primitive: boolean
        enum: UnwrappedEnumA
        map: Map<string, UnwrappedTuple>
        set: Set<UnwrappedTuple>
        tuple: UnwrappedTuple
        array: boolean[]
        bytesArray: Uint8Array
        vec: UnwrappedEnumA[]
        alias: UnwrappedTuple
    }

    // specian construction to evaluate type checking
    const structUnwrapped: ExpectedUnwrappedType = defineUnwrap<typeof input>({
        primitive: true,
        enum: Enum.variant('Empty'),
        map: new Map([
            ['test str', ['tuple value']],
            ['another key', ['tuple value']],
        ]),
        set: new Set([['tuple value'], ['another tuple']]),
        tuple: ['tuple value'],
        array: [true, true, true],
        bytesArray: bytes,
        vec: [Enum.variant('Opt', Enum.variant('None')), Enum.variant('Res', Enum.variant('Err', 'test str'))],
        alias: ['test str'],
    })

    expect(input.unwrap()).toEqual(structUnwrapped)
})
