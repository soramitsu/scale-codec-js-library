import { Variant } from '../src/lib'

type Animal = Variant<'Dog'> | Variant<'Cat'>
type AnimalExt = Animal | Variant<'Mouse'>
type AnimalAlt = Variant<'Dog'> | Variant<['Cat', number]>
type OtherAnimal = Variant<'Dog'> | Variant<'Wolf'>
type Plant = Variant<'Grass'> | Variant<'Tree'>

declare const animal: Animal
declare const animalExt: AnimalExt
declare const animalAlt: AnimalAlt
declare const plant: Plant

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

// CASTING

const test7 = animal as AnimalExt
const test8 = animalExt as Animal
const test9 = animalAlt as Animal
// @ts-expect-error
const test10 = plant as Animal
// @ts-expect-error
const test11 = animalAlt as Plant
