import { Enum } from './enum';

describe('Enum', () => {
    test('is returns true', () => {
        const val: Enum<{
            a: null;
            b: { value: number };
        }> = Enum.empty('a');

        expect(val.is('a')).toBe(true);
    });

    test('is returns false', () => {
        const val: Enum<{
            a: null;
            b: { value: number };
        }> = Enum.empty('a');

        expect(val.is('b')).toBe(false);
    });

    test('as works fine', () => {
        const val: Enum<{
            a: null;
            b: { value: number };
        }> = Enum.valuable('b', 111);

        expect(val.as('b')).toBe(111);
    });

    test('as throws an error', () => {
        const val: Enum<{
            a: null;
            b: { value: number };
        }> = Enum.empty('a');

        expect(() => val.as('b')).toThrow();
    });

    test.each([['Single'], ['Double']])('match calls the desired callback (%p)', (variant: 'Single' | 'Double') => {
        interface Variants {
            Single: null;
            Double: null;
        }

        const matchMap = {
            Single: jest.fn(),
            Double: jest.fn(),
        };
        const other = variant === 'Double' ? 'Single' : 'Double';

        Enum.empty<Variants>(variant).match(matchMap);

        expect(matchMap[variant]).toBeCalled();
        expect(matchMap[other]).not.toBeCalled();
    });

    test('match calls it with inner value', () => {
        const val: Enum<{
            a: null;
            b: { value: string };
        }> = Enum.valuable('b', 'something');
        const spy = jest.fn();

        val.match({ a: () => {}, b: spy });

        expect(spy).toBeCalledWith('something');
    });

    test('match calls it with nothing', () => {
        const val: Enum<{
            a: null;
            b: { value: string };
        }> = Enum.empty('a');
        const spy = jest.fn();

        val.match({ a: spy, b: () => {} });

        expect(spy).toBeCalledWith();
    });

    test('match returns the result of callback', () => {
        const val: Enum<{
            a: null;
            b: { value: string };
        }> = Enum.empty('a');

        const result = val.match({ a: () => 'good', b: () => 'bad' });

        expect(result).toBe('good');
    });

    test('JSON repr of empty enum', () => {
        const val: Enum<{
            a: null;
            b: { value: string };
        }> = Enum.empty('a');

        expect(val.toJSON()).toEqual({ variant: 'a' });
    });

    test('JSON repr of valuable enum', () => {
        const val: Enum<{
            a: null;
            b: { value: string };
        }> = Enum.valuable('b', 'bobobo');

        expect(val.toJSON()).toEqual({ variant: 'b', value: 'bobobo' });
    });
});
