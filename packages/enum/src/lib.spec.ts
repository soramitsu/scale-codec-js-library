import { Enum } from './lib'

describe('Enum', () => {
  type DefWithNum = 'a' | ['b', number]
  type DefWithStr = 'a' | ['b', string]

  test('.is() returns true', () => {
    const val: Enum<DefWithNum> = Enum.variant('a')

    expect(val.is('a')).toBe(true)
  })

  test('.is() returns false', () => {
    const val: Enum<DefWithNum> = Enum.variant('a')

    expect(val.is('b')).toBe(false)
  })

  test('.as() works fine', () => {
    const val: Enum<DefWithNum> = Enum.variant('b', 111)

    expect(val.as('b')).toBe(111)
  })

  test('.as() throws an error if trying to cast to wrong variant', () => {
    const val: Enum<DefWithNum> = Enum.variant('a')

    expect(() => val.as('b')).toThrowErrorMatchingInlineSnapshot(`"Enum cast failed - enum is \\"a\\", not \\"b\\""`)
  })

  test('.as() throws an error if trying to call it with an empty enum', () => {
    const val: Enum<DefWithNum> = Enum.variant('a')

    expect(() => (val as any).as('a')).toThrowErrorMatchingInlineSnapshot(`"Enum cast failed - enum \\"a\\" is empty"`)
  })

  test.each([['Single'], ['Double']])('.match() calls the desired callback (%p)', (variant: 'Single' | 'Double') => {
    const matchMap = {
      Single: jest.fn(),
      Double: jest.fn(),
    }
    const other = variant === 'Double' ? 'Single' : 'Double'

    Enum.variant<Enum<'Single' | 'Double'>>(variant).match(matchMap)

    expect(matchMap[variant]).toBeCalled()
    expect(matchMap[other]).not.toBeCalled()
  })

  test('.match() calls it with inner value', () => {
    const val: Enum<DefWithStr> = Enum.variant('b', 'something')
    const spy = jest.fn()

    val.match({ a: () => {}, b: spy })

    expect(spy).toBeCalledWith('something')
  })

  test('.match() calls it with nothing', () => {
    const val: Enum<DefWithStr> = Enum.variant('a')
    const spy = jest.fn()

    val.match({ a: spy, b: () => {} })

    expect(spy).toBeCalledWith()
  })

  test('.match() returns the result of callback', () => {
    const val: Enum<DefWithStr> = Enum.variant('a')

    const result = val.match({ a: () => 'good', b: () => 'bad' })

    expect(result).toBe('good')
  })

  test('JSON repr of empty enum', () => {
    const val: Enum<DefWithStr> = Enum.variant('a')

    expect(val.toJSON()).toEqual({ tag: 'a' })
  })

  test('JSON repr of valuable enum', () => {
    const val: Enum<DefWithStr> = Enum.variant('b', 'bobobo')

    expect(val.toJSON()).toEqual({ tag: 'b', value: 'bobobo' })
  })
})
