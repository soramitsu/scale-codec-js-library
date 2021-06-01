import { ScaleCreateFromVoid, ScaleDecoder, ScaleEncoder } from './core';

// type ScaleEncoded

// interface ScaleDecoder

// interface ScaleEncoder {
//     encode(): Uint8Array;
//     encodedLengthHint(): number;
// }

// interface ScaleDecoder<T extends ScaleEncoder> {
//     decode(encodedBytes: Uint8Array): T;
// }

// type ScaleDecoderInstance<T extends ScaleDecoder<any>> = T extends ScaleDecoder<infer E> ? E : never;

////////////////////////////

export const ScaleStringDecoder: ScaleDecoder & ScaleCreateFromVoid = {
    decode: () => new ScaleString(),
    createFromVoid: () => new ScaleString(),
};

export class ScaleString implements ScaleEncoder {
    encode(): Uint8Array {
        return new Uint8Array();
    }

    encodedLengthHint(): number {
        return 4;
    }
}

//////////////////

// type AA = ScaleDecoderInstance<ScaleDecoder<ScaleString>>;

// class ScaleMap<K extends ScaleDecoder<any>, V extends ScaleDecoder<any>> extends Map {

// }

// interface ScaleStringInstance {
//     encode(): Uint8Array;
//     encodedLengthHint(): number;

//     readonly value: string;
// }

// interface ScaleStringDecoder {
//     decode(bytes: Uint8Array): ScaleStringInstance;
// }

// interface ScaleStringConstructor {
//     fromString(value: string): ScaleStringInstance;
// }

// // function defineCodec<I>(
// //     ztatic:
// // ) {

// // }

// const ScaleString = {
//     static: {
//         decode() {

//         },
//         fromString() {

//         }
//     },
//     instance: {
//         encode() {

//         },
//         encodedLengthHint() {

//         }
//     }
// }
