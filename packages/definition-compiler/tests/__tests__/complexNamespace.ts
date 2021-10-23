import {
    ScaleBuilder,
    Bool,
    Str,
    U8,
    JSBI,
    Enum,
    encodeMap,
    encodeStrCompact,
    encodeBigInt,
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

type CaseWrapped<T> = [ScaleBuilder<T>, T, Uint8Array];

function defineCaseWrapped<T>(builder: ScaleBuilder<T, any>, value: T, expectedBytes: Uint8Array): CaseWrapped<T> {
    return [builder, value, expectedBytes];
}

type CaseUnwrapped<T, U> = [ScaleBuilder<T, U>, U, Encode<U>];

function defineCaseUnwrapped<T, U>(builder: ScaleBuilder<T, U>, unwrapped: U, encode: Encode<U>): CaseUnwrapped<T, U> {
    return [builder, unwrapped, encode];
}

const encodeU8: Encode<JSBI> = (x) => encodeBigInt(x, { bits: 8, signed: false, endianness: 'le' });

const encodeSetU8: Encode<Set<JSBI>> = (x) => encodeSet(x, encodeU8);

type RawMsgEnum = Enum<{ Quit: null; Greeting: Valuable<string> }>;
const encodeMsgEnum: Encode<RawMsgEnum> = (value) =>
    encodeEnum(value, {
        Quit: { d: 0 },
        Greeting: { d: 1, encode: encodeStrCompact },
    });

const encodeOption: Encode<Option<RawMsgEnum>> = (val) =>
    encodeEnum(val, { None: { d: 0 }, Some: { d: 1, encode: encodeMsgEnum } });

test.each([
    defineCaseWrapped(
        MapStrU8,
        new Map([[Str.fromValue('Hey'), U8.fromValue(JSBI.BigInt(56))]]),
        encodeMap(new Map([['Hey', JSBI.BigInt(56)]]), encodeStrCompact, encodeU8),
    ),
    defineCaseWrapped(
        Character,
        { name: Str.fromValue('Alice') },
        encodeStruct({ name: 'Alice' }, { name: encodeStrCompact }, ['name']),
    ),
    defineCaseWrapped(SetU8, new Set(), encodeSetU8(new Set())),
    defineCaseWrapped(
        SetU8,
        new Set([U8.fromValue(JSBI.BigInt(51)), U8.fromValue(JSBI.BigInt(5))]),
        encodeSetU8(new Set([JSBI.BigInt(51), JSBI.BigInt(5)])),
    ),
    defineCaseWrapped(Msg, Enum.empty('Quit'), encodeMsgEnum(Enum.empty('Quit'))),
    defineCaseWrapped(VecBool, [Bool.fromValue(false)], encodeVec([false], encodeBool)),
    defineCaseWrapped(StrAlias, 'wow', encodeStrCompact('wow')),
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
    defineCaseUnwrapped(ArraySetU8l2, [new Set(), new Set([JSBI.BigInt('412341234')])], (x) =>
        encodeArray(x, encodeSetU8, 2),
    ),
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