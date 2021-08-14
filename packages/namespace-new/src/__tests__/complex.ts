import { Valuable, Enum, Codec, Encode } from '@scale-codec/namespace';
import {
    intCodec,
    bigintCodec,
    structCodec,
    mapCodec,
    setCodec,
    TupleWithSkippables,
    tupleCodec,
    vecCodec,
    arrayCodec,
    enumCodec,
    BYTES_VECTOR_CODEC,
    STR_CODEC,
    VOID_CODEC,
    BOOL_CODEC,
    bytesArrayCodec,
} from '../codecs';
import { StructEncodable, EnumDefEncodable } from '../encodables';
import { EncodeSkippable, skipEncode } from '../skippable';
import JSBI from 'jsbi';
import { wrapOnce } from '../util';

/* eslint-disable @typescript-eslint/no-namespace */
namespace Example {
    // primitives start

    export namespace Void {
        export type Pure = null;
        export type Encodable = null;

        export const { encode, decode } = VOID_CODEC;
    }

    export namespace str {
        export type Pure = string;
        export type Encodable = string;

        export const { encode, decode } = STR_CODEC;
    }

    export namespace u8 {
        export type Pure = number;
        export type Encodable = number;

        export const { encode, decode } = intCodec({
            bits: 8,
            signed: false,
            endianness: 'le',
        });
    }

    export namespace i64 {
        export type Pure = JSBI;
        export type Encodable = JSBI;

        export const { encode, decode } = bigintCodec({
            bits: 64,
            signed: true,
            endianness: 'le',
        });
    }

    export namespace BytesVec {
        export type Pure = Uint8Array;
        export type Encodable = Uint8Array;

        export const { encode, decode } = BYTES_VECTOR_CODEC;
    }

    export namespace bool {
        export type Pure = boolean;
        export type Encodable = boolean;

        export const { encode, decode } = BOOL_CODEC;
    }

    // primitives end

    // struct sample
    export namespace Person {
        export type Pure = {
            name: Example.str.Pure;
            age: Example.u8.Pure;
        };
        export type Encodable = StructEncodable<EncodableEntries>;
        type EncodableEntries = {
            name: Example.str.Encodable;
            age: Example.u8.Encodable;
        };

        const ORDER: (keyof Pure)[] = ['name', 'age'];

        export const { encode, decode } = structCodec<Pure, EncodableEntries>(
            {
                name: Example.str,
                age: Example.u8,
            },
            ORDER,
        );
    }

    // Map sample
    export namespace Map_i64_Person {
        export type Pure = Map<Example.i64.Pure, Example.Person.Pure>;
        export type Encodable = Map<
            Example.i64.Encodable | EncodeSkippable,
            Example.Person.Encodable | EncodeSkippable
        >;

        export const { encode, decode } = mapCodec(Example.i64, Example.Person);
    }

    // Set sample
    export namespace Set_Person {
        export type Pure = Set<Example.Person.Pure>;
        export type Encodable = Set<Example.Person.Encodable | EncodeSkippable>;

        export const { encode, decode } = setCodec(Example.Person);
    }

    // Tuple sample
    export namespace Tuple_Map_i64_Person_Set_Person {
        export type Pure = [Example.Map_i64_Person.Pure, Example.Set_Person.Pure];
        type TupleEncodables = [Example.Map_i64_Person.Encodable, Example.Set_Person.Encodable];
        export type Encodable = TupleWithSkippables<TupleEncodables>;

        export const { encode, decode } = tupleCodec<Pure, TupleEncodables>(
            [Example.Map_i64_Person.encode, Example.Set_Person.encode],
            [Example.Map_i64_Person.decode, Example.Set_Person.decode],
        );
    }

    // Vec sample
    export namespace Vec_Person {
        export type Decoded = Example.Person.Pure[];
        export type Encodable = (Decoded | EncodeSkippable)[];

        export const { encode, decode } = vecCodec(Example.Person);
    }

    // Array sample
    export namespace Array_str {
        export type Pure = Example.str.Pure[];
        export type Encodable = (Example.str.Encodable | EncodeSkippable)[];

        export const LEN = 32;

        export const { encode, decode } = arrayCodec(Example.str, LEN);
    }

    // Bytes array example
    export namespace Array_u8_5 {
        export type Pure = Uint8Array;
        export type Encodable = Uint8Array;

        export const LEN = 5;

        export const { encode, decode } = bytesArrayCodec(LEN);
    }

