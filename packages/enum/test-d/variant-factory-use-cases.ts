import { Option, variant } from '../src/lib'

const a1: Option<string> = variant('None')
const a2: Option<string> = variant('Some', 'hey')
const a3 = variant<Option<number>>('None')

// Inference

interface Container<T> {
  maker: () => T
}

declare function acceptContainerAndValue<T>(cont: Container<T>, value: T): void
declare const OptionNumContainer: Container<Option<number>>

// TypeScript IDE hints work!
acceptContainerAndValue(OptionNumContainer, variant('None'))
acceptContainerAndValue(OptionNumContainer, variant('Some', 51))

// @ts-expect-error
acceptContainerAndValue(OptionNumContainer, variant('Some'))
// @ts-expect-error
acceptContainerAndValue(OptionNumContainer, variant('WTF'))

// Instantiation Expression

// prettier-ignore
const OptionString = variant<Option<string>>;

const b1 = OptionString('None')
const b2 = OptionString('Some', 'foobar')

// ERRORS

const err1: Option<boolean> =
  // @ts-expect-error
  variant('Some')
const err2: Option<boolean> =
  // @ts-expect-error
  variant('None', false)
const err3: Option<boolean> =
  // @ts-expect-error
  variant('Some', 412)
