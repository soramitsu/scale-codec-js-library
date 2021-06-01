import { CodecOptions, CodecType, CodecTypeValue, Namespace, TypesOpts } from './types';

function compileTypeDefinition<N extends {}, V>(root: Namespace<N>, typeOptions: CodecOptions<N, V>): CodecType<V> {
    const { encode, decode } = typeOptions;
    return {
        encode: (v) => encode(root, v),
        decode: (b) => decode(root, b),
    };
}

export function defineNamespace<N extends {}>(namescape: TypesOpts<N>): Namespace<N> {
    const ns: Namespace<N> = {} as any;

    const types: N = Object.fromEntries(
        (Object.entries(namescape) as [keyof N, CodecOptions<N, any>][]).map(([typeName, options]) => [
            typeName,
            compileTypeDefinition(ns, options),
        ]),
    ) as any;

    ns.lookup = (type) => types[type];
    // ns.encode = (type, val) => ns.lookup(type).encode(val);
    // ns.decode = (type, buff) => ns.lookup(type).decode(buff);

    return ns;
}

// testing

{
    type MyTypes = {
        Id: CodecType<{
            name: string;
            domain: string;
        }>;
        Account: CodecType<{
            id: CodecTypeValue<MyTypes['Id']>;
        }>;
    };

    // interface Id {
    //     name: string;
    //     domain: string;
    // }

    // interface Account {
    //     id: Id;
    // }

    // type Namespace = {
    //     [K in keyof MyTypes]: CodecType<MyTypes[K]>;
    // };

    const root = defineNamespace<MyTypes>({
        Id: {
            encode(root, { name, domain }) {
                console.log('encoding %o & %o', name, domain);
                // const name = id;
                return new Uint8Array();
            },
            decode(root, buff) {
                return { name: 'test', domain: 'puff' };
            },
        },
        Account: {
            encode: (root, { id }) => {
                return root.lookup('Id').encode(id);
                // root.lookup('Id')
                // return root.encode('Id', id);
            },
            decode: (root, buff) => {
                const id = root.lookup('Id').decode(buff);
                return { id };
            },
        },
    });

    // root.lookup('Id').
}

{
    type CodecNumType = 'signed' | 'unsigned';

    class CodecNumber {
        public constructor(value: number, bits: number, type: CodecNumType) {}

        encode(): Uint8Array {}
    }

    function createCodecNumber(bits: number, type: CodecNumType): CodecTypeOptions<any, CodecNumber> {
        return {
            decode: (root, buff) => new CodecNumber(4123, bits, type),
            encode: (root, val) => val.encode(),
        };
    }

    const root = defineNamespace<{
        u8: CodecNumber;
        u16: CodecNumber;
        u32: CodecNumber;
        i8: CodecNumber;
        i16: CodecNumber;
        i32: CodecNumber;
    }>({
        u8: createCodecNumber(8, 'unsigned'),
        u16: createCodecNumber(16, 'unsigned'),
        u32: createCodecNumber(32, 'unsigned'),
        i8: createCodecNumber(8, 'signed'),
        i16: createCodecNumber(16, 'signed'),
        i32: createCodecNumber(32, 'signed'),
    });

    const buff = root.lookup('u8').encode(new CodecNumber(4152, 412, 'unsigned'));
}

// custom type options
{
    type NS = {
        SmartString: CodecTypeOptions<NS, string> & { fromHex(hex: string): string };
    };

    const root = defineNamespace<NS>(null as any);

    root.lookup('SmartString').fromHex();

    type Base = {
        foo: string;
    };

    interface BaseExtended extends Base {
        bar: number;
    }

    type BaseExtension = Omit<BaseExtended, keyof Base>;
}

// enum
{
}
// type TypeCompiled<
//     Defs extends Definitions<any, any>,
//     K extends keyof Defs,
//     Def extends TypeDef<any, any> = Defs[K],
// > = Def extends TypeDef<any, infer T>
//     ? {
//           encode: (value: T) => Uint8Array;
//           decode: (buffer: Uint8Array) => T;
//       } & (Def extends { create: (root: any, value: infer V) => T } ? { create: (value: V) => T } : {})
//     : //  & (
//       //     Def extends { createFromVoid: (root: any) }
//       // )
//       never;

// type DefinedTypes<N> = keyof N & string;

// class Root<Defs extends Definitions<Namespace, Root<Namespace, any>>> {
//     constructor(types: Defs) {}

//     lookup<K extends DefinedTypes<Namespace>>(type: K): TypeCompiled<Defs, K> {
//         return null;
//     }
// }

// const root = new Root({
//     Id: {
//         encode: () => new Uint8Array(),
//         decode: () => 'string',
//     },
// });

// interface Codec {
//     decode(encodedBytes: Uint8Array): unknown;

// }

// export function defineDecoder<T extends ScaleEncoder>(
//     something: T & {
//         decode(bytes: Uint8Array): T;
//     },
// ): T & ScaleDecoder<T> {
//     return { ...something, [ScaleSymbolDecode]: something.decode };
// }

// export function defineEncoder<T extends ScaleEncoder>(
//     something: T & {
//         encode
//     }
// )
