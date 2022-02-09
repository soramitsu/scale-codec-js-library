import { NamespaceDefinition, RenderNamespaceDefinitionParams, TypeDef, DefEnumVariant, DefStructField } from '../types'
import { Set as SetImmutable } from 'immutable'
import { renderImports, createStateScope } from './util'
import { byValue, byString } from 'sort-es'
import { DefaultAvailableBuilders } from '../const'

function namespaceDefinitionToList(val: NamespaceDefinition): { tyName: string; def: TypeDef }[] {
    const items = Object.entries(val)
    items.sort(byValue((x) => x[0], byString()))
    return items.map(([tyName, def]) => ({ tyName, def }))
}

type CodecTypes = `${'Map' | 'Set' | 'Vec' | 'Struct' | 'Enum' | 'Option' | 'Result' | 'Tuple'}Codec`

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
    runtimeLib: string
    runtimeTypes: Set<String>
    rollupSingleTuples: boolean
}

const { within: withinRenderParams, use: useRenderParams } = createStateScope<RenderParams>()

// =========

interface ImportsCollector {
    collectRef: (ref: string) => void
    collectImport: (name: string) => void
    getRuntimeLibImports: () => Set<string>
}

function createImportsCollector(): ImportsCollector {
    const { runtimeTypes } = useRenderParams()

    let imports = SetImmutable<string>()

    return {
        getRuntimeLibImports: () => new Set(imports),
        collectRef: (ref) => {
            if (runtimeTypes.has(ref)) {
                imports = imports.add(ref)
            }
        },
        collectImport: (name) => {
            imports = imports.add(name)
        },
    }
}

const { within: withinCollector, use: useCollector } = createStateScope<ImportsCollector>()

// =========

const { within: withinCurrentTyName, use: useCurrentTyName } = createStateScope<string>()

// =========

function touchRef(ref: string): string {
    useCollector().collectRef(ref)
    return ref
}

function touchImport(name: string): string {
    useCollector().collectImport(name)
    return name
}

function touchCodecTy(ty: CodecTypes): string {
    useCollector().collectImport(ty)
    return ty
}

function touchRefAsDyn(ref: string): string {
    return `${touchImport('dynCodec')}(() => ${touchRef(ref)})`
}

function touchRefAsType(ref: string): string {
    return `typeof ${touchRef(ref)}`
}

function linesJoin(lines: string[], joiner = '\n\n'): string {
    return lines.join(joiner)
}

function renderCreator(props: {
    ty: { codec: CodecTypes; args: string } | null
    createFn: KnownCreators
    createFnTy?: string
    createArgs: string
}): string {
    const ty = useCurrentTyName()

    return (
        `export const ${ty}` +
        (props.ty ? `: ${touchCodecTy(props.ty.codec)}<${props.ty.args}>` : '') +
        ` = ${touchImport(props.createFn)}` +
        (props.createFnTy ? `<${props.createFnTy}>` : '') +
        `('${ty}', ${props.createArgs})`
    )
}

// =========

function renderAlias(to: string): string {
    // special builder
    return (
        `export const ${useCurrentTyName()}: ${touchImport('DynCodec')}<${touchRefAsType(to)}>` +
        ` = ${touchRefAsDyn(to)}`
    )
}

function renderVoidAlias(): string {
    const { runtimeLib } = useRenderParams()

    return renderImport({ nameInModule: 'Void', module: runtimeLib })
}

function renderVec(item: string): string {
    return renderCreator({
        ty: {
            codec: 'VecCodec',
            args: touchRefAsType(item),
        },
        createFn: 'createVecCodec',
        createArgs: touchRefAsDyn(item),
    })
}

function renderStruct(fields: DefStructField[]): string {
    if (!fields.length) {
        return renderVoidAlias()
    }

    const valueTypeFields: string[] = fields.map((x) => `${x.name}: ${touchRefAsType(x.ref)}`)

    const schemaItems = fields.map((x) => `['${x.name}', ${touchRefAsDyn(x.ref)}]`)
    const schema = `[${schemaItems.join(', ')}]`

    return renderCreator({
        ty: {
            codec: 'StructCodec',
            args: `{\n    ${valueTypeFields.join(',\n    ')}\n}`,
        },
        createFn: 'createStructCodec',
        createArgs: `${schema}`,
    })
}

function renderTuple(refs: string[]): string {
    if (!refs.length) {
        return renderVoidAlias()
    }

    const { rollupSingleTuples } = useRenderParams()
    if (rollupSingleTuples && refs.length === 1) return renderAlias(refs[0])

    return renderCreator({
        ty: {
            codec: 'TupleCodec',
            args: `[${refs.map(touchRefAsType).join(', ')}]`,
        },
        createFn: 'createTupleCodec',
        createArgs: `[${refs.map(touchRefAsDyn).join(', ')}]`,
    })
}

