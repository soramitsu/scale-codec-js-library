import {
    encodeStruct,
    encodeUint8Vec,
    encodeCompact,
    encodeStr,
    JSBI,
    FragmentFromBuilder,
    Str,
    BytesVec,
    Compact,
} from '@scale-codec/definition-runtime';
import { Mystery } from '../samples/structFieldsOrdering';

interface Raw {
    b: string;
    a: JSBI;
    A: Uint8Array;
}

type Scale = FragmentFromBuilder<typeof Mystery>;

function makeRaw(value: Raw): Raw {
    return value;
}

function makeScale(value: Raw): Scale {
    return Mystery.fromValue({
        A: BytesVec.fromValue(value.A),
        a: Compact.fromValue(value.a),
        b: Str.fromValue(value.b),
    });
}

function unwrapScale({
    value: {
        A: { value: A },
        a: { value: a },
        b: { value: b },
    },
}: Scale): Raw {
    return { A, a, b };
}

function encodeRaw(value: Raw): Uint8Array {
    return encodeStruct(
        value,
        {
            A: encodeUint8Vec,
            a: encodeCompact,
            b: encodeStr,
        },
        ['b', 'a', 'A'],
    );
}

test('Encodes as expected', () => {
    const raw = makeRaw({
        A: new Uint8Array([6, 1, 2, 3, 123, 4, 1, 4, 1, 4, 1, 2, 3, 4]),
        a: JSBI.BigInt('81818273'),
        b: 'Nyanpasu',
    });
    const scale = makeScale(raw);

    expect(scale.bytes).toEqual(encodeRaw(raw));
});

test('Decodes as expected', () => {
    const raw = makeRaw({
        A: new Uint8Array([6, 1, 2, 3, 123, 4, 1, 4, 1, 4, 1, 2, 3, 4]),
        a: JSBI.BigInt('81818273'),
        b: 'Nyanpasu',
    });
    const encoded = encodeRaw(raw);

    const scale = Mystery.fromBytes(encoded);

    expect(unwrapScale(scale)).toEqual(raw);
});
