export const FIELDS = ['foo', 'bar', 'baz', 'x', 'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'] as const

export type Fields = typeof FIELDS

export type BuildStruct<F extends readonly string[], V> = F extends readonly [
  infer Head extends string,
  ...infer Tail extends readonly string[],
]
  ? { [k in Head]: BuildStruct<Tail, V> }
  : V

function buildStruct<F extends readonly string[], V>(fields: F, value: V): BuildStruct<F, V> {
  if (!fields.length) return value as any
  const [head, ...tail] = fields
  return { [head]: buildStruct(tail, value) } as any
}

export type DeepStructUnit = BuildStruct<Fields, null>

export type DeepStructU32 = BuildStruct<Fields, number>

export const DEEP_STRUCT_UNIT: DeepStructUnit = buildStruct(FIELDS, null)

export const DEEP_STRUCT_U32: DeepStructU32 = buildStruct(FIELDS, 42)
