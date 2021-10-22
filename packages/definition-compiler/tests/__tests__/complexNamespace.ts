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

function defineCase<T>(
    builder: ScaleBuilder<T, any>,
    value: T,
    expectedBytes: Uint8Array,
): [ScaleBuilder<T>, T, Uint8Array] {
    return [builder, value, expectedBytes];
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
    defineCase(
        MapStrU8,
        new Map([[Str.fromValue('Hey'), U8.fromValue(JSBI.BigInt(56))]]),
        encodeMap(new Map([['Hey', JSBI.BigInt(56)]]), encodeStrCompact, encodeU8),
    ),
    defineCase(
        Character,
        { name: Str.fromValue('Alice') },
        encodeStruct({ name: 'Alice' }, { name: encodeStrCompact }, ['name']),
    ),
    defineCase(SetU8, new Set(), encodeSetU8(new Set())),
    defineCase(
        SetU8,
        new Set([U8.fromValue(JSBI.BigInt(51)), U8.fromValue(JSBI.BigInt(5))]),
        encodeSetU8(new Set([JSBI.BigInt(51), JSBI.BigInt(5)])),
    ),
    defineCase(Msg, Enum.empty('Quit'), encodeMsgEnum(Enum.empty('Quit'))),
    defineCase(Msg, Enum.valuable('Greeting', Str.fromValue('Nya')), encodeMsgEnum(Enum.valuable('Greeting', 'Nya'))),
    defineCase(
        ArraySetU8l2,
        [SetU8.fromValue(new Set()), SetU8.fromValue(new Set([U8.fromValue(JSBI.BigInt('412341234'))]))],
        encodeArray([new Set(), new Set([JSBI.BigInt('412341234')])], encodeSetU8, 2),
    ),
    defineCase(VecBool, [Bool.fromValue(false)], encodeVec([false], encodeBool)),
    defineCase(StrAlias, 'wow', encodeStrCompact('wow')),
    defineCase(
        TupleMsgMsg,
        [Msg.fromValue(Enum.empty('Quit')), Msg.fromValue(Enum.empty('Quit'))],
        encodeTuple<[RawMsgEnum, RawMsgEnum]>([Enum.empty('Quit'), Enum.empty('Quit')], [encodeMsgEnum, encodeMsgEnum]),
    ),
    defineCase(OptionMsg, Enum.empty('None'), encodeOption(Enum.empty('None'))),
    defineCase(
        OptionMsg,
        Enum.valuable('Some', Msg.fromValue(Enum.empty('Quit'))),
        encodeOption(Enum.valuable('Some', Enum.empty('Quit'))),
    ),
])('Encode/decode with %p: %p', (builder, val, expectedBytes) => {
    const instance = builder.fromValue(val as any);
    const bytes = instance.bytes;

    expect(bytes).toEqual(expectedBytes);

    const instanceBack = builder.fromBytes(bytes);

    expect(JSON.stringify(instance)).toEqual(JSON.stringify(instanceBack));
});
