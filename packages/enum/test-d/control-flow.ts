import { EmptyValue, Variant } from '../src/lib'

interface Coords {
  x: number
  y: number
}

type Sample = Variant<'Foo'> | Variant<['Bar', number]> | Variant<['Baz', Coords]>

declare const sample: Sample

declare function assertNum(value: number): void
declare function assertEmpty(value: EmptyValue): void
declare function assertCoords(value: Coords): void

if (sample.tag === 'Bar') {
  assertNum(sample.value)
} else if (sample.tag === 'Foo') {
  assertEmpty(sample.value)
} else {
  assertCoords(sample.value)
}

switch (sample.tag) {
  case 'Foo': {
    console.log('empty', sample.value)
    break
  }
  case 'Bar': {
    console.log('Bar', Math.pow(sample.value, 2))
    break
  }
  case 'Baz': {
    console.log('Baz', sample.value.x, sample.value.y)
    break
  }
  default: {
    const uncovered: never = sample
    console.error('Uncovered', uncovered)
  }
}
