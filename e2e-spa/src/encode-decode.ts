import {
    Array_Vec_HashMap_str_Id_8,
    CustomEnum,
    HashMap_str_Id,
    Id,
    Option_str,
    Tuple_str_i32,
    Tuple_u64_bool_str_i32,
    Vec_HashMap_str_Id,
} from './namespace';
import { Enum, Result, JSBI, Str, U64, Bool, I32 } from '@scale-codec/definition-runtime';
import deepEqual from 'fast-deep-equal';

export function encodeAndDecodeReallyComplexData(): Result<null, Error> {
    try {
        const data = Array_Vec_HashMap_str_Id_8.fromValue([
            // [
            //     new Map([
            //         [
            //             'some-key',
            //             {
            //                 name: 'Alice',
            //                 second_name: Enum.create('None'),
            //                 domain: 'wonderland',
            //                 enum: Enum.create('Two', [JSBI.BigInt(4412), false, ['nope', JSBI.BigInt(2)]]),
            //             },
            //         ],
            //         [
            //             'another',
            //             {
            //                 name: 'Charlie',
            //                 second_name: Enum.create('Some', 'Watson'),
            //                 domain: 'netherland',
            //                 enum: Enum.create('One'),
            //             },
            //         ],
            //     ]),
            // ],
            Vec_HashMap_str_Id.fromValue([
                HashMap_str_Id.fromValue(
                    new Map([
                        [
                            Str.fromValue('some-key'),
                            Id.fromValue({
                                name: Str.fromValue('Alice'),
                                second_name: Option_str.fromValue(Enum.empty('None')),
                                domain: Str.fromValue('wonderland'),
                                enum: CustomEnum.fromValue(
                                    Enum.valuable(
                                        'Two',
                                        Tuple_u64_bool_str_i32.fromValue([
                                            U64.fromValue(JSBI.BigInt(4412)),
                                            Bool.fromValue(false),
                                            Tuple_str_i32.fromValue([
                                                Str.fromValue('nope'),
                                                I32.fromValue(JSBI.BigInt(2)),
                                            ]),
                                        ]),
                                    ),
                                ),
                            }),
                        ],
                    ]),
                ),
            ]),
            Vec_HashMap_str_Id.fromValue([]),
            Vec_HashMap_str_Id.fromValue([]),
            Vec_HashMap_str_Id.fromValue([]),
            Vec_HashMap_str_Id.fromValue([]),
            Vec_HashMap_str_Id.fromValue([]),
            Vec_HashMap_str_Id.fromValue([]),
            Vec_HashMap_str_Id.fromValue([]),
        ]);

        const encoded = data.bytes;
        const decoded = Array_Vec_HashMap_str_Id_8.fromBytes(encoded);

        // const encoded = Array_Vec_HashMap_str_Id_8_encode(data);
        // const [decoded] = Array_Vec_HashMap_str_Id_8_decode(encoded);

        if (!deepEqual(data, decoded)) {
            throw new Error('Not equals >:(');
        }

        return Enum.valuable('Ok', null);
    } catch (err: any) {
        // throw err;
        return Enum.valuable('Err', err);
    }
}
