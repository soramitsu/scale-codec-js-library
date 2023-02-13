import { RustOption, variant } from '../src/lib'

const a1: RustOption<string> = variant('None')
const a2: RustOption<string> = variant('Some', 'hey')
const a3 = variant<RustOption<number>>('None')

// Inference

interface Container<T> {
  maker: () => T
}

declare function acceptContainerAndValue<T>(cont: Container<T>, value: T): void
declare const OptionNumContainer: Container<RustOption<number>>

// TypeScript IDE hints work!
acceptContainerAndValue(OptionNumContainer, variant('None'))
acceptContainerAndValue(OptionNumContainer, variant('Some', 51))

// @ts-expect-error
acceptContainerAndValue(OptionNumContainer, variant('Some'))
// @ts-expect-error
acceptContainerAndValue(OptionNumContainer, variant('WTF'))

// Instantiation Expression
// (doesn't work anymore)

// // prettier-ignore
// const OptionString = variant<RustOption<string>>;
//
// const b1 = OptionString('None')
// const b2 = OptionString('Some', 'foobar')

// ERRORS

const err1: RustOption<boolean> =
  // @ts-expect-error
  variant('Some')
const err2: RustOption<boolean> =
  // @ts-expect-error
  variant('None', false)
const err3: RustOption<boolean> =
  // @ts-expect-error
  variant('Some', 412)