    // Enum sample
    export namespace Event {
        export type DefPure = {
            Received: null;
            Message: Valuable<Example.str.Pure>;
            Truth: Valuable<Example.bool.Pure>;
        };
        export type DefEncodable = EnumDefEncodable<{
            Received: null;
            Message: Valuable<Example.str.Encodable>;
            Truth: Valuable<Example.bool.Encodable>;
        }>;

        export type Pure = Enum<DefPure>;
        export type Encodable = Enum<DefEncodable>;

        export namespace Vars {
            export const Received = wrapOnce<Encodable>(() =>
                Object.freeze(Enum.create<DefEncodable, 'Received'>('Received')),
            );

            export const Message = (val: Example.str.Encodable | EncodeSkippable): Encodable =>
                Enum.create('Message', val);

            export const Truth = (val: Example.bool.Encodable | EncodeSkippable): Encodable =>
                Enum.create('Truth', val);
        }

        export const { encode, decode } = enumCodec<DefPure, DefEncodable>({
            Received: {
                d: 0,
            },
            Message: {
                d: 1,
                codec: Example.str,
            },
            Truth: {
                d: 2,
                codec: Example.bool,
            },
        });
    }

    export namespace MegaStruct {
        export type Pure = {
            person: Example.Person.Pure;
            map_set: Example.Tuple_Map_i64_Person_Set_Person.Pure;
            bytes: Example.BytesVec.Pure;
        };

        export type Encodable = StructEncodable<EncodableEntries>;
        type EncodableEntries = {
            person: Example.Person.Encodable;
            map_set: Example.Tuple_Map_i64_Person_Set_Person.Encodable;
            bytes: Example.BytesVec.Encodable;
        };

        const ORDER: (keyof Pure)[] = ['person', 'map_set', 'bytes'];

        export const { encode, decode } = structCodec<Pure, EncodableEntries>(
            {
                person: Example.Person,
                map_set: Example.Tuple_Map_i64_Person_Set_Person,
                bytes: Example.BytesVec,
            },
            ORDER,
        );
    }
}

function testEncodeDecode<D, E>({
    codec,
    encodable: encodableNonNormalized,
    encoded,
    label,
    decoded,
}: {
    label: string;
    codec: Codec<D, E>;
    encodable: E | E[];
    encoded: number[] | Uint8Array;
    decoded: D;
}) {
    const encodedBytes: Uint8Array = encoded instanceof Uint8Array ? encoded : new Uint8Array(encoded);
    const encodables: E[] = Array.isArray(encodableNonNormalized) ? encodableNonNormalized : [encodableNonNormalized];

    encodables.forEach((encodable, i) => {
        test(`Encode & decode ${label} - case ${i}`, () => {
            expect(codec.encode(encodable)).toEqual(encodedBytes);
            expect(codec.decode(encodedBytes)).toEqual([decoded, encodedBytes.length]);
        });
    });
}

