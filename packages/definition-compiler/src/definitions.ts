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

/**
 * Provides a possibility to define external types, e.g. to use some complex structure from another compiled namespace
 * OR to define your own custom low-level codec for type that is not included into the SCALE codec spec by default.
 *
 * Note that the external module **should contain the whole type interface**, e.g. the definition name + each of codec
 * prefixes: `External_encode`, `External_decode`, `External_Decoded` and `External_Encodable` (for the "External" type
 * name)
 */
export type ExternalDef = {
    /**
     * Where to import from, path
     * @example import { ... } from '<here is the module name>'
     */
    module: string;
    /**
     * Name of the type inside of the module. If this field is omitted, the own type name will be used
     *
     * @todo *define custom name for each import?*
     */
    nameInModule?: string;
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
    | WithTMark<ResultDef, 'result'>
    | WithTMark<ExternalDef, 'external'>;
