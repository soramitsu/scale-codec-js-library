import { Namespace, types } from './namespace';
import { Enum, Result } from '@scale-codec/enum';
import deepEqual from 'fast-deep-equal';
import JSBI from 'jsbi';

export function encodeAndDecodeReallyComplexData(): Result<null, Error> {
    try {
        const data: Namespace['[Vec<HashMap<str, Id>>; 8]'] = [
            [
                new Map([
                    [
                        'some-key',
                        {
                            name: 'Alice',
                            second_name: Enum.create('None'),
                            domain: 'wonderland',
                            attempt: Enum.create('Err', 'Oh no!'),
                            enum: Enum.create('Two', [JSBI.BigInt(4412), false, ['nope', 2]]),
                        },
                    ],
                    [
                        'another',
                        {
                            name: 'Charlie',
                            second_name: Enum.create('Some', 'Watson'),
                            domain: 'netherland',
                            enum: Enum.create('One'),
                            attempt: Enum.create('Ok', null),
                        },
                    ],
                ]),
            ],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
        ];

        const encoded = types.encode('[Vec<HashMap<str, Id>>; 8]', data);
        const decoded = types.decode('[Vec<HashMap<str, Id>>; 8]', encoded);

        if (!deepEqual(data, decoded)) {
            throw new Error('Not equals >:(');
        }

        return Enum.create('Ok', null);
    } catch (err) {
        return Enum.create('Err', err);
    }
}
