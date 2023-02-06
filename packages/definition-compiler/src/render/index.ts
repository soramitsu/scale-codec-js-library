import { DefEnumVariant, DefStructField, NamespaceDefinition, RenderNamespaceDefinitionParams, TypeDef } from '../types'
import { Set as ImmutableSet, Seq } from 'immutable'
import { INDENTATION, createDIScope } from './util'
import { DefaultAvailableBuilders } from '../const'
import { Expression, LibName, ModelPart, RefScope, createNs } from './namespace'
import { match } from 'ts-pattern'

const ns = createNs<RuntimeLibExports, RuntimeLibTypeExports>()

type RuntimeLibExports = 'dynCodec' | KnownCreators

type RuntimeLibTypeExports =
  | 'Codec'
  | 'RustResult'
  | 'RustOption'
  | 'Opaque'
  | 'ArrayCodecAndFactory'
  | 'StructCodecAndFactory'
  | 'EnumCodecAndFactory'
  | 'SetCodecAndFactory'
  | 'MapCodecAndFactory'
  | 'Enumerate'

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

const DOUBLE_NEWLINE = '\n\n'

const SELF_TRANSPARENT = ns.part`__${ns.self}__transparent`

const selfOpaqueType = (): Expression => {
  const sym = ns.uniqueId('brand')
  return ns.join(
    [
      ns.part`declare const ${sym}: unique symbol`,
      ns.part`type ${ns.self} = ${ns.libTypeHelper('Opaque')}<${SELF_TRANSPARENT}, typeof ${sym}>`,
    ],
    DOUBLE_NEWLINE,
  )
}

const GENERICS_SELF_TRANSPARENT_AND_SELF = ns.part`<${SELF_TRANSPARENT}, ${ns.self}>`

const GENERICS_SELF = ns.part`<${ns.self}>`

const declareUniqueSymbol = (id: Expression): Expression => ns.part`declare const ${id}: unique symbol`

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
  const actualDef = ns.part`type ${SELF_TRANSPARENT} = ${ns.refType(item)}[]`
  const codec = ns.concat(
    ns.part`const ${ns.self}: ${ns.libTypeHelper('ArrayCodecAndFactory')}${GENERICS_SELF_TRANSPARENT_AND_SELF}`,
    ns.part` = ${ns.libRuntimeHelper('createVecCodec')}${GENERICS_SELF_TRANSPARENT_AND_SELF}`,
    ns.part`('${ns.self}', ${ns.refVar(item)})`,
  )

  return ns.join([actualDef, selfOpaqueType(), codec], DOUBLE_NEWLINE)
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
      ns.part`interface ${SELF_TRANSPARENT} {\n${INDENTATION}${ns.join(typeActualFields, `\n${INDENTATION}`)}\n}`,
      selfOpaqueType(),
      ns.concat(
        ns.part`const ${ns.self}: ${ns.libTypeHelper('StructCodecAndFactory')}`,
        GENERICS_SELF_TRANSPARENT_AND_SELF,
        ns.part` = ${ns.libRuntimeHelper('createStructCodec')}`,
        GENERICS_SELF_TRANSPARENT_AND_SELF,
        ns.part`('${ns.self}', [\n${INDENTATION}`,
        ns.join([...codecSchema], `,\n${INDENTATION}`),
        '\n])',
      ),
    ],
    '\n\n',
  )
}

