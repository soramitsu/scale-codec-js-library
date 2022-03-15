import { Set as ImSet, List, Seq, Record, RecordOf } from 'immutable'
import { renderImports } from './util'

type TemplateFn<E extends any[], T> = (template: TemplateStringsArray, ...expressions: E) => T

interface TemplateFnData<E extends any[]> {
    template: ReadonlyArray<string>
    expressions: E
}

function assignTyped<T>(something: T, part: Partial<T>): T {
    return Object.assign(something, part)
}

function dynPrefix(ref: string) {
    return `__dyn_${ref}`
}

export interface ModelRenderParams {
    libModule: string
    libTypes: Set<string>
}

export class NamespaceModel {
    public refs: RefScope[]

    /**
     * Render dynCodecs only when it is necessary (i.e. to resolve cyclic deps)
     */
    public render(params: ModelRenderParams): string {
        let dynRefs = ImSet<string>()
        let libRefs = ImSet<string>()
        let libRuntimeHelpers = ImSet<string>()
        let libTypeHelpers = ImSet<string>()

        let refsRendered = List<string>()
        let moduleExports = List<string>()

        for (const scope of this.refs) {
            moduleExports = moduleExports.push(scope.name)

            const expandExpressions = (data: TemplateFnData<Expression[]>): string => {
                const parts: string[] = []

                for (let i = 0; i < data.template.length; i++) {
                    parts.push(data.template[i])

                    if (i < data.template.length - 1) {
                        const expr = data.expressions[i]

                        if (typeof expr === 'string') {
                            parts.push(expr)
                        } else if (expr instanceof ModelPart) {
                            parts.push(expandExpressions(expr))
                        } else if (expr instanceof TypeReference) {
                            const { ref, isType, isPure } = expr

                            if (params.libTypes.has(ref)) {
                                libRefs = libRefs.add(ref)
                                parts.push(ref)
                            } else {
                                if (isType || isPure) {
                                    parts.push(ref)
                                } else {
                                    parts.push(dynPrefix(ref))
                                    dynRefs = dynRefs.add(ref)
                                }
                            }
                        } else if (expr instanceof ImportPart) {
                            const importWhat = expr.whatAsStr(scope.name)
                            const importAs = expr.asAsStr(scope.name)
                            const moduleName = expr.moduleAsStr(params.libModule)

                            parts.push(
                                renderImports(
                                    [importAs ? { source: importWhat, as: importAs } : importWhat],
                                    moduleName,
                                ),
                            )
                        } else if (expr instanceof LibHelper) {
                            const { id, type } = expr

                            if (type === 'runtime') libRuntimeHelpers = libRuntimeHelpers.add(id)
                            else libTypeHelpers = libTypeHelpers.add(id)

                            parts.push(id)
                        } else if (expr === SelfRef) {
                            parts.push(scope.name)
                        } else if (expr === LibName) {
                            parts.push(params.libModule)
                        } else {
                            const invalid: never = expr
                            console.error('Unable to handle:', invalid)
                            throw new Error(`Invalid: ${String(invalid)}`)
                        }
                    }
                }

                return parts.join('')
            }

            const content = expandExpressions(scope)

            refsRendered = refsRendered.push(`// Type: ${scope.name}\n\n${content}`)
        }

        let renderedDyns: string | undefined
        if (dynRefs.size) {
            libRuntimeHelpers = libRuntimeHelpers.add('dynCodec')
            renderedDyns = Seq(dynRefs)
                .map((x) => `const ${dynPrefix(x)} = dynCodec(() => ${x})`)
                .join('\n')
        }

        let finalParts = List<string>()

        const libRuntimeImports = libRefs.merge(libRuntimeHelpers)
        if (libRuntimeImports.size) {
            finalParts = finalParts.push(renderImports(libRuntimeImports, params.libModule))
        }

        if (libTypeHelpers.size) {
            finalParts = finalParts.push(renderImports(libTypeHelpers, params.libModule, true))
        }

        if (renderedDyns) {
            finalParts = finalParts.push('// Dynamic codecs').push(renderedDyns)
        }

        finalParts = finalParts.push(...refsRendered)

        if (moduleExports.size) {
            const items = Seq(moduleExports).sort().join(', ')
            finalParts = finalParts.push('// Exports').push(`export { ${items} }`)
        }

        return finalParts.join('\n\n')
    }
}

export class ModelPart {
    public template: ReadonlyArray<string>
    public expressions: Expression[]
}

