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

enum BaseType {
    Fragment = 'Fragment',
    Builder = 'FragmentBuilder',
    FragmentFromBuilder = 'FragmentFromBuilder',
    InnerValue = 'FragmentOrBuilderValue',
    UnwrappedValue = 'FragmentOrBuilderUnwrapped',
    Enum = 'Enum',
    Option = 'Option',
    Result = 'Result',
    ScaleSetBuilder = 'ScaleSetBuilder',
    ScaleMapBuilder = 'ScaleMapBuilder',
    ScaleArrayBuilder = 'ScaleArrayBuilder',
    ScaleStructBuilder = 'ScaleStructBuilder',
    ScaleEnumBuilder = 'ScaleEnumBuilder',
    ScaleTupleBuilder = 'ScaleTupleBuilder',
    DynBuilder = 'DynBuilder',
}

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

function instanceViaBuilder(ref: string): string {
    return `${touchBase(BaseType.FragmentFromBuilder)}<typeof ${touchRef(ref)}>`
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

function renderBuilder(props: { builderTy: string | null; createFn: string; createArgs: string }): string {
    const ty = useCurrentTyName()
    const tyDeclaration = props.builderTy ? `: ${props.builderTy}` : ''

    return `export const ${ty}${tyDeclaration} = ${touchImport(props.createFn)}('${ty}', ${props.createArgs})`
}

function touchRef(ref: string): string {
    useCollector().collectRef(ref)
    return ref
}

function touchImport(name: string): string {
    useCollector().collectImport(name)
    return name
}

function touchBase(ty: BaseType): string {
    useCollector().collectImport(ty)
    return ty
}

/**
 * ref -> `dynBuilder() => ${ref})` (with touches)
 */
function refDynBuilder(ref: string): string {
    return `${touchImport('dynBuilder')}(() => ${touchRef(ref)})`
}

function linesJoin(lines: string[], joiner = '\n\n'): string {
    return lines.join(joiner)
}

// =========

function renderAlias(to: string): string {
    // special builder
    return `export const ${useCurrentTyName()}: ${touchBase(BaseType.DynBuilder)}<typeof ${touchRef(
        to,
    )}> = ${refDynBuilder(to)}`
}

function renderVoidAlias(): string {
    const { runtimeLib } = useRenderParams()

    return renderImport({ nameInModule: 'Void', module: runtimeLib })
}

function renderVec(item: string): string {
    return renderBuilder({
        builderTy: `${touchBase(BaseType.ScaleArrayBuilder)}<${instanceViaBuilder(item)}[]>`,
        createFn: 'createVecBuilder',
        createArgs: refDynBuilder(item),
    })
}

function renderStruct(fields: DefStructField[]): string {
    if (!fields.length) {
        return renderVoidAlias()
    }

    const valueTypeFields: string[] = fields.map((x) => `${x.name}: ${instanceViaBuilder(x.ref)}`)

    const schemaItems = fields.map((x) => `['${x.name}', ${refDynBuilder(x.ref)}]`)
    const schema = `[${schemaItems.join(', ')}]`

    return renderBuilder({
        builderTy: `${touchBase(BaseType.ScaleStructBuilder)}<{\n    ${valueTypeFields.join(',\n    ')}\n}>`,
        createFn: 'createStructBuilder',
        createArgs: `${schema}`,
    })
}

function renderTuple(refs: string[]): string {
    if (!refs.length) {
        return renderVoidAlias()
    }

    const { rollupSingleTuples } = useRenderParams()
    if (rollupSingleTuples && refs.length === 1) return renderAlias(refs[0])

    const valueEntries: string[] = refs.map(instanceViaBuilder)
    const codecs: string[] = refs.map(refDynBuilder)

    return renderBuilder({
        builderTy: `${touchBase(BaseType.ScaleTupleBuilder)}<[\n    ${valueEntries.join(',\n    ')}\n]>`,
        createFn: 'createTupleBuilder',
        createArgs: `[${codecs.join(', ')}]`,
    })
}

function renderEnum(variants: DefEnumVariant[]): string {
    const schemaLines: string[] = variants.map((x) => {
        const items = [x.discriminant, `'${x.name}'`]
        x.ref && items.push(refDynBuilder(x.ref))
        return `[${items.join(', ')}]`
    })

    const builderTyVariants = variants
        .map((x) => {
            const variantTy = x.ref ? `['${x.name}', ${instanceViaBuilder(x.ref)}]` : `'${x.name}'`
            return `    | ${variantTy}`
        })
        .join('\n')
    const builderTy = `${touchBase(BaseType.ScaleEnumBuilder)}<${touchBase(BaseType.Enum)}<\n${builderTyVariants}\n>>`

    return renderBuilder({
        builderTy,
        createFn: 'createEnumBuilder',
        createArgs: `[${schemaLines.join(', ')}]`,
    })
}

function renderSet(item: string): string {
    return renderBuilder({
        builderTy: `${touchBase(BaseType.ScaleSetBuilder)}<Set<${instanceViaBuilder(item)}>>`,
        createFn: 'createSetBuilder',
        createArgs: refDynBuilder(item),
    })
}

function renderMap(key: string, value: string): string {
    return renderBuilder({
        builderTy: `${touchBase(BaseType.ScaleMapBuilder)}<Map<${[key, value].map(instanceViaBuilder).join(', ')}>>`,
        createFn: 'createMapBuilder',
        createArgs: [key, value].map(refDynBuilder).join(', '),
    })
}

function renderArray(item: string, len: number): string {
    return renderBuilder({
        builderTy: `${touchBase(BaseType.ScaleArrayBuilder)}<${instanceViaBuilder(item)}[]>`,
        createFn: `createArrayBuilder`,
        createArgs: `${refDynBuilder(item)}, ${len}`,
    })
}

function renderBytesArray(len: number): string {
    return renderBuilder({
        builderTy: null,
        createFn: 'createBytesArrayBuilder',
        createArgs: `${len}`,
    })
}

function renderOption(some: string): string {
    return renderBuilder({
        builderTy: `${touchBase(BaseType.ScaleEnumBuilder)}<${touchBase(BaseType.Option)}<${instanceViaBuilder(
            some,
        )}>>`,
        createFn: 'createOptionBuilder',
        createArgs: refDynBuilder(some),
    })
}

function renderResult(ok: string, err: string): string {
    return renderBuilder({
        builderTy: `${touchBase(BaseType.ScaleEnumBuilder)}<${touchBase(BaseType.Result)}<${[ok, err]
            .map(instanceViaBuilder)
            .join(', ')}>>`,
        createFn: 'createResultBuilder',
        createArgs: [ok, err].map(refDynBuilder).join(', '),
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
