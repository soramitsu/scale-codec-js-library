import { dynBuilder } from '../builder-creators';
import { ScaleInstance } from '../instance';
import { Bool } from '../presets';

const DynBool = dynBuilder(() => Bool);

function compareInstances(actual: ScaleInstance<any>, expected: ScaleInstance<any>) {
    expect(actual.unwrap()).toEqual(expected.unwrap());
    expect(actual.bytes).toEqual(expected.bytes);
}

test('fromValue() works as original', () => {
    compareInstances(DynBool.fromValue(false), Bool.fromValue(false));
});

test('fromBytes() works as original', () => {
    compareInstances(DynBool.fromBytes(new Uint8Array([1])), Bool.fromBytes(new Uint8Array([1])));
});

test('decodeRaw() the same', () => {
    const bytes = new Uint8Array([0]);
    const [a1, a2] = DynBool.decodeRaw(bytes);
    const [b1, b2] = Bool.decodeRaw(bytes);

    expect(a2).toEqual(b2);
    compareInstances(a1, b1);
});

test('wrap() the same', () => {
    compareInstances(DynBool.wrap(true), Bool.wrap(true));
});
