import { createStateScope } from '../util'

test('use() returns scope value', () => {
    const { use, within } = createStateScope<string>()

    within('test', () => {
        expect(use()).toEqual('test')
    })
})

test('nested use() works', () => {
    const { use, within } = createStateScope<number>()

    within(3, () => {
        within(5, () => {
            expect(use()).toEqual(5)
        })
    })
})

test('1-level use works after nested scope usage', () => {
    const { use, within } = createStateScope<number>()

    within(3, () => {
        within(5, () => {
            use()
        })
        expect(use()).toEqual(3)
    })
})

test('use() throws at 0-level scope', () => {
    const { use } = createStateScope<number>()

    expect(() => use()).toThrow()
})
