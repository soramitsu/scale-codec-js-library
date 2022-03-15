import { Set, Map, List } from 'immutable'

type DepsGraph = Map<string, Set<string>>

/**
 * This function is an implementation of topological sort of a graph that is customized
 * to handle cycles
 */
export function optimizeDepsHierarchy(graph: DepsGraph): {
    /**
     * Topologically sorted graph vertices
     */
    sorted: List<string>
    /**
     * Map with data where cycles are detected
     */
    cycles: DepsGraph
} {
    let used = Set<string>()
    let sorted = List<string>()
    let cycles: DepsGraph = Map()

    const dfs = (v: string, from?: string) => {
        if (from && used.has(v)) {
            cycles = cycles.update(from, (set) => (set ?? Set()).add(v))
            return
        }

        used = used.add(v)

        for (const u of graph.get(v)!) {
            dfs(u, v)
        }

        sorted = sorted.push(v)
    }

    for (const v of List(graph.keys()).sort()) {
        if (!used.has(v)) {
            dfs(v)
        }
    }

    return {
        sorted,
        cycles,
    }
}
