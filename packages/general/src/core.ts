export type CodecType<V, E = {}> = {
    encode: (value: V) => Uint8Array;
    decode: (buffer: Uint8Array) => V;
    // create?: (something: Default) => V;
    // createFromVoid?: () => V;
} & E;

export type CodecTypeValue<C extends CodecType<unknown>> = C extends CodecType<infer V> ? V : never;

// export type NamescapeDefault = Record<string, CodecType<unknown>>;

export type NamespaceOptions<N extends {}> = {
    [K in keyof N]: CodecTypeOptions<N, N[K]>;
};

export interface Root<N extends {}> {
    lookup: RootLoolupFn<N>;
    encode: RootEncodeFn<N>;
    decode: RootDecodeFn<N>;
}

export type RootLoolupFn<N extends {}> = <K extends keyof N>(type: K) => CodecType<N[K]>;

export type RootEncodeFn<N extends {}> = <K extends keyof N>(type: K, value: N[K]) => Uint8Array;

export type RootDecodeFn<N extends {}> = <K extends keyof N>(type: K, buffer: Uint8Array) => N[K];

// definition internal, frame worked
export type CodecTypeOptions<N extends {}, V extends any, R = Root<N>> = {
    encode: (root: R, value: V) => Uint8Array;
    decode: (root: R, buffer: Uint8Array) => V;
    // create?: <V>(root: R, value: V) => T;
    // createFromVoid?: (root: R) => T;
};

function compileTypeDefinition<N extends {}, V>(root: Root<N>, typeOptions: CodecTypeOptions<N, V>): CodecType<V> {
    const { encode, decode } = typeOptions;
    return {
        encode: (v) => encode(root, v),
        decode: (b) => decode(root, b),
    };
}

type NamespaceToCodecTypes<N extends {}> = {
    [K in keyof N]: CodecType<N[K]>;
};

export function createRoot<N extends {}>(namescape: NamespaceOptions<N>): Root<N> {
    const root: Root<N> = {} as any;

    const types: NamespaceToCodecTypes<N> = Object.fromEntries(
        (Object.entries(namescape) as [keyof N, CodecTypeOptions<N, any>][]).map(([typeName, options]) => [
            typeName,
            compileTypeDefinition(root, options),
        ]),
    ) as any;

    root.lookup = (type) => types[type];
    root.encode = (type, val) => root.lookup(type).encode(val);
    root.decode = (type, buff) => root.lookup(type).decode(buff);

    return root;
}

// class RootImpl<N extends NamescapeDefault> implements Root<N> {
//     private types: N;

//     constructor(defs: NamespaceOptions<N>) {
//         this.types = Object.fromEntries(
//             (Object.entries(defs) as [keyof N, TypeOptions<N, any>][]).map(([typeName, options]) => [
//                 typeName,
//                 compileTypeDefinition(this, options),
//             ]),
//         ) as any;
//     }

//     lookup<K extends keyof N>(type: K): N[K] {
//         return this.types[type];
//     }

//     encode<K extends keyof N>(type: K, value: CodecTypeValue<N[K]>): Uint8Array {
//         return this.lookup(type).encode(value);
//     }

//     decode<K extends keyof N>(type: K, buffer: Uint8Array): CodecTypeValue<N[K]> {
//         return this.lookup(type).decode(buffer);
//     }
// }

{
    type MyTypes = {
        Id: {
            name: string;
            domain: string;
        };
        Account: {
            id: MyTypes['Id'];
        };
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

    const root = createRoot<MyTypes>({
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

    const root = createRoot<{
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

    const root = createRoot<NS>(null as any);

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
