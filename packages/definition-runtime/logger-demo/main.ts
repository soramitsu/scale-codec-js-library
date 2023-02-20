import {
  CodecEnum,
  CodecStruct,
  EnumBox,
  Enumerate,
  Logger,
  Str,
  U8,
  createEnumCodec,
  createStructCodec,
} from '../src/lib'

// Codecs

type Gender = EnumBox<Enumerate<{ Male: []; Female: [] }>>

const Gender: CodecEnum<Gender> = createEnumCodec('Gender', [
  [0, 'Male'],
  [1, 'Female'],
])

const Person: CodecStruct<{
  name: Str
  age: U8
  gender: Gender
}> = createStructCodec('Person', [
  ['name', Str],
  ['age', U8],
  ['gender', Gender],
])

// Act

new Logger({
  logDecodeSuccesses: true,
  logDecodeErrors: true,
}).mount()

const buff = Person.toBuffer({
  name: 'John',
  age: 55,
  gender: Gender('Male'),
})

Person.fromBuffer(buff)