describe('Complex testing of example namespace', () => {
    testEncodeDecode({
        label: 'Vec<Person>',
        codec: Example.Vec_Person,
        encodable: [
            [
                {
                    name: 'Alice',
                    age: 13,
                },
                {
                    name: skipEncode(Example.str.encode('Bob')),
                    age: 11,
                },
                {
                    name: 'Queen',
                    age: skipEncode(Example.u8.encode(100)),
                },
                skipEncode(
                    Example.Person.encode({
                        name: 'Ghost',
                        age: 255,
                    }),
                ),
            ],
        ],
        decoded: [
            {
                name: 'Alice',
                age: 13,
            },
            {
                name: 'Bob',
                age: 11,
            },
            {
                name: 'Queen',
                age: 100,
            },
            {
                name: 'Ghost',
                age: 255,
            },
        ],
        encoded: [
            16, 20, 65, 108, 105, 99, 101, 13, 12, 66, 111, 98, 11, 20, 81, 117, 101, 101, 110, 100, 20, 71, 104, 111,
            115, 116, 255,
        ],
    });

    testEncodeDecode({
        label: 'Map<i64, Person>',
        codec: Example.Map_i64_Person,
        encodable: [
            new Map<JSBI | EncodeSkippable, Example.Person.Encodable | EncodeSkippable>([
                [JSBI.BigInt(-123), { name: 'Alice', age: 19 }],
                [
                    skipEncode(Example.i64.encode(JSBI.BigInt(41))),
                    skipEncode(
                        Example.Person.encode({
                            name: 'Bob',
                            age: 51,
                        }),
                    ),
                ],
            ]),
            new Map<JSBI | EncodeSkippable, Example.Person.Encodable | EncodeSkippable>([
                [
                    skipEncode(Example.i64.encode(JSBI.BigInt(-123))),
                    skipEncode(Example.Person.encode({ name: 'Alice', age: 19 })),
                ],
                [
                    JSBI.BigInt(41),
                    {
                        name: 'Bob',
                        age: 51,
                    },
                ],
            ]),
        ],
        decoded: new Map([
            [JSBI.BigInt(-123), { name: 'Alice', age: 19 }],
            [
                JSBI.BigInt(41),
                {
                    name: 'Bob',
                    age: 51,
                },
            ],
        ]),
        encoded: [
            8, 133, 255, 255, 255, 255, 255, 255, 255, 20, 65, 108, 105, 99, 101, 19, 41, 0, 0, 0, 0, 0, 0, 0, 12, 66,
            111, 98, 51,
        ],
    });

    testEncodeDecode({
        label: '(Map<i64, Person>, Set<Person>)',
        codec: Example.Tuple_Map_i64_Person_Set_Person,
        encodable: [
            [
                new Map([]),
                new Set([
                    {
                        name: 'Sweety',
                        age: 26,
                    },
                    skipEncode(
                        Example.Person.encode({
                            name: 'Tora',
                            age: 29,
                        }),
                    ),
                ]),
            ],
            [
                skipEncode(Example.Map_i64_Person.encode(new Map())),
                new Set([
                    {
                        name: 'Sweety',
                        age: 26,
                    },
                    {
                        name: 'Tora',
                        age: 29,
                    },
                ]),
            ],
        ] as Example.Tuple_Map_i64_Person_Set_Person.Encodable[],
        decoded: [
            new Map(),
            new Set([
                {
                    name: 'Sweety',
                    age: 26,
                },
                {
                    name: 'Tora',
                    age: 29,
                },
            ]),
        ],
        encoded: [0, 8, 24, 83, 119, 101, 101, 116, 121, 26, 16, 84, 111, 114, 97, 29],
    });

    testEncodeDecode({
        label: '[u8; 5] (bytes array)',
        codec: Example.Array_u8_5,
        encodable: [Uint8Array.from([6, 1, 10, 100, 255])],
        encoded: Uint8Array.from([6, 1, 10, 100, 255]),
        decoded: Uint8Array.from([6, 1, 10, 100, 255]),
    });

    testEncodeDecode({
        label: 'Event::Received',
        codec: Example.Event,
        encodable: Enum.create<Example.Event.DefEncodable, 'Received'>('Received'),
        decoded: Enum.create<Example.Event.DefEncodable, 'Received'>('Received'),
        encoded: [0],
    });

    testEncodeDecode({
        label: 'Event::Message("412")',
        codec: Example.Event,
        encodable: [
            Enum.create('Message', '412'),
            Enum.create('Message', skipEncode(Example.str.encode('412'))),
        ] as Example.Event.Encodable[],
        decoded: Enum.create<Example.Event.DefEncodable, 'Message'>('Message', '412'),
        encoded: [1, 12, 52, 49, 50],
    });

    testEncodeDecode({
        label: 'Event::Truth(true)',
        codec: Example.Event,
        encodable: [
            Enum.create('Truth', true),
            Enum.create('Truth', skipEncode(Example.bool.encode(true))),
        ] as Example.Event.Encodable[],
        decoded: Enum.create<Example.Event.DefEncodable, 'Truth'>('Truth', true),
        encoded: [2, 1],
    });

    testEncodeDecode({
        label: 'MegaStruct',
        codec: Example.MegaStruct,
        decoded: {
            person: {
                name: 'Toma',
                age: 90,
            },
            map_set: [
                new Map([]),
                new Set([
                    {
                        name: 'Sweety',
                        age: 26,
                    },
                    {
                        name: 'Tora',
                        age: 29,
                    },
                ]),
            ],
            bytes: new Uint8Array([6, 1, 66, 1, 2, 150, 42]),
        },
        encodable: {
            person: {
                name: 'Toma',
                age: 90,
            },
            map_set: [
                skipEncode(new Uint8Array([0])),
                new Set([
                    {
                        name: 'Sweety',
                        age: 26,
                    },
                    skipEncode(
                        Example.Person.encode({
                            name: 'Tora',
                            age: 29,
                        }),
                    ),
                ]),
            ],
            bytes: new Uint8Array([6, 1, 66, 1, 2, 150, 42]),
        },
        encoded: [
            16, 84, 111, 109, 97, 90, 0, 8, 24, 83, 119, 101, 101, 116, 121, 26, 16, 84, 111, 114, 97, 29, 28, 6, 1, 66,
            1, 2, 150, 42,
        ],
    });
});
