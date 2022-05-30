import { expect, test } from 'vitest'
import { renderImports } from '../util'

test('Sorts imports', () => {
  expect(renderImports(['B', 'C', 'A', 'Bb', 'bB'], 'mod')).toEqual("import { A, B, Bb, C, bB } from 'mod'")
})

test('Throws if imports array is empty', () => {
  expect(() => renderImports([], 'xxx')).toThrow()
})
