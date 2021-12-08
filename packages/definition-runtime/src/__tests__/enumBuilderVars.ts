import { Enum, Valuable } from '@scale-codec/core';
import { createEnumBuilder, ScaleEnumBuilder, UnwrapScaleEnum } from '../builder-creators';
import { Fragment } from '../fragment';
import { Str } from '../presets';

describe('Test enum', () => {
    type TestEnum = Enum<{
        Plebs: null;
        Senatus: null;
        Patricius: Valuable<Fragment<string>>;
    }>;

    type TestBuilder = ScaleEnumBuilder<TestEnum>;

    function defineUnwrapEnum(x: UnwrapScaleEnum<TestEnum>): UnwrapScaleEnum<TestEnum> {
        return x;
    }

    function builderFactory(): TestBuilder {
        return createEnumBuilder('TestEnum', [
            [0, 'Plebs'],
            [1, 'Senatus'],
            [2, 'Patricius', Str],
        ]);
    }

    describe('Unwrapped variants', () => {
        test('Define empty variant', () => {
            const builder = builderFactory();

            expect(builder.variantsUnwrapped.Plebs).toEqual(defineUnwrapEnum(Enum.empty('Plebs')));
        });

        test('Defined empty variant is freezed', () => {
            const builder = builderFactory();

            expect(Object.isFrozen(builder.variantsUnwrapped.Plebs)).toBe(true);
        });

        test('On second call returns the same empty variant enum', () => {
            const builder = builderFactory();

            const first = builder.variantsUnwrapped.Senatus;
            const second = builder.variantsUnwrapped.Senatus;

            expect(first).toBe(second);
        });

        test('Define non-empty variant', () => {
            const builder = builderFactory();

            expect(builder.variantsUnwrapped.Patricius('Caesar')).toEqual(
                defineUnwrapEnum(Enum.valuable('Patricius', 'Caesar')),
            );
        });

        test('Second getter to non-empty variants returns the same function', () => {
            const builder = builderFactory();

            const first = builder.variantsUnwrapped.Patricius;
            const second = builder.variantsUnwrapped.Patricius;

            expect(first).toBe(second);
        });

        test('Non-empty variant function is freezed', () => {
            const builder = builderFactory();

            expect(Object.isFrozen(builder.variantsUnwrapped.Senatus)).toBe(true);
        });
    });

    describe('Wrapped variants', () => {
        test('Empty variant', () => {
            const builder = builderFactory();

            expect(builder.variants.Plebs.unwrap()).toEqual(builder.fromValue(Enum.empty('Plebs')).unwrap());
        });

        test('Valuable variant', () => {
            const builder = builderFactory();

            expect(builder.variants.Patricius(Str.wrap('Caesar')).unwrap()).toEqual(
                builder.fromValue(Enum.valuable('Patricius', Str.wrap('Caesar'))).unwrap(),
            );
        });
    });
});
