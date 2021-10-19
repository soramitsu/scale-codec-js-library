import { Enum } from '@scale-codec/definition-runtime';
import { Message_encode, Message_decode, Message_Decoded } from '../samples/enums';

test('Encode/decode empty enum', () => {
    const decoded: Message_Decoded = Enum.create('Quit');

    expect(Message_decode(Message_encode(decoded))[0]).toEqual(decoded);
});

test('Encode/decode non-empty enum', () => {
    const decoded: Message_Decoded = Enum.create('Greeting', 'Nya');

    expect(Message_decode(Message_encode(decoded))[0]).toEqual(decoded);
});
