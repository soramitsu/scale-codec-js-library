import {
    FragmentBuilder,
    Bool,
    Str,
    U8,
    Enum,
    encodeMap,
    encodeStr,
    Encode,
    encodeStruct,
    encodeSet,
    Valuable,
    encodeEnum,
    encodeArray,
    encodeVec,
    encodeBool,
    encodeTuple,
    Option,
    encodeInt,
} from '@scale-codec/definition-runtime';
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
} from '../samples/complexNamespace';

type CaseWrapped<T> = [FragmentBuilder<T>, T, Uint8Array];

function defineCaseWrapped<T>(builder: FragmentBuilder<T, any>, value: T, expectedBytes: Uint8Array): CaseWrapped<T> {
    return [builder, value, expectedBytes];
}

type CaseUnwrapped<T, U> = [FragmentBuilder<T, U>, U, Encode<U>];

function defineCaseUnwrapped<T, U>(
    builder: FragmentBuilder<T, U>,
    unwrapped: U,
    encode: Encode<U>,
): CaseUnwrapped<T, U> {
    return [builder, unwrapped, encode];
}

const encodeU8: Encode<number> = (x) => encodeInt(x, 'u8');

const encodeSetU8: Encode<Set<number>> = (x) => encodeSet(x, encodeU8);

type RawMsgEnum = Enum<{ Quit: null; Greeting: Valuable<string> }>;
const encodeMsgEnum: Encode<RawMsgEnum> = (value) =>
    encodeEnum(value, {
        Quit: { d: 0 },
        Greeting: { d: 1, encode: encodeStr },
    });

const encodeOption: Encode<Option<RawMsgEnum>> = (val) =>
    encodeEnum(val, { None: { d: 0 }, Some: { d: 1, encode: encodeMsgEnum } });

test.each([
    defineCaseWrapped(
        MapStrU8,
        new Map([[Str.fromValue('Hey'), U8.fromValue(56)]]),
        encodeMap(new Map([['Hey', 56]]), encodeStr, encodeU8),
    ),
    defineCaseWrapped(
        Character,
        { name: Str.fromValue('Alice') },
        encodeStruct({ name: 'Alice' }, { name: encodeStr }, ['name']),
    ),
    defineCaseWrapped(SetU8, new Set(), encodeSetU8(new Set())),
    defineCaseWrapped(SetU8, new Set([U8.fromValue(51), U8.fromValue(5)]), encodeSetU8(new Set([51, 5]))),
    defineCaseWrapped(Msg, Enum.empty('Quit'), encodeMsgEnum(Enum.empty('Quit'))),
    defineCaseWrapped(VecBool, [Bool.fromValue(false)], encodeVec([false], encodeBool)),
    defineCaseWrapped(StrAlias, 'wow', encodeStr('wow')),
    defineCaseWrapped(OptionMsg, Enum.empty('None'), encodeOption(Enum.empty('None'))),
])('Encode/decode hand-constructed data with %p: %p', (builder, val, expectedBytes) => {
    const instance = builder.fromValue(val as any);
    const bytes = instance.bytes;

    expect(bytes).toEqual(expectedBytes);

    const instanceBack = builder.fromBytes(bytes);

    expect(JSON.stringify(instance)).toEqual(JSON.stringify(instanceBack));
});

test.each([
    defineCaseUnwrapped(Msg, Enum.valuable('Greeting', 'Nya'), encodeMsgEnum),
    defineCaseUnwrapped(ArraySetU8l2, [new Set(), new Set([412341234])], (x) => encodeArray(x, encodeSetU8, 2)),
    defineCaseUnwrapped(TupleMsgMsg, [Enum.empty('Quit'), Enum.empty('Quit')] as [RawMsgEnum, RawMsgEnum], (x) =>
        encodeTuple(x, [encodeMsgEnum, encodeMsgEnum]),
    ),
    defineCaseUnwrapped(OptionMsg, Enum.valuable('Some', Enum.empty('Quit')), encodeOption),
])('Encode/decode unwapped data with %p: %p', (builder, unwrapped, encode) => {
    const encoded = encode(unwrapped as any);

    const wrapped = builder.wrap(unwrapped as any);

    expect(wrapped.bytes).toEqual(encoded);
    expect(wrapped.unwrap()).toEqual(unwrapped);
});
