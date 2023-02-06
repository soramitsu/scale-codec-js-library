import { EnumOf, Enumerate } from '../src/lib'

type Animal = Enumerate<{ Dog: []; Cat: [] }>
type AnimalExt = Enumerate<EnumOf<Animal> & { Mouse: [] }>
type AnimalAlt = Enumerate<{ Dog: []; Cat: [number] }>
type OtherAnimal = Enumerate<{ Dog: []; Wolf: [] }>
type Plant = Enumerate<{ Grass: []; Tree: [] }>

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
// @ts-expect-error
const test5: AnimalExt = animal

// @ts-expect-error
const test6: Animal = animalAlt

// CASTING

const test7 = animal as AnimalExt
const test8 = animalExt as Animal
// @ts-expect-error
const test9 = animalAlt as Animal
// @ts-expect-error
const test10 = plant as Animal
// @ts-expect-error
const test11 = animalAlt as Plant
