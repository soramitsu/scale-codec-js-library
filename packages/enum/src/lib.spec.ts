import { describe, expect, test, vi } from 'vitest'
import { EMPTY_VALUE, Option, Variant, variant } from './lib'

describe.concurrent('Enum', () => {
  type OptionString = Option<string>

  test('variant() with 1 arg creates empty enum', () => {
    const item = variant<OptionString>('None')

    expect(item.tag).toBe('None')
    expect(item.value).toBe(EMPTY_VALUE)
  })

  test('variant() with 1 arg creates empty enum', () => {
    const item = variant<OptionString>('Some', 'foobar')

    expect(item.tag).toBe('Some')
    expect(item.value).toBe('foobar')
  })

  test('JSON repr of empty enum', ({ expect }) => {
    expect(variant<OptionString>('None')).toMatchInlineSnapshot(`
      {
        "tag": "None",
      }
    `)
  })

  test('JSON repr of valuable enum', ({ expect }) => {
    expect(variant<OptionString>('Some', 'bobobo')).toMatchInlineSnapshot(
      `
      {
        "tag": "Some",
        "value": "bobobo",
      }
    `,
    )
  })
})
