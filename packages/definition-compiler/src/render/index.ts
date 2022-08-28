import { DefEnumVariant, DefStructField, RenderNamespaceDefinitionParams, TypeDef, TypesDefinition } from '../types'
import { Set as ImmutableSet, Seq } from 'immutable'
import { createDIScope } from './util'
import { DefaultAvailableBuilders } from '../const'
import { Expression, LibName, ModelPart, RefScope, createNs } from './namespace'

const ns = createNs<RuntimeLibExports, RuntimeLibTypeExports>()

type RuntimeLibExports = 'dynCodec' | KnownCreators | 'Enum'

type RuntimeLibTypeExports =
  | 'Codec'
  | 'Result'
  | 'Option'
  | 'Opaque'
  | 'ArrayCodecAndFactory'
  | 'StructCodecAndFactory'
  | 'EnumCodecAndFactory'
  | 'SetCodecAndFactory'
  | 'MapCodecAndFactory'

type KnownCreators = `create${
  | 'Map'
  | 'Set'
  | 'Array'
  | 'ArrayU8'
  | 'Vec'
  | 'Struct'
  | 'Enum'
  | 'Option'
  | 'Tuple'
  | 'Result'}Codec`

// =========

interface RenderParams {
  rollupSingleTuples: boolean
  typeForVoidAlias: string
}

const { provide: provideRenderParams, inject: injectRenderParams } = createDIScope<RenderParams>()

// =========

const SELF_ACTUAL = ns.part`${ns.self}__actual`

const INTERFACE_SELF_ACTUAL_OPAQUE = ns.part`interface ${ns.self} extends ${ns.libTypeHelper(
  'Opaque',
)}<${SELF_ACTUAL}, ${ns.self}> {}`

const GENERICS_SELF_ACTUAL_AND_SELF = ns.part`<${SELF_ACTUAL}, ${ns.self}>`

const INDENTATION = ' '.repeat(4)

function modelAlias(to: string): ModelPart {
  return ns.join(
    [
      ns.part`type ${ns.self} = ${ns.refType(to)}`,
      ns.concat(ns.part`const ${ns.self}: ${ns.libTypeHelper('Codec')}<${ns.self}>`, ns.part` = ${ns.refVar(to)}`),
    ],
    '\n\n',
  )
}

function modelVoidAlias(): ModelPart {
  return renderImport({ nameInModule: injectRenderParams().typeForVoidAlias, module: ns.lib })
}

function modelVec(item: string): ModelPart {
  const actualDef = ns.part`type ${SELF_ACTUAL} = ${ns.refType(item)}[]`
  const typePart = ns.part`interface ${ns.self} extends ${ns.libTypeHelper('Opaque')}<${SELF_ACTUAL}, ${ns.self}> {}`
  const codec = ns.part`const ${ns.self}: ${ns.libTypeHelper(
    'ArrayCodecAndFactory',
  )}${GENERICS_SELF_ACTUAL_AND_SELF} = ${ns.libRuntimeHelper('createVecCodec')}${GENERICS_SELF_ACTUAL_AND_SELF}('${
    ns.self
  }', ${ns.refVar(item)})`

  return ns.part`${actualDef}\n\n${typePart}\n\n${codec}`
}

function modelStruct(fields: DefStructField[]): ModelPart {
  if (!fields.length) {
    return modelVoidAlias()
  }

  const seq = Seq(fields)

  const typeActualFields = seq.map((x) => ns.part`${x.name}: ${ns.refType(x.ref)}`)
  const codecSchema = seq.map((x) => ns.part`['${x.name}', ${ns.refVar(x.ref)}]`)

  return ns.join(
    [
      ns.part`interface ${SELF_ACTUAL} {\n${INDENTATION}${ns.join(typeActualFields, `\n${INDENTATION}`)}\n}`,
      INTERFACE_SELF_ACTUAL_OPAQUE,
      ns.concat(
        ns.part`const ${ns.self}: ${ns.libTypeHelper('StructCodecAndFactory')}`,
        GENERICS_SELF_ACTUAL_AND_SELF,
        ns.part` = ${ns.libRuntimeHelper('createStructCodec')}`,
        GENERICS_SELF_ACTUAL_AND_SELF,
        ns.part`('${ns.self}', [\n${INDENTATION}`,
        ns.join([...codecSchema], `,\n${INDENTATION}`),
        '\n])',
      ),
    ],
    '\n\n',
  )
}

