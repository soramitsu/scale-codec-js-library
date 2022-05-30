import { beforeEach, describe, expect, test } from 'vitest'
import {
  AdjacencyMap,
  findCircuitsResolutions,
  findStronglyConnectedComponents,
  optimizeDepsHierarchy,
} from '../deps-analysis'
import { List, Map, Seq, Set } from 'immutable'

// Works well with Vitest
// eslint-disable-next-line @typescript-eslint/no-require-imports
const immutableMatchers = require('jest-immutable-matchers')

beforeEach(() => {
  expect.extend(immutableMatchers)
})

function createAdjacencyMap(str: string): AdjacencyMap {
  return Seq(str.split('\n'))
    .map((x) => x.trim().match(/^(\S+)\s*->\s*(.+)?\s*$/))
    .filter((x): x is RegExpMatchArray => !!x)
    .map<[string, string | undefined]>((match) => [match[1], match[2]])
    .map<[string, Set<string>]>(([v, deps]) => [v, Set((deps ?? '').split(/\s+/)).filter((x) => !!x)])
    .reduce((map, [v, deps]) => map.set(v, deps), Map())
}

describe('findCircuitsResolutions()', () => {
  test.each([
    [
      List(['a', 'b', 'c']),
      createAdjacencyMap(`
                a -> 
                b ->
                c -> a
            `),
      Map(),
    ],
    [
      List(['a', 'b', 'c']),
      createAdjacencyMap(`
                a -> c b
                b ->
                c ->
            `),
      createAdjacencyMap(`
                a -> c b
            `),
    ],
    [
      List(['a', 'b', 'c']),
      createAdjacencyMap(`
                a ->
                b -> a c
                c -> b a
            `),
      createAdjacencyMap(`
                b -> c
            `),
    ],
  ] as [List<string>, AdjacencyMap, AdjacencyMap][])('Case %#', (sortedComponent, graph, output) => {
    expect(findCircuitsResolutions(sortedComponent, graph)).toEqualImmutable(output)
  })
})

describe('Finding Strongly Connected Components in a graph', () => {
  test.each([
    {
      input: createAdjacencyMap(`
                a -> c e f
                b -> h
                c -> d
                d -> a
                e -> a
                f -> e
                g ->
                h ->
            `),
      output: Set([Set('acdef'), Set('b'), Set('h'), Set('g')]),
    },
  ])('Case 0', ({ input, output }) => {
    expect(findStronglyConnectedComponents(input)).toEqualImmutable(output)
  })
})

describe('optimizeDepsHierarchy()', () => {
  test.each([
    [
      createAdjacencyMap(`
                Z ->
                A -> B C
                C ->
                B ->
                L -> M
                M -> N
                N -> L
            `),
      List(`BCANMLZ`),
      createAdjacencyMap(`
                N -> L
            `),
    ],
    [
      createAdjacencyMap(`
                a -> b
                b -> a
            `),
      List('ba'),
      createAdjacencyMap(`b -> a`),
    ],
    [
      createAdjacencyMap(`
                a -> b d
                b -> c
                c -> a
                d -> a
            `),
      List('cbad'),
      createAdjacencyMap(`
                c -> a
                a -> d
            `),
    ],
    [
      createAdjacencyMap(`
                a -> b d e
                b -> c
                c -> a
                d -> a
                e -> d
            `),
      List('cbead'),
      createAdjacencyMap(`
                c -> a
                e -> d
                a -> d
            `),
    ],
  ])('Case %#', (graph, sorted, circuits) => {
    const result = optimizeDepsHierarchy(graph)

    expect(result.sorted).toEqualImmutable(sorted)
    expect(result.circuitsResolutions).toEqualImmutable(circuits)
  })
})
