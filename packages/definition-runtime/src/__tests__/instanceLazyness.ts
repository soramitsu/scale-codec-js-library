/* eslint-disable @typescript-eslint/no-unused-expressions */
import { decodeBool, decodeTuple, encodeBool, encodeTuple } from '@scale-codec/core';
import { createBuilder, FragmentFromBuilder } from '../fragment';
import { dynGetters } from '../builder-creators';

describe('Within TupleBool', () => {
    function prepare(): [
        // eslint-disable-next-line no-undef
        typeof Bool,
        // eslint-disable-next-line no-undef
        typeof TupleBool,
        typeof encodeBool,
        typeof decodeBool,
        typeof encodeTuple,
        typeof decodeTuple,
    ] {
        const encodeBoolSpy = jest.fn(encodeBool);
        const decodeBoolSpy = jest.fn(decodeBool);
        const encodeTupleSpy = jest.fn(encodeTuple) as typeof encodeTuple;
        const decodeTupleSpy = jest.fn(decodeTuple) as typeof decodeTuple;

        const Bool = createBuilder<boolean>('Bool', encodeBoolSpy, decodeBoolSpy);

        const TupleBool = createBuilder<[FragmentFromBuilder<typeof Bool>]>(
            'TupleBool',
            (val) => encodeTupleSpy(val, [(x) => x.bytes]),
            (bytes) => decodeTupleSpy(bytes, [(x) => Bool.decodeRaw(x)]),
        );

        return [Bool, TupleBool, encodeBoolSpy, decodeBoolSpy, encodeTupleSpy, decodeTupleSpy];
    }

    test('Encode the inner bool and then the whole tuple', () => {
        const [Bool, TupleBool, encodeBool, , encodeTuple] = prepare();

        const tup = TupleBool.fromValue([Bool.fromValue(false)]);

        expect(tup.value[0].value).toEqual(false);
        expect(encodeBool).not.toHaveBeenCalled();
        expect(encodeTuple).not.toHaveBeenCalled();

        tup.value[0].bytes;

        expect(encodeBool).toHaveBeenCalledWith(false);
        expect(encodeTuple).not.toHaveBeenCalled();

        tup.bytes;

        expect(encodeBool).toHaveBeenCalledTimes(1);
        expect(encodeTuple).toHaveBeenCalledTimes(1);
    });

    test('Encode the whole tuple, and the inner bool saves its bytes', () => {
        const [Bool, TupleBool, encodeBool, , encodeTuple] = prepare();

        const tup = TupleBool.fromValue([Bool.fromValue(true)]);
        tup.bytes;

        expect(encodeBool).toHaveBeenCalledTimes(1);
        expect(encodeTuple).toHaveBeenCalledTimes(1);

        tup.value[0].bytes;

        expect(encodeBool).toHaveBeenCalledTimes(1);
    });

    test('Inner bool saves its bytes on tuple decoding', () => {
        const [Bool, TupleBool, encodeBool, decodeBool, encodeTuple, decodeTuple] = prepare();

        const source = TupleBool.fromValue([Bool.fromValue(true)]);
        const bytes = source.bytes;
        const decoded = TupleBool.fromBytes(bytes);

        expect(decodeBool).toHaveBeenCalledTimes(0);
        expect(decodeTuple).toHaveBeenCalledTimes(0);

        const [innerBool] = decoded.value;

        expect(decodeBool).toHaveBeenCalledTimes(1);
        expect(decodeTuple).toHaveBeenCalledTimes(1);

        innerBool.value;
        innerBool.bytes;

        expect(decodeBool).toHaveBeenCalledTimes(1);
        expect(encodeBool).toHaveBeenCalledTimes(1);
        expect(encodeTuple).toHaveBeenCalledTimes(1);
    });
});

test('Alias decoding is lazy', () => {
    const decodeBoolSpy = jest.fn(decodeBool);
    const Bool = createBuilder<boolean>('Bool', encodeBool, decodeBoolSpy);
    const BoolAlias = dynGetters(() => Bool);

    const item = BoolAlias.fromBytes(new Uint8Array([1]));

    expect(decodeBoolSpy).toBeCalledTimes(0);

    item.value;

    expect(decodeBoolSpy).toBeCalledTimes(1);
});
