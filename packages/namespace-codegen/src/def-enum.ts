import { Enum, Valuable } from '@scale-codec/enum';
import {
    ArrayDef,
    EnumDef,
    MapDef,
    OptionDef,
    ResultDef,
    StructDef,
    TupleDef,
    TypeDef,
    VecDef,
    WithTMark,
} from './types';

export type DefEnum = Enum<{
    Alias: Valuable<string>;
    Array: Valuable<ArrayDef>;
    Vec: Valuable<VecDef>;
    Tuple: Valuable<TupleDef>;
    Struct: Valuable<StructDef>;
    Map: Valuable<MapDef>;
    Enum: Valuable<EnumDef>;
    EnumOption: Valuable<OptionDef>;
    EnumResult: Valuable<ResultDef>;
}>;

export function delMark<T extends WithTMark<{}, any>>(val: T): Omit<T, 't'> {
    const { t, ...rest } = val;
    return rest;
}

export function typeDefToEnum(def: TypeDef): DefEnum {
    if (typeof def === 'string') {
        return Enum.create('Alias', def);
    }
    if (def.t === 'array') {
        return Enum.create('Array', delMark(def));
    }
    if (def.t === 'vec') {
        return Enum.create('Vec', delMark(def));
    }
    if (def.t === 'tuple') {
        return Enum.create('Tuple', delMark(def));
    }
    if (def.t === 'struct') {
        return Enum.create('Struct', delMark(def));
    }
    if (def.t === 'map') {
        return Enum.create('Map', delMark(def));
    }
    if (def.t === 'enum') {
        return Enum.create('Enum', delMark(def));
    }
    if (def.t === 'option') {
        return Enum.create('EnumOption', delMark(def));
    }
    return Enum.create('EnumResult', delMark(def));
}
