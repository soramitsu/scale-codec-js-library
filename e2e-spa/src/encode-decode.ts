import {
    Array_Vec_HashMap_str_Id_8_decode,
    Array_Vec_HashMap_str_Id_8_Encodable,
    Array_Vec_HashMap_str_Id_8_encode,
} from './namespace';
import { Enum, Result, JSBI } from '@scale-codec/definition-runtime';
import deepEqual from 'fast-deep-equal';

export function encodeAndDecodeReallyComplexData(): Result<null, Error> {
    try {
        const data: Array_Vec_HashMap_str_Id_8_Encodable = [
            [
                new Map([
                    [
                        'some-key',
                        {
                            name: 'Alice',
                            second_name: Enum.create('None'),
                            domain: 'wonderland',
                            enum: Enum.create('Two', [JSBI.BigInt(4412), false, ['nope', JSBI.BigInt(2)]]),
                        },
                    ],
                    [
                        'another',
                        {
                            name: 'Charlie',
                            second_name: Enum.create('Some', 'Watson'),
                            domain: 'netherland',
                            enum: Enum.create('One'),
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

        const encoded = Array_Vec_HashMap_str_Id_8_encode(data);
        const [decoded] = Array_Vec_HashMap_str_Id_8_decode(encoded);

        if (!deepEqual(data, decoded)) {
            throw new Error('Not equals >:(');
        }

        return Enum.create('Ok', null);
    } catch (err: any) {
        // throw err;
        return Enum.create('Err', err);
    }
}
