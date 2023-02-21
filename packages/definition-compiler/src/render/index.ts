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
  | `Codec${'Map' | 'Set' | 'Enum' | 'Array' | 'Struct'}`
  | 'RustResult'
  | 'RustOption'
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
  typeForUnitAlias: string
}

const { provide: provideRenderParams, inject: injectRenderParams } = createDIScope<RenderParams>()

// =========

const DOUBLE_NEWLINE = '\n\n'

const exprIdWithGenerics = (type: Expression, ...generics: Expression[]): Expression => {
  const parts: Expression[] = [type]
  if (generics.length) {
    parts.push('<')
    generics.forEach((expr, i) => {
      i > 0 && parts.push(', ')
      parts.push(expr)
    })
    parts.push('>')
  }
  return ns.concat(...parts)
}

const selfOpaqueType = (whatIsOpaque: Expression): Expression => {
  return ns.part`type ${ns.self} = ${exprIdWithGenerics(ns.Opaque, ns.part`'${ns.self}'`, whatIsOpaque)}`
}

function modelAlias(to: string): ModelPart {
  return ns.join(
    [
      ns.part`type ${ns.self} = ${ns.refType(to)}`,
      ns.concat(ns.part`const ${ns.self}: ${ns.libTypeHelper('Codec')}<${ns.self}>`, ns.part` = ${ns.refVar(to)}`),
    ],
    DOUBLE_NEWLINE,
  )
}

function modelUnitAlias(): ModelPart {
  return renderImport({ nameInModule: injectRenderParams().typeForUnitAlias, module: ns.lib })
}

function modelVec(item: string): ModelPart {
  return ns.join(
    [
      selfOpaqueType(ns.part`${ns.refType(item)}[]`),
      ns.concat(
        ns.part`const ${ns.self} = ${ns.libRuntimeHelper('createVecCodec')}`,
        ns.part`('${ns.self}', ${ns.refVar(item)}) as `,
        exprIdWithGenerics(ns.libTypeHelper('CodecArray'), ns.self),
      ),
    ],
    DOUBLE_NEWLINE,
  )
}

function modelStruct(fields: DefStructField[]): ModelPart {
  if (!fields.length) {
    return modelUnitAlias()
  }

  const seq = Seq(fields)

  const typeActualFields = seq.map((x) => ns.part`${x.name}: ${ns.refType(x.ref)}`)
  const codecSchema = seq.map((x) => ns.part`['${x.name}', ${ns.refVar(x.ref)}]`)

  return ns.join(
    [
      selfOpaqueType(ns.concat('{', ns.concat(...typeActualFields.map((x) => ns.concat('\n', INDENTATION, x))), '\n}')),
      ns.concat(
        ns.part`const ${ns.self} = ${ns.libRuntimeHelper('createStructCodec')}`,
        ns.part`('${ns.self}', [\n${INDENTATION}`,
        ns.join([...codecSchema], `,\n${INDENTATION}`),
        '\n]) as ',
        exprIdWithGenerics(ns.libTypeHelper('CodecStruct'), ns.self),
      ),
    ],
    DOUBLE_NEWLINE,
  )
}