function renderTuple(refs: string[]): ModelPart {
  if (!refs.length) {
    return modelVoidAlias()
  }

  const { rollupSingleTuples } = injectRenderParams()
  if (rollupSingleTuples && refs.length === 1) return modelAlias(refs[0])

  return ns.join(
    [
      ns.part`type ${SELF_ACTUAL} = [${ns.join(
        refs.map((x) => ns.refType(x)),
        ', ',
      )}]`,
      INTERFACE_SELF_ACTUAL_OPAQUE,
      ns.concat(
        ns.part`const ${ns.self}: ${ns.libTypeHelper('ArrayCodecAndFactory')}`,
        GENERICS_SELF_ACTUAL_AND_SELF,
        ns.part` = ${ns.libRuntimeHelper('createTupleCodec')}`,
        GENERICS_SELF_ACTUAL_AND_SELF,
        ns.part`('${ns.self}', [`,
        ns.join(
          refs.map((x) => ns.refVar(x)),
          ', ',
        ),
        '])',
      ),
    ],
    '\n\n',
  )
}

function modelEnum(variants: DefEnumVariant[]): ModelPart {
  const parsed = Seq(variants).map<{ type: ModelPart; schema: ModelPart }>((variant) => {
    if (variant.ref) {
      return {
        type: ns.part`['${variant.name}', ${ns.refType(variant.ref)}]`,
        schema: ns.part`[${String(variant.discriminant)}, '${variant.name}', ${ns.refVar(variant.ref)}]`,
      }
    }
    return {
      type: ns.part`'${variant.name}'`,
      schema: ns.part`[${String(variant.discriminant)}, '${variant.name}']`,
    }
  })

  return ns.join(
    [
      ns.concat(
        ns.part`type ${SELF_ACTUAL} = ${ns.libRuntimeHelper('Enum')}<\n`,
        INDENTATION,
        ...parsed.map<Expression>((x) => ns.part`| ${x.type}`).interpose('\n' + INDENTATION),
        '\n>',
      ),
      INTERFACE_SELF_ACTUAL_OPAQUE,
      ns.concat(
        ns.part`const ${ns.self}: ${ns.libTypeHelper('EnumCodecAndFactory')}`,
        ns.part`<${ns.self}>`,
        ns.part` = ${ns.libRuntimeHelper('createEnumCodec')}`,
        GENERICS_SELF_ACTUAL_AND_SELF,
        ns.part`('${ns.self}', [\n${INDENTATION}`,
        ns.join(
          parsed.map((x) => x.schema),
          ',\n' + INDENTATION,
        ),
        `\n])`,
      ),
    ],
    '\n\n',
  )
}

function modelSet(item: string): ModelPart {
  return ns.join(
    [
      ns.part`type ${SELF_ACTUAL} = Set<${ns.refType(item)}>`,
      INTERFACE_SELF_ACTUAL_OPAQUE,
      ns.concat(
        ns.part`const ${ns.self}: ${ns.libTypeHelper('SetCodecAndFactory')}`,
        GENERICS_SELF_ACTUAL_AND_SELF,
        ns.part` = ${ns.libRuntimeHelper('createSetCodec')}`,
        GENERICS_SELF_ACTUAL_AND_SELF,
        ns.part`('${ns.self}', ${ns.refVar(item)})`,
      ),
    ],
    '\n\n',
  )
}

function modelMap(key: string, value: string): ModelPart {
  return ns.join(
    [
      ns.part`type ${SELF_ACTUAL} = Map<${ns.refType(key)}, ${ns.refType(value)}>`,
      INTERFACE_SELF_ACTUAL_OPAQUE,
      ns.concat(
        ns.part`const ${ns.self}: ${ns.libTypeHelper('MapCodecAndFactory')}`,
        GENERICS_SELF_ACTUAL_AND_SELF,
        ns.part` = ${ns.libRuntimeHelper('createMapCodec')}`,
        GENERICS_SELF_ACTUAL_AND_SELF,
        ns.part`('${ns.self}', ${ns.refVar(key)}, ${ns.refVar(value)})`,
      ),
    ],
    '\n\n',
  )
}

function modelArray(item: string, len: number): ModelPart {
  return ns.join(
    [
      ns.part`interface ${SELF_ACTUAL} extends Array<${ns.refType(item)}> {}`,
      INTERFACE_SELF_ACTUAL_OPAQUE,
      ns.concat(
        ns.part`const ${ns.self}: ${ns.libTypeHelper('ArrayCodecAndFactory')}`,
        GENERICS_SELF_ACTUAL_AND_SELF,
        ns.part` = ${ns.libRuntimeHelper('createArrayCodec')}`,
        GENERICS_SELF_ACTUAL_AND_SELF,
        ns.part`('${ns.self}', ${ns.refVar(item)}, ${String(len)})`,
      ),
    ],
    '\n\n',
  )
}

