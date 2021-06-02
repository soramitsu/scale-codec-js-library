import { Codec, StrKeys, CompatibleNamespaceTypes } from '../types';

// struct - key-value type, where key - field name, and value - type of inner value

// mapping to real namespace keys
type StructDefinition<N, S> = {
    [K in keyof S]: [K, CompatibleNamespaceTypes<N, S[K]>];
}[StrKeys<S>][];

export function defineStructCodec<N, S>(defs: StructDefinition<N, S>): Codec<N, S> {
    return null;
}

{
    interface Id {
        name: string;
        domain: number;
    }

    type NS = {
        String: string;
        u32: number;
        u64: number;
        Id: Id;
    };

    const IdOpts = defineStructCodec<NS, Id>([
        ['name', 'String'],
        ['domain', 'u64'],
    ]);

    IdOpts.decode(null, new Uint8Array());
}

// // import { ScaleCreateDefault, ScaleCreateFromVoid, ScaleDecoder, ScaleEncoder } from './core';
// // import { ScaleString, ScaleStringDecoder } from './string';

// // type MapKeys<T extends { [K in keyof T & string]: string }> = {
// //     [K in keyof T & string]: [T[K]];
// // };

// // type asdf = MapKeys<{
// //     foo: string;
// //     0: 412;
// //     // bar: number;
// // }>;

// // type StructTypesMapBase<T> = { [K in keyof T & string]: ScaleEncoder };

// export class Struct<T> implements ScaleEncoder {
//     private map!: Map<string, ScaleEncoder>;

//     get<K extends keyof T & string>(field: K): T[K] {
//         return this.get(field)!;
//     }

//     encode(): Uint8Array {
//         const bytes = [...this.map.entries()].map(([_key, value]) => value.encode());

//         // concat, size, etc

//         return new Uint8Array();
//     }

//     encodedLengthHint(): number {
//         return [...this.map.values()].reduce((prev, val) => prev + val.encodedLengthHint(), 0);
//     }
// }

// type StructDefinition<T> = {
//     [K in keyof T & string]: [K, T[K] extends ScaleDecoder<any> ? T[K] : never];
// }[keyof T & string][];

// type StructCreateFromHash<T> = {
//     [K in StructOptionalFields<T>]?: DirectOrDefault<T[K]>;
// } &
//     {
//         [K in StructRequiredFields<T>]: DirectOrDefault<T[K]>;
//     };

// type DirectOrDefault<T> = T extends ScaleDecoder<infer E>
//     ? E | (T extends ScaleCreateDefault<infer D, E> ? D : never)
//     : never;

// // здесь, возможно, придумать какие-то дополнительные интерфейсы, которые могут реализовывать
// // кодеки. Например, какие-то могут поддерживать:
// // - ScaleCreateFromVoid - такие поля могут опускаться
// // - ScaleCreateFromNumber - такие поля могут создаваться из сырых чисел JS
// // - ScaleCreateFromString - такие поля могут создаваться из сырых строк JS
// // - ScaleCreateDefault - универсальный конструктор из чего угодно. Может вместить в себя
// // number и string. Если декодер реализует интерфейс, то можно на поле подставлять
// // как само значение (энкодер), так и то, что принимает в себя default. Void - отдельный случай

// type StructRequiredFields<T> = {
//     [K in keyof T & string]: T[K] extends ScaleCreateFromVoid ? never : K;
// }[keyof T & string];

// type StructOptionalFields<T> = {
//     [K in keyof T & string]: T[K] extends ScaleCreateFromVoid ? K : never;
// }[keyof T & string];

// // type test = 'asdf' & never;

// // type afafa = StructCreateFromHash<IdStructFields>;

// // Struct constructor can decode raw scale data, create by hash and maybe, if there are no required fields,
// // create it from void
// type StructConstructor<T> = (StructRequiredFields<T> extends never ? ScaleCreateFromVoid<Struct<T>> : {}) &
//     ScaleDecoder<Struct<T>> &
//     ScaleCreateDefault<StructCreateFromHash<T>, Struct<T>>;

// export function createStructWith<T extends {}>(def: StructDefinition<T>): StructConstructor<T> {
//     return {
//         decode: () => new Struct(),
//         create: (obj) => new Struct(),
//         createFromVoid() {
//             return new Struct();
//         },
//     } as StructConstructor<T>;
// }

// type AAA = StructConstructor<IdStructFields>;

// // struct Id {
// //     name: String,
// //     domain_name: String
// // }

// interface IdStructFields {
//     name: ScaleDecoder<ScaleString> & ScaleCreateFromVoid<ScaleString>;
//     domainName: ScaleDecoder<ScaleString> &
//         // ScaleCreateFromVoid<ScaleString> &
//         ScaleCreateDefault<string | number[], ScaleString>;
// }

// // type afaf = StructDefinition<IdStructFields>;

// const Id = createStructWith<IdStructFields>([
//     ['name', ScaleStringDecoder],
//     ['domainName', ScaleStringDecoder],
// ]);

// Id.create({ domainName: 'hey' });

// // Id.decode().
