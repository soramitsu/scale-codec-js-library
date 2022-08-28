import { RenderNamespaceDefinitionParams } from '../src/types'

interface Sample {
  params: RenderNamespaceDefinitionParams
}

function defineSample(params: RenderNamespaceDefinitionParams): Sample {
  return { params }
}

export const aliases = defineSample({
  types: {
    B: 'Str',
    A: 'B',
    C: {
      t: 'struct-tuple',
      items: ['B', 'U8'],
    },
  },
})

export const externals = defineSample({
  types: {},
  imports: {
    '../externals-sample-help': [
      'JustExternalInclusion',
      {
        name: 'Str',
        importAs: 'WithCustomExternalName',
      },
    ],
  },
})

export const complexNamespace = defineSample({
  types: {
    Msg: {
      t: 'enum',
      variants: [
        {
          name: 'Quit',
          dis: 0,
        },
        {
          name: 'Greeting',
          dis: 1,
          value: 'Str',
        },
      ],
    },
    TwoMsg: {
      t: 'struct-tuple',
      items: ['Msg', 'Msg'],
    },
    StrAlias: 'Str',
    Character: {
      t: 'struct',
      fields: [
        {
          name: 'name',
          ref: 'Str',
        },
      ],
    },
    AllInOne: {
      t: 'struct',
      fields: [
        {
          name: 'tuple_with_opts',
          ref: 'TwoMsg',
        },
        {
          name: 'map',
          ref: 'Map<Str, U8>',
        },
        {
          name: 'alias',
          ref: 'StrAlias',
        },
        {
          name: 'another_struct',
          ref: 'Character',
        },
        {
          name: 'arr',
          ref: {
            t: 'array',
            type: 'U8',
            len: 2,
          },
        },
        {
          name: 'vec',
          ref: 'Vec<Bool>',
        },
      ],
    },
  },
})

export const structFieldsOrdering = defineSample({
  types: {
    Mystery: {
      t: 'struct',
      fields: [
        { name: 'b', ref: 'Str' },
        { name: 'a', ref: 'Compact' },
        { name: 'A', ref: 'Vec<U8>' },
      ],
    },
  },
})

/**
 * Some builder could be extended, e.g. enum builder.
 * Alias should handle it OK (type-only check).
 */
export const aliasToAnExtendedBuilder = defineSample({
  types: {
    Message: {
      t: 'enum',
      variants: [
        {
          name: 'Empty',
          dis: 0,
        },
      ],
    },
    Msg: 'Message',
  },
})

export const circular = defineSample({
  types: {
    Value: {
      t: 'enum',
      variants: [
        {
          name: 'Vec',
          dis: 0,
          value: 'Vec<Value>',
        },
        {
          name: 'Alias',
          dis: 1,
          value: 'Alias',
        },
      ],
    },
    Alias: 'Value',
  },
})

export const enumCases = defineSample({
  std: false,
  imports: {
    '../module': [
      'Simple',
      'Generic<T, U>',
      {
        name: 'InModule<T>',
        importAs: 'LocalName',
      },
    ],
  },
  types: {
    'Event<T>': {
      t: 'enum',
      variants: [
        {
          dis: 0,
          name: 'None',
        },
        // associated value
        {
          dis: 1,
          name: 'AssocVal',
          value: 'U64',
        },
        // associated value with static generic
        {
          dis: 2,
          name: 'AssocValStat',
          value: 'Option<Str>',
        },
        // associated generic value
        {
          dis: 3,
          name: 'AssocValGen',
          value: 'Option<T>',
        },
        // assoc tuple
        {
          dis: 4,
          name: 'AssocTuple',
          value: {
            t: 'struct-tuple',
            items: ['Str', 'U8'],
          },
        },
        // assoc tuple with gen
        {
          dis: 5,
          name: 'AssocTupleWithGen',
          value: {
            t: 'struct-tuple',
            items: ['T', 'T'],
          },
        },
        {
          dis: 6,
          name: 'AssocStruct',
          value: {
            t: 'struct',
            fields: [{ name: 'first', ref: 'Str' }],
          },
        },
        // inner struct with generic
        {
          dis: 7,
          name: 'AssocStructWithGen',
          value: {
            t: 'struct',
            fields: [
              {
                name: 'msg',
                ref: 'T',
              },
              {
                name: 'sender',
                ref: 'Str',
              },
            ],
          },
        },
      ],
    },
  },
})
