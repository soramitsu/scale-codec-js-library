import { Enum, JSBI, Valuable } from '@scale-codec/core';
import {
    createAliasBuilder,
    createArrayBuilder,
    createEnumBuilder,
    createMapBuilder,
    createSetBuilder,
    createStructBuilder,
    createTupleBuilder,
    createVecBuilder,
} from '../builder-creators';
import { InnerValue, InstanceViaBuilder, ScaleInstance, UnwrappedValue } from '../instance';
import { Bool, I128, Str } from '../unparametrized-builders';

const Key = createStructBuilder<{ payload: ScaleInstance<JSBI> }>('Key', [['payload', I128]]);

const StructWithKey = createStructBuilder<{
    key: InstanceViaBuilder<typeof Key>;
}>('', [['key', Key]]);

const Msg = createEnumBuilder<
    Enum<{
        Quit: null;
        Greeting: Valuable<InstanceViaBuilder<typeof Key>>;
    }>
>('Msg', [
    [0, 'Quit'],
    [1, 'Greeting', Key],
]);

const Bool2 = createArrayBuilder<ScaleInstance<boolean>[]>('Bool2', Bool, 2);

const VecBool = createVecBuilder<ScaleInstance<boolean>[]>('VecBool', Bool);

const MAP = createMapBuilder<Map<ScaleInstance<boolean>, ScaleInstance<string>>>('Map', Bool, Str);

const SET = createSetBuilder<Set<ScaleInstance<string>>>('Set', Str);

const TUPLE = createTupleBuilder<[ScaleInstance<boolean>, ScaleInstance<string>]>('Tuple', [Bool, Str]);

type KeyValue = InnerValue<typeof Key>;
type KeyUnwrapped = UnwrappedValue<typeof Key>;

const AliasA = createAliasBuilder<KeyValue, KeyUnwrapped>('AliasA', Key);
const AliasB = createAliasBuilder<KeyValue, KeyUnwrapped>('AliasB', AliasA);

describe('Unwrapping', () => {
    test('Unwraps primitive (Str)', () => {
        const text = 'Per aspera ad astra';

        expect(Str.fromValue(text).unwrap()).toEqual(text);
    });

    test('Unwraps struct with primitive key', () => {
        const num = JSBI.BigInt(999767262);

        const unwrapped = Key.fromValue({ payload: I128.fromValue(num) }).unwrap();

        expect(unwrapped).toEqual({ payload: num });
    });

    test('Unwraps struct with non-primitive key', () => {
        expect(
            StructWithKey.fromValue({
                key: Key.fromValue({
                    payload: I128.fromValue(JSBI.BigInt(0)),
                }),
            }).unwrap(),
        ).toEqual({ key: { payload: JSBI.BigInt(0) } });
    });

    test("Unwraps enum's contents", () => {
        const num = JSBI.BigInt(789123);

        const nonEmpty = Msg.fromValue(Enum.valuable('Greeting', Key.fromValue({ payload: I128.fromValue(num) })));
        const unwrapped = nonEmpty.unwrap();

        expect(unwrapped).toEqual(Enum.valuable<any, any>('Greeting', { payload: num }));
    });

    test('Unwraps empty enum', () => {
        expect(Msg.fromValue(Enum.empty('Quit')).unwrap()).toEqual(Enum.empty<any>('Quit'));
    });

    test('Unwraps array', () => {
        expect(Bool2.fromValue([Bool.fromValue(false), Bool.fromValue(false)]).unwrap()).toEqual([false, false]);
    });

    test('Unwraps vec', () => {
        expect(VecBool.fromValue([Bool.fromValue(true)]).unwrap()).toEqual([true]);
    });

    test('Unwraps Map', () => {
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
        expect(SET.fromValue(new Set([Str.fromValue('A'), Str.fromValue('B')])).unwrap()).toEqual(new Set(['A', 'B']));
    });

    test('Unwraps tuple', () => {
        expect(TUPLE.fromValue([Bool.fromValue(false), Str.fromValue('._.')]).unwrap()).toEqual([false, '._.']);
    });

    test('Unwraps aliases chain', () => {
        const num = JSBI.BigInt(111);

        expect(
            AliasB.fromValue({
                payload: I128.fromValue(num),
            }).unwrap(),
        ).toEqual({ payload: num });
    });
});

describe('Wrapping back', () => {
    test('Wraps primitive (str)', () => {
        expect(Str.wrap('kelti')).toEqual(Str.fromValue('kelti'));
    });

    test('Wraps struct with struct with primitive', () => {
        expect(
            StructWithKey.wrap({
                key: {
                    payload: JSBI.BigInt(71),
                },
            }),
        ).toEqual(
            StructWithKey.fromValue({
                key: Key.fromValue({
                    payload: I128.fromValue(JSBI.BigInt(71)),
                }),
            }),
        );
    });

    test("Wraps enum's contents", () => {
        expect(
            Msg.wrap(
                Enum.valuable('Greeting', {
                    payload: JSBI.BigInt(67),
                }),
            ),
        ).toEqual(
            Msg.fromValue(
                Enum.valuable(
                    'Greeting',
                    Key.fromValue({
                        payload: I128.fromValue(JSBI.BigInt(67)),
                    }),
                ),
            ),
        );
    });

    test('Wraps empty enum', () => {
        expect(Msg.wrap(Enum.empty('Quit'))).toEqual(Msg.fromValue(Enum.empty('Quit')));
    });

    test('Wraps array', () => {
        expect(Bool2.wrap([false, true])).toEqual(Bool2.fromValue([Bool.fromValue(false), Bool.fromValue(true)]));
    });

    test('Wraps vec', () => {
        expect(VecBool.wrap([true, true])).toEqual(VecBool.fromValue([Bool.fromValue(true), Bool.fromValue(true)]));
    });

    test('Wraps map', () => {
        expect(
            MAP.wrap(
                new Map([
                    [false, '4123'],
                    [true, '00'],
                ]),
            ),
        ).toEqual(
            MAP.fromValue(
                new Map([
                    [Bool.fromValue(false), Str.fromValue('4123')],
                    [Bool.fromValue(true), Str.fromValue('00')],
                ]),
            ),
        );
    });

    test('Wraps set', () => {
        expect(SET.wrap(new Set(['a', 'b']))).toEqual(SET.fromValue(new Set([Str.fromValue('a'), Str.fromValue('b')])));
    });

    test('Wraps tuple', () => {
        expect(TUPLE.wrap([false, 'true'])).toEqual(TUPLE.fromValue([Bool.fromValue(false), Str.fromValue('true')]));
    });

    test('Wraps aliases chain', () => {
        expect(
            AliasB.wrap({
                payload: JSBI.BigInt(787171),
            }),
        ).toEqual(
            AliasB.fromValue({
                payload: I128.fromValue(JSBI.BigInt(787171)),
            }),
        );
    });
});
