import { AnyVariant, Option, Variant } from '../src/lib'

type VariantToRecord<V extends AnyVariant> = (V extends Variant<infer V>
  ? V extends infer Tag extends string
    ? [Tag]
    : V extends [infer Tag extends string, infer Value]
    ? [Tag, (value: Value) => void]
    : never
  : never)[]

declare function varToRec<T extends AnyVariant>(rec: VariantToRecord<T>): void

// OK
varToRec<Option<any>>([['None'], ['Some', (value) => {}]])

// Fine too
varToRec<Option<string>>([
  ['None'],
  // @ts-expect-error
  ['Some'],
  ['Some', (value) => value.codePointAt(1)],
  [
    'Some',
    // @ts-expect-error
    (value: number) => {
      value.toExponential()
    },
  ],
])

function doSomethingWithGenericOption<T extends Option<any>>(): void {
  // LIMITATION
  // Type assignment brokes here
  // @ts-expect-error
  varToRec<T>([['None']])
}
