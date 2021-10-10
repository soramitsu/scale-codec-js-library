export type NamespaceDefinition = Record<string, TypeDef>;

export type AliasDef = {
    ref: string;
};

export type ArrayDef = {
    item: string;
    len: number;
};

export type BytesArrayDef = {
    len: number;
};

export type VecDef = {
    item: string;
};

export type TupleDef = {
    items: string[];
};

export type StructDef = {
    fields: {
        name: string;
        ref: string;
    }[];
};

export type MapDef = {
    key: string;
    value: string;
};

export type SetDef = {
    entry: string;
};

export type EnumDef = {
    variants: EnumVariantDef[];
};

export type EnumVariantDef = {
    name: string;
    discriminant: number;
    ref?: string | null;
};

export type OptionDef = {
    some: string;
};

export type ResultDef = {
    ok: string;
    err: string;
};

export type WithTMark<T, M extends string> = T & {
    t: M;
};

export type TypeDef =
    | WithTMark<AliasDef, 'alias'>
    | WithTMark<ArrayDef, 'array'>
    | WithTMark<BytesArrayDef, 'bytes-array'>
    | WithTMark<VecDef, 'vec'>
    | WithTMark<TupleDef, 'tuple'>
    | WithTMark<StructDef, 'struct'>
    | WithTMark<MapDef, 'map'>
    | WithTMark<SetDef, 'set'>
    | WithTMark<EnumDef, 'enum'>
    | WithTMark<OptionDef, 'option'>
    | WithTMark<ResultDef, 'result'>;
