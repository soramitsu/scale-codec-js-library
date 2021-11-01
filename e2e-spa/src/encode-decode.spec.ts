import { Result, Enum } from '@scale-codec/definition-runtime';
import { encodeAndDecodeReallyComplexData } from './encode-decode';

test('it is ok', () => {
    const result = encodeAndDecodeReallyComplexData();
    const expected: Result<null, Error> = Enum.valuable('Ok', null);

    expect(result).toEqual(expected);
});
