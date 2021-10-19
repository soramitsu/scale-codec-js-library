import { Character_Decoded } from './samples/struct';
import { JSBI } from '@scale-codec/definition-runtime';

const character: Character_Decoded = {
    name: 'Alice',
    age: JSBI.BigInt(12),
};
