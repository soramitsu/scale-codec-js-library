import { RustOption, Variant, VariantAny } from '../src/lib'

type VariantToRecord<V extends VariantAny> = (V extends Variant<any, infer Tag, infer Content>
  ? Content extends [infer C]
    ? [Tag, (content: C) => void]
    : [Tag]
  : never)[]

declare function varToRec<V extends VariantAny>(rec: VariantToRecord<V>): void

// OK
varToRec<RustOption<any>>([['None'], ['Some', (value) => {}]])

// Fine too
varToRec<RustOption<string>>([
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

function doSomethingWithGenericOption<T extends RustOption<any>>(): void {
  // LIMITATION
  // Type assignment brokes here
  // @ts-expect-error
  varToRec<T>([['None']])
}
