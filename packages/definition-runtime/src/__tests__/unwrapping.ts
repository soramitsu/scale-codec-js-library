import { Enum } from '@scale-codec/core'
import {
    createArrayBuilder,
    createEnumBuilder,
    createMapBuilder,
    createSetBuilder,
    createStructBuilder,
    createTupleBuilder,
    createVecBuilder,
} from '../builder-creators'
import { FragmentFromBuilder, Fragment } from '../fragment'
import { Bool, I128, Str } from '../presets'

const Key = createStructBuilder<{ payload: Fragment<bigint> }>('Key', [['payload', I128]])

const StructWithKey = createStructBuilder<{
    key: FragmentFromBuilder<typeof Key>
}>('', [['key', Key]])

const Msg = createEnumBuilder<Enum<'Quit' | ['Greeting', FragmentFromBuilder<typeof Key>]>>('Msg', [
    [0, 'Quit'],
    [1, 'Greeting', Key],
])

const Bool2 = createArrayBuilder<Fragment<boolean>[]>('Bool2', Bool, 2)

const VecBool = createVecBuilder<Fragment<boolean>[]>('VecBool', Bool)

const MAP = createMapBuilder<Map<Fragment<boolean>, Fragment<string>>>('Map', Bool, Str)

const SET = createSetBuilder<Set<Fragment<string>>>('Set', Str)

const TUPLE = createTupleBuilder<[Fragment<boolean>, Fragment<string>]>('Tuple', [Bool, Str])

describe('Unwrapping', () => {
    test('Unwraps primitive (Str)', () => {
        const text = 'Per aspera ad astra'

        expect(Str.fromValue(text).unwrap()).toEqual(text)
    })

    test('Unwraps struct with primitive key', () => {
        const num = 999767262n

        const unwrapped = Key.fromValue({ payload: I128.fromValue(num) }).unwrap()

        expect(unwrapped).toEqual({ payload: num })
    })

    test('Unwraps struct with non-primitive key', () => {
        expect(
            StructWithKey.fromValue({
                key: Key.fromValue({
                    payload: I128.fromValue(0n),
                }),
            }).unwrap(),
        ).toEqual({ key: { payload: 0n } })
    })

    test("Unwraps enum's contents", () => {
        const num = 789123n

        const nonEmpty = Msg.fromValue(Enum.variant('Greeting', Key.fromValue({ payload: I128.fromValue(num) })))
        const unwrapped = nonEmpty.unwrap()

        expect(unwrapped).toEqual(Enum.variant('Greeting', { payload: num }))
    })

    test('Unwraps empty enum', () => {
        expect(Msg.fromValue(Enum.variant('Quit')).unwrap()).toEqual(Enum.variant('Quit'))
    })

    test('Unwraps array', () => {
        expect(Bool2.fromValue([Bool.fromValue(false), Bool.fromValue(false)]).unwrap()).toEqual([false, false])
    })

    test('Unwraps vec', () => {
        expect(VecBool.fromValue([Bool.fromValue(true)]).unwrap()).toEqual([true])
    })

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
        )
    })

    test('Unwraps Set', () => {
        expect(SET.fromValue(new Set([Str.fromValue('A'), Str.fromValue('B')])).unwrap()).toEqual(new Set(['A', 'B']))
    })

    test('Unwraps tuple', () => {
        expect(TUPLE.fromValue([Bool.fromValue(false), Str.fromValue('._.')]).unwrap()).toEqual([false, '._.'])
    })
})

describe('Wrapping back', () => {
    test('Wraps primitive (str)', () => {
        expect(Str.wrap('kelti')).toEqual(Str.fromValue('kelti'))
    })

    test('Wraps struct with struct with primitive', () => {
        expect(
            StructWithKey.wrap({
                key: {
                    payload: 71n,
                },
            }),
        ).toEqual(
            StructWithKey.fromValue({
                key: Key.fromValue({
                    payload: I128.fromValue(71n),
                }),
            }),
        )
    })

    test("Wraps enum's contents", () => {
        expect(
            Msg.wrap(
                Enum.variant('Greeting', {
                    payload: 67n,
                }),
            ),
        ).toEqual(
            Msg.fromValue(
                Enum.variant(
                    'Greeting',
                    Key.fromValue({
                        payload: I128.fromValue(67n),
                    }),
                ),
            ),
        )
    })

    test('Wraps empty enum', () => {
        expect(Msg.wrap(Enum.variant('Quit'))).toEqual(Msg.fromValue(Enum.variant('Quit')))
    })

    test('Wraps array', () => {
        expect(Bool2.wrap([false, true])).toEqual(Bool2.fromValue([Bool.fromValue(false), Bool.fromValue(true)]))
    })

    test('Wraps vec', () => {
        expect(VecBool.wrap([true, true])).toEqual(VecBool.fromValue([Bool.fromValue(true), Bool.fromValue(true)]))
    })

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
        )
    })

    test('Wraps set', () => {
        expect(SET.wrap(new Set(['a', 'b']))).toEqual(SET.fromValue(new Set([Str.fromValue('a'), Str.fromValue('b')])))
    })

    test('Wraps tuple', () => {
        expect(TUPLE.wrap([false, 'true'])).toEqual(TUPLE.fromValue([Bool.fromValue(false), Str.fromValue('true')]))
    })
})
