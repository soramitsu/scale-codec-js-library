import { describe, expect, test } from 'vitest'
import { createDIScope } from '../util'

describe.concurrent('Dependency Injection scope', () => {
  test('use() returns scope value', () => {
    const { inject: use, provide: within } = createDIScope<string>()

    within('test', () => {
      expect(use()).toEqual('test')
    })
  })

  test('nested use() works', () => {
    const { inject: use, provide: within } = createDIScope<number>()

    within(3, () => {
      within(5, () => {
        expect(use()).toEqual(5)
      })
    })
  })

  test('1-level use works after nested scope usage', () => {
    const { inject: use, provide: within } = createDIScope<number>()

    within(3, () => {
      within(5, () => {
        use()
      })
      expect(use()).toEqual(3)
    })
  })

  test('use() throws at 0-level scope', () => {
    const { inject: use } = createDIScope<number>()

    expect(() => use()).toThrow()
  })
})
