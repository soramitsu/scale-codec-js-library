import { Enumerate } from '../src/lib'
import { P, match } from 'ts-pattern'

interface Coords {
  x: number
  y: number
}

type Sample = Enumerate<{ Foo: []; Bar: [number]; Baz: [Coords] }>

declare const sample: Sample

declare function assertType<T>(value: T): void

if (sample.tag === 'Bar') {
  assertType<number>(sample.content)
} else if (sample.tag === 'Foo') {
  assertType<undefined>(sample.content)
} else {
  assertType<Coords>(sample.content)
}

switch (sample.tag) {
  case 'Foo': {
    console.log('empty', sample.content)
    break
  }
  case 'Bar': {
    console.log('Bar', Math.pow(sample.content, 2))
    break
  }
  case 'Baz': {
    const { x, y } = sample.content
    console.log('Baz', x, y)
    break
  }
  default: {
    const uncovered: never = sample
    console.error('Uncovered', uncovered)
  }
}

match(sample)
  .with({ tag: 'Foo' }, () => 'empty foo')
  .with({ tag: 'Bar' }, ({ content: value }) => `SQR: ${value ** 2}`)
  .with({ tag: 'Baz' }, ({ content: { x, y } }) => `(${x}, ${y})`)
  .exhaustive()

match(sample)
  .with({ unit: false }, ({ tag }: { tag: 'Bar' | 'Baz' }) => {})
  .otherwise(() => {})

match(sample)
  .with({ content: P.number }, ({ tag }: { tag: 'Bar' }) => {})
  .otherwise(() => {})
