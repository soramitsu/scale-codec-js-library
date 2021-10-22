import { Enum, JSBI, Option, Valuable } from '@scale-codec/core';
import {
    createAliasBuilder,
    createArrayBuilder,
    createEnumBuilder,
    createMapBuilder,
    createOptionBuilder,
    createSetBuilder,
    createStructBuilder,
    createTupleBuilder,
    createVecBuilder,
} from '../builder-creators';
import { InnerValue, InstanceViaBuilder, ScaleInstance, UnwrappedValue } from '../instance';
import { Bool, I128, Str } from '../unparametrized-builders';

const Key = createStructBuilder<{ payload: ScaleInstance<JSBI> }>('Key', [['payload', () => I128]]);

const Msg = createEnumBuilder<
    Enum<{
        Quit: null;
        Greeting: Valuable<InstanceViaBuilder<typeof Key>>;
    }>
>('Msg', [
    [0, 'Quit'],
    [1, 'Greeting', () => Key],
]);

test('Unwraps primitive (Str)', () => {
    const text = 'Per aspera ad astra';

    expect(Str.fromValue(text).unwrap()).toEqual(text);
});

test('Unwraps struct', () => {
    const num = JSBI.BigInt(999767262);

    const unwrapped = Key.fromValue({ payload: I128.fromValue(num) }).unwrap();

    expect(unwrapped).toEqual({ payload: num });
});

test("Unwraps enum's contents", () => {
    const num = JSBI.BigInt(789123);

    const nonEmpty = Msg.fromValue(Enum.valuable('Greeting', Key.fromValue({ payload: I128.fromValue(num) })));
    const unwrapped = nonEmpty.unwrap();

    expect(unwrapped).toEqual(Enum.valuable<any, any>('Greeting', { payload: num }));
});

test('Unwraps empty enum', () => {
    expect(Msg.fromValue(Enum.empty('Quit')).unwrap()).toEqual(Enum.empty<any, any>('Quit'));
});

test('Unwraps Option', () => {
    const SomeBool = createOptionBuilder<Option<ScaleInstance<boolean>>>('SomeBool', () => Bool);

    expect(SomeBool.fromValue(Enum.valuable('Some', Bool.fromValue(true))).unwrap()).toEqual(
        Enum.valuable<any, any>('Some', true),
    );
});

test('Unwraps array', () => {
    const Bool2 = createArrayBuilder<ScaleInstance<boolean>[]>('Bool2', () => Bool, 2);

    expect(Bool2.fromValue([Bool.fromValue(false), Bool.fromValue(false)]).unwrap()).toEqual([false, false]);
});

test('Unwraps vec', () => {
    const VecBool = createVecBuilder<ScaleInstance<boolean>[]>('VecBool', () => Bool);

    expect(VecBool.fromValue([Bool.fromValue(true)]).unwrap()).toEqual([true]);
});

test('Unwraps Map', () => {
    const MAP = createMapBuilder<Map<ScaleInstance<boolean>, ScaleInstance<string>>>(
        'Map',
        () => Bool,
        () => Str,
    );

    expect(
        MAP.fromValue(
            new Map([
                [Bool.fromValue(false), Str.fromValue('Nope')],
                [Bool.fromValue(true), Str.fromValue('Yep')],
            ]),
        ).unwrap(),
    ).toEqual(
        new Map([
            [false, 'Nope'],
            [true, 'Yep'],
        ]),
    );
});

test('Unwraps Set', () => {
    const SET = createSetBuilder<Set<ScaleInstance<string>>>('Set', () => Str);

    expect(SET.fromValue(new Set([Str.fromValue('A'), Str.fromValue('B')])).unwrap()).toEqual(new Set(['A', 'B']));
});

test('Unwraps tuple', () => {
    const TUPLE = createTupleBuilder<[ScaleInstance<boolean>, ScaleInstance<string>]>('Tuple', [() => Bool, () => Str]);

    expect(TUPLE.fromValue([Bool.fromValue(false), Str.fromValue('._.')]).unwrap()).toEqual([false, '._.']);
});

test('Unwraps aliases chain', () => {
    type KeyValue = InnerValue<typeof Key>;
    type KeyUnwrapped = UnwrappedValue<typeof Key>;

    const AliasA = createAliasBuilder<KeyValue, KeyUnwrapped>('AliasA', () => Key);
    const AliasB = createAliasBuilder<KeyValue, KeyUnwrapped>('AliasB', () => AliasA);

    const num = JSBI.BigInt(111);

    expect(
        AliasB.fromValue({
            payload: I128.fromValue(num),
        }).unwrap(),
    ).toEqual({ payload: num });
});
