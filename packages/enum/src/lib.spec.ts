import { describe, expect, test } from 'vitest'
import { RustOption, variant } from './lib'

describe.concurrent('Enum', () => {
  type OptionString = RustOption<string>

  test('variant() with 1 arg creates empty enum', () => {
    const item = variant<OptionString>('None')

    expect(item.tag).toBe('None')
    expect(item.content).toBe(undefined)
  })

  test('variant() with 1 arg creates empty enum', () => {
    const item = variant<OptionString>('Some', 'foobar')

    expect(item.tag).toBe('Some')
    expect(item.content).toBe('foobar')
  })

  describe.concurrent('JSON representation', () => {
    const jsonify = (x: unknown) => JSON.parse(JSON.stringify(x))

    test('JSON repr of empty enum', ({ expect }) => {
      expect(jsonify(variant<OptionString>('None'))).toEqual({ tag: 'None' })
    })

    test('JSON repr of valuable enum', ({ expect }) => {
      expect(jsonify(variant<OptionString>('Some', 'bobobo'))).toEqual({ tag: 'Some', content: 'bobobo' })
    })
  })

  test('empty variant is unit', () => {
    expect(variant<OptionString>('None').unit).toBe(true)
  })

  test('variant with content is not unit', () => {
    expect(variant<OptionString>('Some', 'foo').unit).toBe(false)
  })

  test('variant with `undefined` content is not unit', () => {
    expect(variant<RustOption<undefined>>('Some', undefined).unit).toBe(false)
  })
})
