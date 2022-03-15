import { optimizeDepsHierarchy } from '../deps-analysis'
import { Map, Set, List } from 'immutable'

// eslint-disable-next-line @typescript-eslint/no-require-imports
const immutableMatchers = require('jest-immutable-matchers')

beforeEach(() => {
    expect.extend(immutableMatchers)
})

test('Case 0', () => {
    const { sorted, cycles } = optimizeDepsHierarchy(
        Map([
            ['Z', Set()],
            ['A', Set(['B', 'C'])],
            ['C', Set()],
            ['B', Set()],
            ['L', Set(['M'])],
            ['M', Set(['N'])],
            ['N', Set(['L'])],
        ]),
    )

    expect(sorted).toEqualImmutable(List('B C A N M L Z'.split(' ')))
    expect(cycles).toEqualImmutable(Map<string, Set<string>>([['N', Set(['L'])]]))
})

test('Case 1 (two-way cycle)', () => {
    const { sorted, cycles } = optimizeDepsHierarchy(
        Map([
            ['A', Set(['B'])],
            ['B', Set(['A'])],
        ]),
    )

    expect(sorted).toEqualImmutable(List('B A'.split(' ')))
    expect(cycles).toEqualImmutable(Map<string, Set<string>>([['B', Set(['A'])]]))
})

test('Case 2 (multiple cycles)', () => {
    const { sorted, cycles } = optimizeDepsHierarchy(
        Map([
            ['A', Set(['B1', 'C1'])],

            // loop to A
            ['B1', Set(['B2'])],
            ['B2', Set(['A'])],

            // loop to A too
            ['C1', Set(['A'])],
        ]),
    )

    expect(sorted).toEqualImmutable(List('B2 B1 C1 A'.split(' ')))
    expect(cycles).toEqualImmutable(
        Map<string, Set<string>>([
            ['B2', Set(['A'])],
            ['C1', Set(['A'])],
        ]),
    )
})

test('Case 3 (composed cycles)', () => {
    const { sorted, cycles } = optimizeDepsHierarchy(
        Map([
            ['A', Set(['B1', 'C'])],
            ['B1', Set(['B2'])],
            ['B2', Set(['A'])],
            ['C', Set(['A'])],
            ['D', Set(['C'])],
        ]),
    )

    expect(sorted).toEqualImmutable(List('B2 B1 C A D'.split(' ')))
    expect(cycles).toEqualImmutable(
        Map<string, Set<string>>([
            ['B2', Set(['A'])],
            ['C', Set(['B1'])],
        ]),
    )
})
