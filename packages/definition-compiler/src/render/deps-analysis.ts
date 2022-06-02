import { Set, Map, List } from 'immutable'
import Graph from 'tarjan-graph'

export type AdjacencyMap = Map<string, Set<string>>

/**
 * This function is an implementation of topological sort of a graph that is customized
 * to handle cycles
 */
export function optimizeDepsHierarchy(graph: AdjacencyMap): {
  /**
   * Topologically sorted graph vertices
   */
  sorted: List<string>
  /**
   * Map with data where cycles are detected
   */
  circuitsResolutions: AdjacencyMap
} {
  /**
   * 1. Find components
   * 2. Construct Map<string, Set<string>> with components (key - each vert, value - its component)
   * 3. Sort each component topologically
   * 4. Find circuit resolutions in each component (using sorted components from step 3)
   * 5. Sort initial graph alphabetically -> topologically
   * 6. Return result from 4 and 5
   */

  // 1.
  const components = findStronglyConnectedComponents(graph)

  // 2.
  const componentsMap = buildComponentsMap(components)

  // 3.
  const componentsSorted: Map<Set<string>, List<string>> = components.reduce(
    (map, x) => map.set(x, topologicalSortWithIgnoranceOfCircuits(x, graph)),
    Map(),
  )

  // 4.
  const circuitsResolutions: Map<string, Set<string>> = componentsSorted
    .valueSeq()
    .reduce((map, sortedComponent) => map.merge(findCircuitsResolutions(sortedComponent, graph)), Map())

  // 5.
  const verticesSorted = sortCyclicGraphTopologicallyUsingComponents(graph, componentsMap, componentsSorted)

  return {
    sorted: verticesSorted,
    circuitsResolutions,
  }
}

export function sortCyclicGraphTopologicallyUsingComponents(
  graph: AdjacencyMap,
  componentsMap: AdjacencyMap,
  componentsSorted: Map<Set<String>, List<string>>,
): List<string> {
  const used = Set<string>().asMutable()
  const stack = List<string>().asMutable()

  function dfs(v: string): void {
    const component = componentsMap.get(v)!
    used.merge(component) // itself with all siblings

    for (const u of graph.get(v)!) {
      if (!used.has(u)) dfs(u)
    }

    const sortedComponent = componentsSorted.get(component)!
    stack.concat(sortedComponent)
  }

  for (const v of graph.keySeq().sort()) {
    if (!used.has(v)) dfs(v)
  }

  return stack.asImmutable()
}

export function findCircuitsResolutions(sortedComponent: List<string>, graph: AdjacencyMap): Map<string, Set<string>> {
  const indices = sortedComponent.reduce<Map<string, number>>((map, v, i) => map.set(v, i), Map())

  return sortedComponent.reduce((map, v, i) => {
    return graph.get(v)!.reduce((map, u) => {
      const uIdx = indices.get(u)
      if (typeof uIdx !== 'number' || uIdx < i) return map
      return map.update(v, (set) => (set ?? Set()).add(u))
    }, map)
  }, Map())
}

export function graphToAdjacencyList(graph: AdjacencyMap): {
  adjacencyList: number[][]
  adjacencyListKeys: string[]
} {
  const keys: string[] = Array.from(graph.keySeq().sort().reverse())
  const keysIdx: Map<string, number> = keys.reduce((map, key, idx) => map.set(key, idx), Map<string, number>())
  const list: number[][] = new Array(keys.length)

  for (let i = 0; i < keys.length; i++) {
    list[i] = graph
      .get(keys[i])!
      .map((u) => keysIdx.get(u)!)
      .toArray()
  }

  console.log({ list, keys })

  return { adjacencyList: list, adjacencyListKeys: keys }
}

/**
 * Uses Tarjan's algorithm
 */
export function findStronglyConnectedComponents(graph: AdjacencyMap): Set<Set<string>> {
  const graphTarjan = new Graph()

  for (const [v, deps] of graph.entries()) {
    graphTarjan.add(v, [...deps])
  }

  const components = graphTarjan.getStronglyConnectedComponents()

  return components.reduce((set, arr) => set.add(Set(arr.map((x) => x.name))), Set<Set<string>>())
}

export function topologicalSortWithIgnoranceOfCircuits(component: Set<string>, graph: AdjacencyMap): List<string> {
  const used = Set<string>().asMutable()
  const stack = List<string>().asMutable()

  function dfs(v: string): void {
    used.add(v)
    for (const u of graph.get(v)!) {
      if (component.has(u) && !used.has(u)) dfs(u)
    }
    stack.push(v)
  }

  for (const v of component) {
    if (!used.has(v)) dfs(v)
  }

  return stack.asImmutable()
}

export function buildComponentsMap(components: Set<Set<string>>): Map<string, Set<string>> {
  return components.reduce((map, component) => component.reduce((map, v) => map.set(v, component), map), Map())
}
