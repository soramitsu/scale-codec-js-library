import { Array_Vec_HashMap_str_Id_8 } from './namespace'
import { CodecValueDecoded, Enum, Result } from '@scale-codec/definition-runtime'
import deepEqual from 'fast-deep-equal'

export function encodeAndDecodeReallyComplexData(): Result<null, Error> {
    try {
        const data: CodecValueDecoded<typeof Array_Vec_HashMap_str_Id_8> = [
            [
                new Map([
                    [
                        'some-key',
                        {
                            name: 'Alice',
                            second_name: Enum.variant('None'),
                            domain: 'wonderland',
                            enum: Enum.variant('Two', [4412n, false, ['nope', 2]]),
                        },
                    ],
                    [
                        'another',
                        {
                            name: 'Charlie',
                            second_name: Enum.variant('Some', 'Watson'),
                            domain: 'netherland',
                            enum: Enum.variant('One'),
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
        ]

        const encoded = Array_Vec_HashMap_str_Id_8.toBuffer(data)
        const decoded = Array_Vec_HashMap_str_Id_8.fromBuffer(encoded)

        if (!deepEqual(data, decoded)) {
            throw new Error('Not equals >:(')
        }

        return Enum.variant('Ok', null)
    } catch (err: any) {
        return Enum.variant('Err', err)
    }
}
