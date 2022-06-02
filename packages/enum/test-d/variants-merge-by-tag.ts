import { Variant, variant } from '../src/lib'

/**
 * Multiple variant with the same tag - works!
 * Useless by the way
 */

type MultiDog = Variant<'Dog'> | Variant<'Dog', boolean>

const a1 = variant<MultiDog>('Dog')
const a2 = variant<MultiDog>('Dog', false)
const a3 = variant<MultiDog>('Dog', true)