function modelBytesArray(len: number): ModelPart {
  return ns.join(
    [
      ns.part`type ${ns.self} = Uint8Array`,
      ns.concat(
        ns.part`const ${ns.self}: ${ns.libTypeHelper('Codec')}<${ns.self}>`,
        ns.part` = ${ns.libRuntimeHelper('createArrayU8Codec')}('${ns.self}', ${String(len)})`,
      ),
    ],
    '\n\n',
  )
}

function modelOption(some: string): ModelPart {
  return ns.join(
    [
      ns.part`interface ${SELF_ACTUAL} extends ${ns.libTypeHelper('Option')}<${ns.refType(some)}> {}`,
      INTERFACE_SELF_ACTUAL_OPAQUE,
      ns.concat(
        ns.part`const ${ns.self}: ${ns.libTypeHelper('EnumCodecAndFactory')}`,
        ns.part`<${ns.self}>`,
        ns.part` = ${ns.libRuntimeHelper('createOptionCodec')}`,
        GENERICS_SELF_ACTUAL_AND_SELF,
        ns.part`('${ns.self}', ${ns.refVar(some)})`,
      ),
    ],
    '\n\n',
  )
}

function modelResult(ok: string, err: string): ModelPart {
  return ns.join(
    [
      ns.concat(
        ns.part`interface ${SELF_ACTUAL} extends ${ns.libTypeHelper('Result')}`,
        ns.part`<${ns.refType(ok)}, ${ns.refType(err)}> {}`,
      ),
      INTERFACE_SELF_ACTUAL_OPAQUE,
      ns.concat(
        ns.part`const ${ns.self}: ${ns.libTypeHelper('EnumCodecAndFactory')}`,
        ns.part`<${ns.self}>`,
        ns.part` = ${ns.libRuntimeHelper('createResultCodec')}`,
        GENERICS_SELF_ACTUAL_AND_SELF,
        ns.part`('${ns.self}', ${ns.refVar(ok)}, ${ns.refVar(err)})`,
      ),
    ],
    '\n\n',
  )
}

function renderImport({
  nameInModule,
  module: moduleName,
}: {
  nameInModule?: string | null
  module: string | typeof LibName
}): ModelPart {
  return ns.part`${ns.import({
    importWhat: nameInModule || ns.self,
    importAs: nameInModule ? ns.self : undefined,
    moduleName: moduleName,
  })}`
}

function modelizeTypeDef(def: TypeDef): ModelPart {
  switch (def.t) {
    case 'alias':
      return modelAlias(def.ref)
    case 'vec':
      return modelVec(def.item)
    case 'struct':
      return modelStruct(def.fields)
    case 'tuple':
      return renderTuple(def.items)
    case 'enum':
      return modelEnum(def.variants)
    case 'set':
      return modelSet(def.entry)
    case 'map':
      return modelMap(def.key, def.value)
    case 'array':
      return modelArray(def.item, def.len)
    case 'bytes-array':
      return modelBytesArray(def.len)
    case 'option':
      return modelOption(def.some)
    case 'result':
      return modelResult(def.ok, def.err)
    case 'import':
      return renderImport(def)
    default: {
      const uncovered: never = def
      throw new Error(`Undefined type definition: ${uncovered}`)
    }
  }
}

function renderParticularDef(tyName: string, def: TypeDef): RefScope {
  return ns.refScope(tyName)`${modelizeTypeDef(def)}`
}

/**
 * Renders provided definition into a valid TypeScript code.
 */
export function renderNamespaceDefinition(
  definition: TypesDefinition,
  params?: RenderNamespaceDefinitionParams,
): string {
  return provideRenderParams(
    {
      rollupSingleTuples: params?.rollupSingleTuplesIntoAliases ?? false,
      typeForVoidAlias: params?.typeForVoidAliasing ?? 'Void',
    },
    () => {
      return ns({
        refs: Seq(Object.entries(definition))
          .sortBy(([name]) => name)
          .map(([name, def]) => renderParticularDef(name, def))
          .toArray(),
      }).render({
        libModule: params?.runtimeLib ?? '@scale-codec/definition-runtime',
        libTypes: ImmutableSet(params?.runtimeTypes ?? DefaultAvailableBuilders),
        optimizeDyns: params?.optimizeDyns,
      })
    },
  )
}
