import { Variant } from '../src/lib'

type Animal = Variant<'Dog'> | Variant<'Cat'>
type AnimalExt = Animal | Variant<'Mouse'>
type AnimalAlt = Variant<'Dog'> | Variant<'Cat', number>
type OtherAnimal = Variant<'Dog'> | Variant<'Wolf'>

declare const animal: Animal
declare const animalExt: AnimalExt
declare const animalAlt: AnimalAlt

const test1: Animal = animal

// @ts-expect-error
const test2: Animal = animalExt
// @ts-expect-error
const test3: OtherAnimal = animal
// @ts-expect-error
const test4: OtherAnimal = animalExt

// Ooops - it is assignable. But is it a problem?
const test5: AnimalExt = animal

// @ts-expect-error
const test6: Animal = animalAlt