function modelTuple(refs: string[]): ModelPart {
  if (!refs.length) {
    return modelVoidAlias()
  }

  const { rollupSingleTuples } = injectRenderParams()
  if (rollupSingleTuples && refs.length === 1) return modelAlias(refs[0])

  return ns.join(
    [
      ns.part`type ${SELF_TRANSPARENT} = [${ns.join(
        refs.map((x) => ns.refType(x)),
        ', ',
      )}]`,
      selfOpaqueType(),
      ns.concat(
        ns.part`const ${ns.self}: ${ns.libTypeHelper('ArrayCodecAndFactory')}`,
        GENERICS_SELF_TRANSPARENT_AND_SELF,
        ns.part` = ${ns.libRuntimeHelper('createTupleCodec')}`,
        GENERICS_SELF_TRANSPARENT_AND_SELF,
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
    // TODO if `variant.name` is valid TS id, omit quotes
    const variantNameAsKey = ns.part`'${variant.name}'`

    if (variant.ref) {
      return {
        type: ns.part`${variantNameAsKey}: [${ns.refType(variant.ref)}]`,
        schema: ns.part`[${String(variant.discriminant)}, '${variant.name}', ${ns.refVar(variant.ref)}]`,
      }
    }
    return {
      type: ns.part`${variantNameAsKey}: []`,
      schema: ns.part`[${String(variant.discriminant)}, '${variant.name}']`,
    }
  })

  const selfEnumTypeId = ns.part`__${ns.self}__enum`
  const brand = ns.uniqueId('brand')

  return ns.join(
    [
      // type self_enum = Enumerate<{ ... }>
      ns.concat(
        ns.part`type ${selfEnumTypeId} = ${ns.libTypeHelper('Enumerate')}<{\n`,
        ...parsed.map((x) => ns.concat(INDENTATION, x.type)).interpose(ns.part`\n`),
        ns.part`\n}>`,
      ),
      declareUniqueSymbol(brand),
      // type self = Opaque<self_enum, brand>
      ns.concat('type ', ns.self, ' = ', ns.libTypeHelper('Opaque'), '<', selfEnumTypeId, ', typeof ', brand, '>'),
      // const self: EnumCodecAndFactory<self> = createEnumCodec<self>(...)
      ns.concat(
        ns.part`const ${ns.self}: ${ns.libTypeHelper('EnumCodecAndFactory')}`,
        GENERICS_SELF,
        ns.part` = ${ns.libRuntimeHelper('createEnumCodec')}`,
        GENERICS_SELF,
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
      ns.part`type ${SELF_TRANSPARENT} = Set<${ns.refType(item)}>`,
      selfOpaqueType(),
      ns.concat(
        ns.part`const ${ns.self}: ${ns.libTypeHelper('SetCodecAndFactory')}`,
        GENERICS_SELF_TRANSPARENT_AND_SELF,
        ns.part` = ${ns.libRuntimeHelper('createSetCodec')}`,
        GENERICS_SELF_TRANSPARENT_AND_SELF,
        ns.part`('${ns.self}', ${ns.refVar(item)})`,
      ),
    ],
    '\n\n',
  )
}

function modelMap(key: string, value: string): ModelPart {
  return ns.join(
    [
      ns.part`type ${SELF_TRANSPARENT} = Map<${ns.refType(key)}, ${ns.refType(value)}>`,
      selfOpaqueType(),
      ns.concat(
        ns.part`const ${ns.self}: ${ns.libTypeHelper('MapCodecAndFactory')}`,
        GENERICS_SELF_TRANSPARENT_AND_SELF,
        ns.part` = ${ns.libRuntimeHelper('createMapCodec')}`,
        GENERICS_SELF_TRANSPARENT_AND_SELF,
        ns.part`('${ns.self}', ${ns.refVar(key)}, ${ns.refVar(value)})`,
      ),
    ],
    '\n\n',
  )
}

function modelArray(item: string, len: number): ModelPart {
  return ns.join(
    [
      ns.part`interface ${SELF_TRANSPARENT} extends Array<${ns.refType(item)}> {}`,
      selfOpaqueType(),
      ns.concat(
        ns.part`const ${ns.self}: ${ns.libTypeHelper('ArrayCodecAndFactory')}`,
        GENERICS_SELF_TRANSPARENT_AND_SELF,
        ns.part` = ${ns.libRuntimeHelper('createArrayCodec')}`,
        GENERICS_SELF_TRANSPARENT_AND_SELF,
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
  const brand = ns.uniqueId('brand')

  return ns.join(
    [
      declareUniqueSymbol(brand),
      ns.concat(
        'type ',
        ns.self,
        ' = ',
        ns.libTypeHelper('Opaque'),
        '<',
        ns.libTypeHelper('RustOption'),
        '<',
        ns.refType(some),
        '>, typeof ',
        brand,
        '>',
      ),
      ns.concat(
        ns.part`const ${ns.self}: ${ns.libTypeHelper('EnumCodecAndFactory')}`,
        GENERICS_SELF,
        ns.part` = ${ns.libRuntimeHelper('createOptionCodec')}`,
        GENERICS_SELF,
        ns.part`('${ns.self}', ${ns.refVar(some)})`,
      ),
    ],
    '\n\n',
  )
}

function modelResult(ok: string, err: string): ModelPart {
  const brand = ns.uniqueId('brand')

  return ns.join(
    [
      declareUniqueSymbol(brand),
      ns.concat(
        'type ',
        ns.self,
        ' = ',
        ns.libTypeHelper('Opaque'),
        '<',
        ns.libTypeHelper('RustResult'),
        ns.part`<${ns.refType(ok)}, ${ns.refType(err)}>, typeof `,
        brand,
        '>',
      ),
      ns.concat(
        ns.part`const ${ns.self}: ${ns.libTypeHelper('EnumCodecAndFactory')}`,
        GENERICS_SELF,
        ns.part` = ${ns.libRuntimeHelper('createResultCodec')}`,
        GENERICS_SELF,
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
  return match(def)
    .with({ t: 'alias' }, ({ ref }) => modelAlias(ref))
    .with({ t: 'vec' }, ({ item }) => modelVec(item))
    .with({ t: 'struct' }, ({ fields }) => modelStruct(fields))
    .with({ t: 'tuple' }, ({ items }) => modelTuple(items))
    .with({ t: 'enum' }, ({ variants }) => modelEnum(variants))
    .with({ t: 'set' }, ({ entry }) => modelSet(entry))
    .with({ t: 'map' }, ({ key, value }) => modelMap(key, value))
    .with({ t: 'array' }, ({ item, len }) => modelArray(item, len))
    .with({ t: 'bytes-array' }, ({ len }) => modelBytesArray(len))
    .with({ t: 'option' }, ({ some }) => modelOption(some))
    .with({ t: 'result' }, ({ ok, err }) => modelResult(ok, err))
    .with({ t: 'import' }, (def) => renderImport(def))
    .exhaustive()
}

function renderParticularDef(tyName: string, def: TypeDef): RefScope {
  return ns.refScope(tyName)`${modelizeTypeDef(def)}`
}

/**
 * Renders provided definition into a valid TypeScript code.
 */
export function renderNamespaceDefinition(
  definition: NamespaceDefinition,
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
