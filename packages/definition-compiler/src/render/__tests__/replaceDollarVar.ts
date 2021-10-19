import { replaceDollarVar } from '../util';

test('Throws if var is not in the source string', () => {
    expect(() => replaceDollarVar('some test without any vars', 'arg', 'val')).toThrow();
});

test('Replaces variable with value', () => {
    expect(replaceDollarVar('return fn($arg)', 'arg', 'bytes')).toEqual('return fn(bytes)');
});
