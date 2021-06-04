import { Codec } from '../types';

/**
 * FIXME convert to class!
 * new MapCodec('String', 'u64');
 * class MapCodec<N, K, V> implements Codec<N, Map<N[K], N[V]>> {}
 * @param keyTypeName
 * @param valueTypeName
 */
export function MapCodec<N extends {}, K extends keyof N, V extends keyof N>(
    keyTypeName: K,
    valueTypeName: V,
): Codec<N, Map<N[K], N[V]>> {
    return {
        encode: (root, map) => {
            // ohhhh, it it impossible to type correctly. But, it is very scoped unsafety and may be tested
            const Key = root.lookup(keyTypeName);
            const Value = root.lookup(valueTypeName);

            // Key

            const encodedEntries = [...map.entries()].map(([k, v]) =>
                // here is issue: encode(value: any) - ANY?!!
                [Key.encode(k), Value.encode(v)],
            );

            return new Uint8Array();
        },
        decode: (root, buff) => {
            const Key = root.lookup(keyTypeName);
            const Value = root.lookup(valueTypeName);

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
