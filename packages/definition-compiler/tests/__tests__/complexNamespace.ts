import {
    FragmentBuilder,
    Bool,
    Str,
    U8,
    Enum,
    encodeStr,
    Encode,
    encodeBool,
    Option,
    createSetEncoder,
    encodeU8,
    createEnumEncoder,
    createOptionEncoder,
    WalkerImpl,
    createMapEncoder,
    createStructEncoder,
    createVecEncoder,
    createArrayEncoder,
    createTupleEncoder,
} from '@scale-codec/definition-runtime'
import {
    ArraySetU8l2,
    Character,
    MapStrU8,
    Msg,
    OptionMsg,
    SetU8,
    StrAlias,
    TupleMsgMsg,
    VecBool,
} from '../samples/complexNamespace'

type CaseWrapped<T> = [FragmentBuilder<T>, T, Uint8Array]

function defineCaseWrapped<T>(builder: FragmentBuilder<T, any>, value: T, expectedBytes: Uint8Array): CaseWrapped<T> {
    return [builder, value, expectedBytes]
}

type CaseUnwrapped<T, U> = [FragmentBuilder<T, U>, U, Encode<U>]

function defineCaseUnwrapped<T, U>(
    builder: FragmentBuilder<T, U>,
    unwrapped: U,
    encode: Encode<U>,
): CaseUnwrapped<T, U> {
    return [builder, unwrapped, encode]
}

// const encodeU8: Encode<number> = (x) => encodeInt(x, 'u8')

const encodeSetU8: Encode<Set<number>> = createSetEncoder(encodeU8)

type RawMsgEnum = Enum<'Quit' | ['Greeting', string]>
const encodeMsgEnum: Encode<RawMsgEnum> = createEnumEncoder<RawMsgEnum>({ Quit: 0, Greeting: [1, encodeStr] })

const encodeOption: Encode<Option<RawMsgEnum>> = createOptionEncoder(encodeMsgEnum)

test.each([
    defineCaseWrapped(
        MapStrU8,
        new Map([[Str.fromValue('Hey'), U8.fromValue(56)]]),
        WalkerImpl.encode(new Map([['Hey', 56]]), createMapEncoder(encodeStr, encodeU8)),
    ),
    defineCaseWrapped(
        Character,
        { name: Str.fromValue('Alice') },
        WalkerImpl.encode({ name: 'Alice' }, createStructEncoder([['name', encodeStr]])),
    ),
    defineCaseWrapped(SetU8, new Set(), WalkerImpl.encode(new Set(), encodeSetU8)),
    defineCaseWrapped(
        SetU8,
        new Set([U8.fromValue(51), U8.fromValue(5)]),
        WalkerImpl.encode(new Set([51, 5]), encodeSetU8),
    ),
    defineCaseWrapped(Msg, Enum.variant('Quit'), WalkerImpl.encode(Enum.variant('Quit'), encodeMsgEnum)),
    defineCaseWrapped(VecBool, [Bool.fromValue(false)], WalkerImpl.encode([false], createVecEncoder(encodeBool))),
    defineCaseWrapped(StrAlias, 'wow', WalkerImpl.encode('wow', encodeStr)),
    defineCaseWrapped(OptionMsg, Enum.variant('None'), WalkerImpl.encode(Enum.variant('None'), encodeOption)),
])('Encode/decode hand-constructed data with %p: %p', (builder, val, expectedBytes) => {
    const instance = builder.fromValue(val as any)
    const bytes = instance.bytes

    expect(bytes).toEqual(expectedBytes)

    const instanceBack = builder.fromBuffer(bytes)

    expect(JSON.stringify(instance)).toEqual(JSON.stringify(instanceBack))
})

test.each([
    defineCaseUnwrapped(Msg, Enum.variant('Greeting', 'Nya'), encodeMsgEnum),
    defineCaseUnwrapped(ArraySetU8l2, [new Set(), new Set([412341234])], createArrayEncoder(encodeSetU8, 2)),
    defineCaseUnwrapped(
        TupleMsgMsg,
        [Enum.variant('Quit'), Enum.variant('Quit')] as [RawMsgEnum, RawMsgEnum],
        createTupleEncoder([encodeMsgEnum, encodeMsgEnum]),
    ),
    defineCaseUnwrapped(OptionMsg, Enum.variant('Some', Enum.variant('Quit')), encodeOption),
])('Encode/decode unwapped data with %p: %p', (builder, unwrapped, encode) => {
    const encoded = WalkerImpl.encode(unwrapped, encode)

    const wrapped = builder.wrap(unwrapped as any)

    expect(wrapped.bytes).toEqual(encoded)
    expect(wrapped.unwrap()).toEqual(unwrapped)
})