function renderEnum(variants: DefEnumVariant[]): string {
    const schemaItems: string[] = variants.map((x) => {
        const items = [x.discriminant, `'${x.name}'`]
        x.ref && items.push(touchRefAsDyn(x.ref))
        return `[${items.join(', ')}]`
    })

    const enumDefinition =
        `\n    ` +
        variants
            .map((x) => {
                return x.ref ? `| ['${x.name}', ${touchRefAsType(x.ref)}]` : `| '${x.name}'`
            })
            .join('\n    ') +
        `\n`

    return renderCreator({
        ty: {
            codec: 'EnumCodec',
            args: enumDefinition,
        },
        createFn: 'createEnumCodec',
        createFnTy: 'any',
        createArgs: `[${schemaItems.join(', ')}]`,
    })
}

function renderSet(item: string): string {
    return renderCreator({
        ty: {
            codec: 'SetCodec',
            args: touchRefAsType(item),
        },
        createFn: 'createSetCodec',
        createArgs: touchRefAsDyn(item),
    })
}

function renderMap(key: string, value: string): string {
    return renderCreator({
        ty: {
            codec: 'MapCodec',
            args: [key, value].map(touchRefAsType).join(', '),
        },
        createFn: 'createMapCodec',
        createArgs: [key, value].map(touchRefAsDyn).join(', '),
    })
}

function renderArray(item: string, len: number): string {
    return renderCreator({
        ty: {
            codec: 'VecCodec',
            args: touchRefAsType(item),
        },
        createFn: `createArrayCodec`,
        createArgs: `${touchRefAsDyn(item)}, ${len}`,
    })
}

function renderBytesArray(len: number): string {
    return renderCreator({
        ty: null,
        createFn: 'createArrayU8Codec',
        createArgs: `${len}`,
    })
}

function renderOption(some: string): string {
    return renderCreator({
        ty: {
            codec: 'OptionCodec',
            args: touchRefAsType(some),
        },
        createFn: 'createOptionCodec',
        createArgs: touchRefAsDyn(some),
    })
}

function renderResult(ok: string, err: string): string {
    return renderCreator({
        ty: {
            codec: 'ResultCodec',
            args: [ok, err].map(touchRefAsType).join(', '),
        },
        createFn: 'createResultCodec',
        createArgs: [ok, err].map(touchRefAsDyn).join(', '),
    })
}

function renderImport({ nameInModule, module: moduleName }: { nameInModule?: string | null; module: string }): string {
    const ty = useCurrentTyName()

    return linesJoin(
        [renderImports([nameInModule ? { source: nameInModule, as: ty } : ty], moduleName), `export { ${ty} }`],
        '\n',
    )
}

function renderParticularDef(tyName: string, def: TypeDef): string {
    const particularRendered: string = withinCurrentTyName(tyName, () => {
        switch (def.t) {
            case 'alias':
                return renderAlias(def.ref)
            case 'vec':
                return renderVec(def.item)
            case 'struct':
                return renderStruct(def.fields)
            case 'tuple':
                return renderTuple(def.items)
            case 'enum':
                return renderEnum(def.variants)
            case 'set':
                return renderSet(def.entry)
            case 'map':
                return renderMap(def.key, def.value)
            case 'array':
                return renderArray(def.item, def.len)
            case 'bytes-array':
                return renderBytesArray(def.len)
            case 'option':
                return renderOption(def.some)
            case 'result':
                return renderResult(def.ok, def.err)
            case 'import':
                return renderImport(def)
            default: {
                const uncovered: never = def
                throw new Error(`Undefined type definition: ${uncovered}`)
            }
        }
    })

    return particularRendered
}

function renderPreamble(): string {
    const { runtimeLib } = useRenderParams()
    const { getRuntimeLibImports: getCoreImports } = useCollector()

    const lines = []

    const imports = getCoreImports()
    if (imports.size) {
        lines.push(renderImports(imports, runtimeLib))
    }

    return linesJoin(lines)
}

/**
 * Renders provided definition into a valid TypeScript code.
 */
export function renderNamespaceDefinition(
    definition: NamespaceDefinition,
    params?: RenderNamespaceDefinitionParams,
): string {
    return withinRenderParams(
        {
            runtimeLib: params?.runtimeLib ?? '@scale-codec/definition-runtime',
            runtimeTypes: params?.runtimeTypes ?? DefaultAvailableBuilders,
            rollupSingleTuples: params?.rollupSingleTuplesIntoAliases ?? false,
        },
        () =>
            withinCollector(createImportsCollector(), () => {
                const renderedTypes = namespaceDefinitionToList(definition)
                    .map(({ tyName, def }) => renderParticularDef(tyName, def))
                    .join('\n\n')

                const preamble = renderPreamble()

                return [preamble, renderedTypes].join('\n\n').trim() + '\n'
            }),
    )
}
