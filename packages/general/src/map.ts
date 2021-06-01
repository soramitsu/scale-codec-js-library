import { CodecTypeOptions } from './core';

export function createCodecMap<N extends {}, K extends keyof N & string, V extends keyof N & string>(
    keyType: K,
    valueType: V,
): CodecTypeOptions<N, Map<N[K], N[V]>> {
    return {
        encode: (root, map) => {
            // yeah, typed map!
            const Key = root.lookup(keyType);
            const Value = root.lookup(valueType);

            const encodedEntries = [...map.entries()].map(([k, v]) =>
                // here is issue: encode(value: any) - ANY?!!
                [Key.encode(k), Value.encode(v)],
            );

            return new Uint8Array();
        },
        decode: (root, buff) => {
            const Key = root.lookup(keyType);
            const Value = root.lookup(valueType);

            // decoding buffer
            const k = Key.decode(buff.slice(0, 15));
            const v = Value.decode(buff.slice(15, 100));

            return new Map();
        },
    };
}

// type MyNS = {
//     String: string;
//     Num: number;
// };

// const MapStrNum = createCodecMap<MyNS, 'String', 'Num'>('String', 'Num');

// MapStrNum.encode(1)

// export function createScaleMapDecoder<K extends ScaleEncoder, V extends ScaleEncoder>(
//     KeyDecoder: ScaleDecoder<K>,
//     ValueDecoder: ScaleDecoder<V>,
// ): ScaleDecoder<ScaleMap<K, V>> {
//     class TypedMap extends Map<K, V> implements ScaleEncoder {
//         encode() {
//             const bytes = [...this.entries()]
//                 .map(([key, value]) => {
//                     return [key.encode(), value.encode()];
//                 })
//                 .flat();

//             // concatenating...

//             return new Uint8Array();
//         }

//         encodedLengthHint() {
//             return 0;
//         }
//     }

//     return {
//         decode(bytes) {
//             // cutting bytes to slices
//             const cutted: [Uint8Array, Uint8Array][] = [];

//             // decoding
//             const decoded: [K, V][] = cutted.map(([keyEncoded, valueEncoded]) => [
//                 KeyDecoder.decode(keyEncoded),
//                 ValueDecoder.decode(valueEncoded),
//             ]);

//             return new TypedMap(decoded);
//         },
//     };
// }

// export type ScaleMap<K extends ScaleEncoder, V extends ScaleEncoder> = Map<K, V> & ScaleEncoder;
