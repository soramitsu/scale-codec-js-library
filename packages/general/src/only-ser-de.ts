const ScaleEncodeSymbol = Symbol('EncodeScale')

const ScaleDecodeSymbol = Symbol('DecodeScale')

interface ScaleEncodable {
    [ScaleEncodeSymbol]: <T>(this: T) => Uint8Array;
}

interface ScaleDecodable {
    [ScaleDecodeSymbol]: <T>(bytes: Uint8Array) => T;
}

function encode<T>(something: ScaleEncodable): Uint8Array;

function decode<T extends ScaleDecodable>(bytes: Uint8Array, decoder: T, ): T;

function decodeHex<T extends ScaleDecodable>(hex: string): T;

// ---

// class ScaleString extends String implements ScaleEncodable {
//     [ScaleEncodeSymbol]() {
//         return new Uint8Array();
//     }

//     static [ScaleDecodeSymbol](bytes: Uint8Array) {        
//         return 'hey!'
//     }

//     // decode()
// }

const val = decode( new Uint8Array(), ScaleString)
// val.




