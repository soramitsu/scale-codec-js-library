import { NamespaceDefinition } from '@scale-codec/definition-compiler'

const definition: NamespaceDefinition = {
  Option_str: {
    t: 'option',
    some: 'Str',
  },
  Tuple_str_i32: {
    t: 'tuple',
    items: ['Str', 'I32'],
  },
  Tuple_u64_bool_str_i32: {
    t: 'tuple',
    items: ['U64', 'Bool', 'Tuple_str_i32'],
  },
  Id: {
    t: 'struct',
    fields: [
      {
        name: 'name',
        ref: 'Str',
      },
      {
        name: 'domain',
        ref: 'Str',
      },
      {
        name: 'second_name',
        ref: 'Option_str',
      },
      {
        name: 'enum',
        ref: 'CustomEnum',
      },
    ],
  },
  CustomEnum: {
    t: 'enum',
    variants: [
      {
        name: 'One',
        ref: null,
        discriminant: 0,
      },
      {
        name: 'Two',
        ref: 'Tuple_u64_bool_str_i32',
        discriminant: 1,
      },
    ],
  },
  HashMap_str_Id: {
    t: 'map',
    key: 'Str',
    value: 'Id',
  },
  Vec_HashMap_str_Id: {
    t: 'vec',
    item: 'HashMap_str_Id',
  },
  Array_Vec_HashMap_str_Id_8: {
    t: 'array',
    item: 'Vec_HashMap_str_Id',
    len: 8,
  },
  // unimplemented
  // Result_Void_str: {
  //     t: 'result',
  //     ok: 'Void',
  //     err: 'str',
  // },
}

export default definition
