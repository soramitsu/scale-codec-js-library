import { List, Map, Record, RecordOf, Seq, Set } from 'immutable'
import { optimizeDepsHierarchy } from './deps-analysis'
import { INDENTATION, renderImports } from './util'
import { P, match } from 'ts-pattern'

type TemplateFn<E extends any[], T> = (template: TemplateStringsArray, ...expressions: E) => T

interface TemplateFnData<E extends any[]> {
  template: ReadonlyArray<string>
  expressions: E
}

function assignTyped<T extends {}>(something: T, part: Partial<T>): T {
  return Object.assign<T, Partial<T>>(something, part)
}

function dynPrefix(ref: string) {
  return `__dyn_${ref}`
}

function findAllActualRefs(expressions: Expression[]): Set<string> {
  return expressions.reduce<Set<string>>(
    (reduction, expr) =>
      expr instanceof TypeReference && !expr.isPure
        ? reduction.add(expr.ref)
        : expr instanceof ModelPart
        ? reduction.merge(findAllActualRefs(expr.expressions))
        : reduction,
    Set(),
  )
}

function extractAndValidateDepsGraph(scopes: RefScope[], libRefs: Set<string>): Map<string, Set<string>> {
  const rawGraph = scopes.reduce<Map<string, Set<string>>>(
    (reduction, scope) => reduction.set(scope.name, findAllActualRefs(scope.expressions).subtract(libRefs)),
    Map(),
  )

  const errors: Set<string> = rawGraph.reduce(
    (reduction, deps, ref) =>
      deps.reduce(
        (reduction, depRef) =>
          rawGraph.has(depRef) ? reduction : reduction.add(`unresolved reference: ${ref} -> ${depRef}`),
        reduction,
      ),

    Set(),
  )

  if (errors.size) {
    const composed = errors.join('; ')
    throw new Error(`Refs validation failed: ${composed}`)
  }

  return rawGraph
}

export interface ModelRenderParams {
  libModule: string
  libTypes: Set<string>
  optimizeDyns?: boolean
}

export class NamespaceModel {
  public refs: RefScope[]

  /**
   * Render dynCodecs only when it is necessary (i.e. to resolve cyclic deps)
   */
  public render(params: ModelRenderParams): string {
    // Traversing refs first to determine their deps graph
    const depsGraph = extractAndValidateDepsGraph(this.refs, params.libTypes)

    const optimizeData: ReturnType<typeof optimizeDepsHierarchy> | null = params.optimizeDyns
      ? optimizeDepsHierarchy(depsGraph)
      : null

    /**
     * Actual dynamic refs that should be placed before compiled types
     */
    let dynRefs = Set<string>()

    // what to import from the lib
    let libRefs = Set<string>()
    let libRuntimeHelpers = Set<string>()
    let libTypeHelpers = Set<string>()

    let renderedRefsCode = Map<string, string>()

    /**
     * Exports for the compiled module. This will be put in the very end of compile code.
     */
    let moduleExports = List<string>()

    let uniqueIdsHeap = Map<UniqueIdPart, string>()
    const resolveUniqueId = (scope: RefScope, part: UniqueIdPart): string => {
      if (uniqueIdsHeap.has(part)) return uniqueIdsHeap.get(part)!
      const id = `__uid${uniqueIdsHeap.size}__${scope.name}__${part.label}`
      uniqueIdsHeap = uniqueIdsHeap.set(part, id)
      return id
    }

    for (const scope of this.refs) {
      const circuits: undefined | Set<string> = optimizeData?.circuitsResolutions?.get(scope.name)

      moduleExports = moduleExports.push(scope.name)

      const expandExpressions = (data: TemplateFnData<Expression[]>): string => {
        const parts: string[] = []

        for (let i = 0; i < data.template.length; i++) {
          parts.push(data.template[i])

          if (i < data.template.length - 1) {
            const expr = data.expressions[i]

            match(expr)
              .with(P.string, (x) => parts.push(x))
              .with(P.instanceOf(ModelPart), (x) => parts.push(expandExpressions(x)))
              .with(P.instanceOf(TypeReference), ({ ref, isType, isPure }) => {
                if (params.libTypes.has(ref)) {
                  libRefs = libRefs.add(ref)
                  parts.push(ref)
                } else {
                  if (isType || isPure) {
                    parts.push(ref)
                  } else {
                    // here we should determine whether we allocate "dyn" for it or not

                    // eslint-disable-next-line max-depth
                    if (optimizeData && !circuits?.has(ref)) {
                      parts.push(ref)
                    } else {
                      parts.push(dynPrefix(ref))
                      dynRefs = dynRefs.add(ref)
                    }
                  }
                }
              })
              .with(P.instanceOf(ImportPart), (expr) => {
                const importWhat = expr.whatAsStr(scope.name)
                const importAs = expr.asAsStr(scope.name)
                const moduleName = expr.moduleAsStr(params.libModule)

                parts.push(renderImports([importAs ? { source: importWhat, as: importAs } : importWhat], moduleName))
              })
              .with(P.instanceOf(UniqueIdPart), (expr) => {
                parts.push(resolveUniqueId(scope, expr))
              })
              .with(P.instanceOf(LibHelper), ({ id, type }) => {
                if (type === 'runtime') libRuntimeHelpers = libRuntimeHelpers.add(id)
                else libTypeHelpers = libTypeHelpers.add(id)

                parts.push(id)
              })
              .with(SelfRef, () => {
                parts.push(scope.name)
              })
              .with(LibName, () => {
                parts.push(params.libModule)
              })
              .exhaustive()
          }
        }

        return parts.join('')
      }

      const content = expandExpressions(scope)

      renderedRefsCode = renderedRefsCode.set(scope.name, `// Type: ${scope.name}\n\n${content}`)
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
      finalParts = finalParts.push(renderImports(libTypeHelpers, params.libModule, { type: true }))
    }

    if (renderedDyns) {
      finalParts = finalParts.push('// Dynamic codecs').push(renderedDyns)
    }

    // put rendered refs
    if (optimizeData) {
      finalParts = finalParts.concat(optimizeData.sorted.map((ref) => renderedRefsCode.get(ref)!))
    } else {
      finalParts = finalParts.concat(
        List(this.refs)
          .sortBy((x) => x.name)
          .map((x) => renderedRefsCode.get(x.name)!),
      )
    }

    if (moduleExports.size) {
      const items = Seq(moduleExports)
        .sort()
        .join(',\n' + INDENTATION)
      finalParts = finalParts.push('// Exports').push(`export {\n${INDENTATION}${items}\n}`)
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
  /**
   * Pure means to not apply "dyn" to this reference
   */
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

export class UniqueIdPart {
  public label: string
}

export const SelfRef = Symbol('Self')

export const LibName = Symbol('LibName')

export type Expression =
  | string
  | ModelPart
  | TypeReference
  | LibHelper
  | typeof SelfRef
  | typeof LibName
  | ImportPart
  | UniqueIdPart

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
  uniqueId: (label: string) => UniqueIdPart
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

  ns.uniqueId = (label: string) => assignTyped(new UniqueIdPart(), { label })

  return ns
}
