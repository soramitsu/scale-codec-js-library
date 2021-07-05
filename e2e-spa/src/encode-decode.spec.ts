import { Result, Enum } from '@scale-codec/enum';
import { encodeAndDecodeReallyComplexData } from './encode-decode';

test('it is ok', () => {
    const result = encodeAndDecodeReallyComplexData();
    const expected: Result<null, Error> = Enum.create('Ok', null);

    expect(result).toEqual(expected);
});
