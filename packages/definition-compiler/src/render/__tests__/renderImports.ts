import { describe, expect, test } from 'vitest'
import { renderImports } from '../util'

describe.concurrent('Render imports', () => {
  test('Sorts imports', ({ expect }) => {
    expect(renderImports(['B', 'C', 'A', 'Bb', 'bB'], 'mod')).toMatchInlineSnapshot(`
      "import {
          A,
          B,
          Bb,
          C,
          bB
      } from 'mod'"
    `)
  })

  test('Throws if imports array is empty', () => {
    expect(() => renderImports([], 'xxx')).toThrow()
  })
})
