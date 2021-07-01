import {
    deBool,
    deMap,
    deString,
    deStruct,
    deTuple,
    deVec,
    serBool,
    serMap,
    serString,
    serStruct,
    serTuple,
    serVec,
} from './codecs';
import { Deserialize, JsonValue, Serialize } from './types';

describe('codecs', () => {
    test('ser str', () => {
        expect(serString('haha')).toEqual('haha');
    });

    test('de str', () => {
        expect(deString('ohoh')).toEqual('ohoh');
    });

    test('de str - throws if not str', () => {
        expect(() => deString(4123)).toThrow();
    });

    test('ser bool', () => {
        expect(serBool(false)).toEqual(false);
    });

    test('de bool', () => {
        expect(deBool(true)).toEqual(true);
    });

    test('de bool - throws if not bool', () => {
        expect(() => deBool(0)).toThrow();
    });

    test.todo('bigint serde');

    test('ser map', () => {
        type Key = {
            ref: string;
        };
        type Value = boolean;

        const ENTRIES: [Key, Value][] = [
            [{ ref: '1' }, false],
            [{ ref: '2' }, true],
            [{ ref: '3' }, true],
            [{ ref: '4' }, false],
        ];
        const map = new Map<Key, Value>(ENTRIES);
        const serKey: Serialize<Key> = (val) => val;

        expect(serMap(map, serKey, serBool)).toEqual(ENTRIES);
    });

    test('de map', () => {
        const INPUT = [
            [412, 'foo'],
            ['bar', false],
            [[1, 2, 3], 'ah yes'],
        ];
        const de: Deserialize<JsonValue> = (v) => v;

        expect(deMap(INPUT, de, de)).toEqual(new Map(INPUT as any));
    });

    test.todo('de map - throws errors if struct is invalid (array, entry array, entry array len = 2)');

    test('ser struct', () => {
        expect(
            serStruct(
                {
                    a: 412,
                    b: 'hi',
                },
                {
                    a: () => 1_000,
                    b: () => 'bye',
                },
            ),
        ).toEqual({
            a: 1_000,
            b: 'bye',
        });
    });

    test('de struct', () => {
        expect(
            deStruct<{ a: boolean; b: number }>(
                {
                    a: 'uuuf',
                    b: 4123,
                },
                {
                    b: () => 90,
                    a: () => false,
                },
            ),
        ).toEqual({
            a: false,
            b: 90,
        });
    });

    test.todo('de struct - object struct validation');

    test('ser tuple', () => {
        expect(serTuple<[string, boolean]>(['ats', false], [() => 'ok', () => 'T_T'])).toEqual(['ok', 'T_T']);
    });

    test('de tuple', () => {
        expect(deTuple<[string, boolean]>([1, 2], [() => 'hah', () => true])).toEqual(['hah', true]);
    });

    test('ser vec', () => {
        expect(serVec([1, 2, 3], (v) => v * 2)).toEqual([2, 4, 6]);
    });

    test('de vec', () => {
        expect(deVec([2, 4, 6], (v) => (v as number) / 2)).toEqual([1, 2, 3]);
    });
});