function modelTuple(refs: string[]): ModelPart {
  if (!refs.length) {
    return modelUnitAlias()
  }

  const { rollupSingleTuples } = injectRenderParams()
  if (rollupSingleTuples && refs.length === 1) return modelAlias(refs[0])

  const pureTuple = ns.part`__${ns.self}__pureTuple`

  return ns.join(
    [
      ns.part`type ${pureTuple} = [${ns.join(
        refs.map((x) => ns.refType(x)),
        ', ',
      )}]`,
      selfOpaqueType(pureTuple),
      ns.concat(
        ns.part`const ${ns.self} = `,
        exprIdWithGenerics(ns.libRuntimeHelper('createTupleCodec'), pureTuple, ns.self),
        ns.part`('${ns.self}', [`,
        ns.join(
          refs.map((x) => ns.refVar(x)),
          ', ',
        ),
        '])',
      ),
    ],
    DOUBLE_NEWLINE,
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

  return ns.join(
    [
      selfOpaqueType(
        ns.concat(
          ns.part`{\n${INDENTATION}enum: `,
          exprIdWithGenerics(
            ns.libTypeHelper('Enumerate'),
            ns.concat(
              '{\n',
              ...parsed.map((x) => ns.concat(INDENTATION.repeat(2), x.type)).interpose(ns.part`\n`),
              `\n${INDENTATION}}`,
            ),
          ),
          '\n}',
        ),
      ),
      ns.concat(
        ns.part`const ${ns.self} = ${ns.libRuntimeHelper('createEnumCodec')}`,
        ns.part`('${ns.self}', [\n${INDENTATION}`,
        ns.join(
          parsed.map((x) => x.schema),
          ',\n' + INDENTATION,
        ),
        `\n]) as `,
        exprIdWithGenerics(ns.libTypeHelper('CodecEnum'), ns.self),
      ),
    ],
    DOUBLE_NEWLINE,
  )
}

function modelSet(item: string): ModelPart {
  return ns.join(
    [
      selfOpaqueType(exprIdWithGenerics('Set', ns.refType(item))),
      ns.concat(
        ns.part`const ${ns.self} = ${ns.libRuntimeHelper('createSetCodec')}`,
        ns.part`('${ns.self}', ${ns.refVar(item)}) as `,
        exprIdWithGenerics(ns.libTypeHelper('CodecSet'), ns.self),
      ),
    ],
    DOUBLE_NEWLINE,
  )
}

function modelMap(key: string, value: string): ModelPart {
  return ns.join(
    [
      selfOpaqueType(exprIdWithGenerics('Map', ns.refType(key), ns.refType(value))),
      ns.concat(
        ns.part`const ${ns.self} = ${ns.libRuntimeHelper('createMapCodec')}`,
        ns.part`('${ns.self}', ${ns.refVar(key)}, ${ns.refVar(value)}) as `,
        exprIdWithGenerics(ns.libTypeHelper('CodecMap'), ns.self),
      ),
    ],
    DOUBLE_NEWLINE,
  )
}

function modelArray(item: string, len: number): ModelPart {
  return ns.join(
    [
      selfOpaqueType(ns.part`${ns.refType(item)}[]`),
      ns.concat(
        ns.part`const ${ns.self} = ${ns.libRuntimeHelper('createArrayCodec')}`,
        ns.part`('${ns.self}', ${ns.refVar(item)}, ${String(len)}) as `,
        exprIdWithGenerics(ns.libTypeHelper('CodecArray'), ns.self),
      ),
    ],
    DOUBLE_NEWLINE,
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
    DOUBLE_NEWLINE,
  )
}

function modelOption(some: string): ModelPart {
  return ns.join(
    [
      selfOpaqueType(ns.part`{ enum: ${exprIdWithGenerics(ns.libTypeHelper('RustOption'), ns.refType(some))} }`),
      ns.concat(
        ns.part`const ${ns.self} = ${ns.libRuntimeHelper('createOptionCodec')}`,
        ns.part`('${ns.self}', ${ns.refVar(some)}) as `,
        exprIdWithGenerics(ns.libTypeHelper('CodecEnum'), ns.self),
      ),
    ],
    DOUBLE_NEWLINE,
  )
}

function modelResult(ok: string, err: string): ModelPart {
  const genericsOkErr = ns.part`<${ns.refType(ok)}, ${ns.refType(err)}>`

  return ns.join(
    [
      selfOpaqueType(ns.part`{ enum: ${ns.libTypeHelper('RustResult')}${genericsOkErr} }`),
      ns.concat(
        ns.part`const ${ns.self} = ${ns.libRuntimeHelper('createResultCodec')}`,
        ns.part`('${ns.self}', ${ns.refVar(ok)}, ${ns.refVar(err)}) as `,
        exprIdWithGenerics(ns.libTypeHelper('CodecEnum'), ns.self),
      ),
    ],
    DOUBLE_NEWLINE,
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
      typeForUnitAlias: params?.typeForUnitAliasing ?? 'Unit',
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
