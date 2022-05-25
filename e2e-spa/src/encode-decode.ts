import {
  Array_Vec_HashMap_str_Id_8,
  CustomEnum,
  HashMap_str_Id,
  Id,
  Option_str,
  Tuple_u64_bool_str_i32,
} from './namespace'
import { Enum, Result } from '@scale-codec/definition-runtime'
import deepEqual from 'fast-deep-equal'

export function encodeAndDecodeReallyComplexData(): Result<null, Error> {
  try {
    const data = [
      [
        HashMap_str_Id(
          new Map([
            [
              'some-key',
              Id({
                name: 'Alice',
                second_name: Option_str('None'),
                domain: 'wonderland',
                enum: CustomEnum('Two', [4412n, false, ['nope', 2]] as Tuple_u64_bool_str_i32),
              }),
            ],
            [
              'another',
              Id({
                name: 'Charlie',
                second_name: Option_str('Some', 'Watson'),
                domain: 'netherland',
                enum: CustomEnum('One'),
              }),
            ],
          ]),
        ),
      ],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
    ] as Array_Vec_HashMap_str_Id_8

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
