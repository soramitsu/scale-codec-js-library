import { Character_Decoded, Character_encode } from '../samples/struct';
import { encodeStrCompact, encodeStruct, JSBI, u8_encode } from '@scale-codec/definition-runtime';

test('Character is encoded as expected', () => {
    const character: Character_Decoded = {
        name: 'Alice',
        age: JSBI.BigInt(12),
    };

    const resultExpected = encodeStruct(character, { name: encodeStrCompact, age: u8_encode }, ['name', 'age']);
    const resultActual = Character_encode(character);

    expect(resultActual).toEqual(resultExpected);
});