export class TypeReference {
    public ref: string
    public isType = false
    public isPure = false
}

export class LibHelper {
    public type: 'runtime' | 'type'
    public id: string
}

export class RefScope {
    public name: string
    public template: ReadonlyArray<string>
    public expressions: Expression[]
}

export class ImportPart {
    public importWhat: string | typeof SelfRef
    public importAs?: string | typeof SelfRef
    public moduleName: string | typeof LibName

    public whatAsStr(self: string): string {
        return this.importWhat === SelfRef ? self : this.importWhat
    }

    public asAsStr(self: string): string | undefined {
        return this.importAs === SelfRef ? self : this.importAs
    }

    public moduleAsStr(lib: string): string {
        return this.moduleName === LibName ? lib : this.moduleName
    }
}

export const SelfRef = Symbol('Self')

export const LibName = Symbol('LibName')

export type Expression = string | ModelPart | TypeReference | LibHelper | typeof SelfRef | typeof LibName

export interface NamespaceFn<RuntimeHelpers extends string, TypeHelpers extends string> {
    (params: { refs: RefScope[] }): NamespaceModel
    refType: (ref: string) => TypeReference
    refVar: (ref: string, pure?: boolean) => TypeReference
    libRuntimeHelper: (id: RuntimeHelpers) => LibHelper
    libTypeHelper: (id: TypeHelpers) => LibHelper
    refScope: (name: string) => TemplateFn<any[], RefScope>
    self: typeof SelfRef
    lib: typeof LibName
    part: TemplateFn<any[], ModelPart>
    concat: (...parts: Expression[]) => ModelPart
    join: (items: Iterable<Expression>, joiner: Expression) => ModelPart
    import: (params: Pick<ImportPart, 'importWhat' | 'importAs' | 'moduleName'>) => ImportPart
}

interface ModelPartRecordProps {
    template: Seq.Indexed<string>
    expressions: Seq.Indexed<Expression>
}

const makeModelPartRecord = Record<ModelPartRecordProps>({
    template: Seq([]),
    expressions: Seq([]),
})

function modelPartRecordToModelPart(rec: RecordOf<ModelPartRecordProps>): ModelPart {
    return assignTyped(new ModelPart(), {
        template: rec.template.toArray(),
        expressions: rec.expressions.toArray(),
    })
}

function concatExpressions(parts: Iterable<Expression>): ModelPart {
    const partRecord = Seq(parts)
        // to handle empty parts array
        .concat('')
        .map<ModelPart>((x) => {
            if (typeof x === 'string') return assignTyped(new ModelPart(), { template: [x], expressions: [] })
            if (!(x instanceof ModelPart)) return assignTyped(new ModelPart(), { template: ['', ''], expressions: [x] })
            return x
        })
        .reduce<RecordOf<ModelPartRecordProps>>((reduction, value) => {
            return reduction
                .update('template', (template) =>
                    template
                        .slice(0, -1)
                        .concat(template.takeLast(1).concat(value.template.at(0)!).join(''))
                        .concat(value.template.slice(1)),
                )
                .update('expressions', (expressions) => expressions.concat(value.expressions))
        }, makeModelPartRecord())

    return modelPartRecordToModelPart(partRecord)
}

function joinExpressions(items: Iterable<Expression>, joiner: Expression): ModelPart {
    return concatExpressions(Seq(items).interpose(joiner))
}

export function createNs<R extends string, T extends string>(): NamespaceFn<R, T> {
    const ns: NamespaceFn<R, T> = ({ refs }) => assignTyped(new NamespaceModel(), { refs })

    ns.refType = (ref) => assignTyped(new TypeReference(), { ref, isType: true })
    ns.refVar = (ref, pure) => assignTyped(new TypeReference(), { ref, isPure: pure ?? false })
    ns.libRuntimeHelper = (id) => assignTyped(new LibHelper(), { id, type: 'runtime' })
    ns.libTypeHelper = (id) => assignTyped(new LibHelper(), { id, type: 'type' })
    ns.refScope =
        (name) =>
        (template, ...expressions) =>
            assignTyped(new RefScope(), { name, template, expressions })

    ns.self = SelfRef
    ns.lib = LibName

    ns.part = (template, ...expressions) => assignTyped(new ModelPart(), { template, expressions })
    ns.concat = (...parts) => concatExpressions(parts)
    ns.join = (items, joiner) => joinExpressions(items, joiner)

    ns.import = (params) => assignTyped(new ImportPart(), params)

    return ns
}
