import {
  Enum,
  EnumCodec,
  Logger,
  Str,
  StructCodec,
  U8,
  createEnumCodec,
  createStructCodec,
} from '@scale-codec/definition-runtime'

// Codecs

const Gender: EnumCodec<'Male' | 'Female'> = createEnumCodec('Gender', [
  [0, 'Male'],
  [1, 'Female'],
])

const Person: StructCodec<{
  name: typeof Str
  age: typeof U8
  gender: typeof Gender
}> = createStructCodec('Person', [
  ['name', Str],
  ['age', U8],
  ['gender', Gender],
])

// Act

new Logger({
  logDecodeSuccesses: true,

  // default
  logDecodeErrors: true,
}).mount()

const buff = Person.toBuffer({
  name: 'John',
  age: 55,
  gender: Enum.variant('Male'),
})

Person.fromBuffer(buff)
